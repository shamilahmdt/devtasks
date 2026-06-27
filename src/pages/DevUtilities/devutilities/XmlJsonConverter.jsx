//This is an approach where JSON to XML conversion is 
// done only from JSON ie. Doesn't support XML -> JSON -> XML. 
// For implementing it we need to store the metadata of the 
// XML document for correct ordering.

import {useState} from "react"
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";


function parseXmlDoc(xmlString) {
  const doc = new DOMParser().parseFromString(xmlString, "application/xml");
  const errorNode = doc.querySelector("parsererror");
  //When using the XML parser with a string that doesn't 
  // represent well-formed XML, the XMLDocument returned by 
  // parseFromString will contain a <parsererror> node 
  // describing the nature of the parsing error.
  if (errorNode) throw new Error(errorNode.textContent.trim());
  return doc;
}

  // Converts a DOM Element and its entire descendant tree into a plain JS value.
 
  // Two-pass iterative approach (replaces the original recursive implementation):
 
  //  Pass 1 — DFS pre-order traversal with an explicit stack.
  //           Collects every element node into a flat array (parent before children).
  //           This never touches the call stack, so there is zero stack-overflow risk
  //           regardless of how deeply the XML is nested.
 
  //  Pass 2 — Reverse iteration of that array (leaves first, root last).
  //           Each element's value is computed and stored in a Map.
  //           When a parent is processed, all of its children are already resolved
  //           in the Map — no recursion needed.
 
  // Complexity:
  //  Time  — O(n)  where n = total Element nodes (each visited exactly twice).
  //   Space — O(n)  for the allElements array + valueMap (heap memory, not call stack).
 
  // Why Map instead of a plain object for grouping:
  //   1. O(1) average-case hash operations same as a plain object in V8,
  //      but Map has no prototype chain — tag names like "__proto__" or
  //      "constructor" cannot corrupt it.
  //   2. Iteration order is guaranteed insertion order (same as plain objects
  //      in modern JS, but Map makes it explicit).
 
function elementToValue(rootEl) {

  // Pass 1: collect all elements in DFS pre-order
  const allElements = [];           
  const explicitStack = [rootEl];   

  while (explicitStack.length > 0) {
    const el = explicitStack.pop();
    allElements.push(el);

    // Push children right-to-left so the leftmost child is popped first,
    // preserving document order in allElements.
    for (let i = el.children.length - 1; i >= 0; i--) {
      explicitStack.push(el.children[i]);
    }
  }

  //Pass 2: process in reverse pre-order (leaves first, root last)
  // Because allElements is parent-before-child, reversing it gives us
  // child-before-parent — i.e. every element's children are resolved in
  // valueMap before we get to the element itself.
  const valueMap = new Map(); // Map<Element, string | object>

  for (let i = allElements.length - 1; i >= 0; i--) {
    const el = allElements[i];

    const result = {};
    for (const attr of el.attributes) {
      result[`@${attr.name}`] = attr.value;
    }

    if (el.children.length === 0) {
      const text = el.textContent.trim();

      if (el.attributes.length === 0) {
        // Pure text element → store as a bare string, not an object.
        valueMap.set(el, text);
        continue;
      }

      if (text) result["#text"] = text;
      valueMap.set(el, result);
      continue;
    }

    //Internal node: group child elements by tag name
    //
    // Map<tagName, Element[]>
    // Using Map (not {}) to prevent prototype-chain pollution from
    // tag names that match Object.prototype properties (e.g. "__proto__").
    const groups = new Map();

    for (let j = 0; j < el.children.length; j++) {
      const child = el.children[j];
      const tag   = child.tagName;

      if (!groups.has(tag)) groups.set(tag, []);
      groups.get(tag).push(child); // O(1) amortised push
    }

    // Resolve each group from the already-computed valueMap
    for (const [tag, children] of groups) {
      result[tag] =
        children.length === 1
          ? valueMap.get(children[0])           // single child → its value directly
          : children.map(c => valueMap.get(c)); // repeated siblings → array of values
    }

    valueMap.set(el, result);
  }

  return valueMap.get(rootEl);
}

// Converts an XML string to a plain JS object. Throws on invalid XML
function xmlToJson(xmlString) {
  const doc = parseXmlDoc(xmlString); // throws if invalid
  const root = doc.documentElement;
  return { [root.tagName]: elementToValue(root) };
}

  // Builds a DOM element tree from a plain JS value.
  // Iterative BFS with an index-pointer queue (replaces the original recursion).
 
  // Why an index pointer instead of array.shift():
  //   array.shift() is O(n) per call — it physically moves every remaining element
  //   one slot left in memory. For n queue items that makes the total O(n²).
  //   Advancing a `head` index instead is O(1) per dequeue; the array stays put.
 
  // Queue item shape: { el: Element, value: any }
  //   el    — the already-created DOM element waiting to be populated.
  //   value — the JS value that describes what goes inside that element.
 
  // Complexity:
  //   Time  — O(n) where n = total nodes in the output XML tree.
  //   Space — O(n) for the queue (heap, not call stack).
 
function buildElement(doc, rootTagName, rootValue) {
  const rootEl = doc.createElement(rootTagName);
  if (rootValue === null || rootValue === undefined) return rootEl;

  //  BFS queue with index pointer
  const queue = [{ el: rootEl, value: rootValue }];
  let head = 0; // O(1) "dequeue": advance this pointer instead of calling shift()

  while (head < queue.length) {
    const { el, value } = queue[head++]; // O(1)

    // Primitive value → text node (base case)
    if (value === null || value === undefined || typeof value !== "object") {
      el.textContent = String(value ?? "");
      continue;
    }

    // Unexpected top-level array (safety net, should not reach here)
    if (Array.isArray(value)) {
      el.textContent = JSON.stringify(value);
      continue;
    }

    // Process each key in the JS object
    for (const [key, val] of Object.entries(value)) {

      if (key.startsWith("@")) {
        // "@attrName" → XML attribute on the current element.
        // Set immediately — no child element needed.
        el.setAttribute(key.slice(1), String(val));

      } else if (key === "#text") {
        // Text content stored alongside attributes → text node.
        el.appendChild(doc.createTextNode(String(val)));

      } else if (Array.isArray(val)) {
        // Array → repeated sibling elements with the same tag name.
        // Each item becomes its own child element; enqueue each for further processing.
        for (const item of val) {
          const childEl = doc.createElement(key);
          el.appendChild(childEl);
          queue.push({ el: childEl, value: item }); // O(1) push
        }

      } else {
        // Nested object or primitive → single child element.
        const childEl = doc.createElement(key);
        el.appendChild(childEl);
        queue.push({ el: childEl, value: val }); // O(1) push
      }
    }
  }

  return rootEl;
}

function jsonToXml(jsonString) {
  const parsed = JSON.parse(jsonString); // throws on bad JSON

  const rootKeys = Object.keys(parsed);
  if (rootKeys.length === 0) {
    throw new Error("JSON object must have at least one key to become an XML root element.");
  }
  if (rootKeys.length > 1) {
    throw new Error(
      `XML requires exactly one root element. Found ${rootKeys.length} root keys: ${rootKeys.join(", ")}.`
    );
  }

  const rootTag = rootKeys[0];
  const domDoc = document.implementation.createDocument("", "", null);
  domDoc.appendChild(buildElement(domDoc, rootTag, parsed[rootTag]));

  // XMLSerializer appends xmlns="" on elements with no namespace — strip it.
  return new XMLSerializer().serializeToString(domDoc).replace(/ xmlns=""/g, "");
}

  // Re-parses an XML string and returns it pretty-printed with 2-space indentation.
  // Also prepends an XML declaration.
  // Throws on invalid XML.
 
function prettyPrintXml(xmlString) {
  const doc = parseXmlDoc(xmlString);

  function serializeNode(node, depth) {
    const pad = "  ".repeat(depth);

    if (node.nodeType === Node.TEXT_NODE) return null;
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const attrs = Array.from(node.attributes)
      .map((a) => ` ${a.name}="${a.value}"`)
      .join("");

    const hasElementChildren = Array.from(node.childNodes).some(
      (c) => c.nodeType === Node.ELEMENT_NODE
    );


    if (!hasElementChildren && !node.textContent.trim()) {
      return `${pad}<${node.tagName}${attrs} />`;
    }

    if (!hasElementChildren) {
      return `${pad}<${node.tagName}${attrs}>${node.textContent.trim()}</${node.tagName}>`;
    }

    // Block: has child elements → recurse
    const children = Array.from(node.childNodes)
      .map((c) => serializeNode(c, depth + 1))
      .filter(Boolean);

    return [
      `${pad}<${node.tagName}${attrs}>`,
      ...children,
      `${pad}</${node.tagName}>`,
    ].join("\n");
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n${serializeNode(doc.documentElement, 0)}`;
}

//Normalises the raw text inside DOMParser's <parsererror> element.

function formatXmlParseError(rawMessage) {
  const firstLine = (rawMessage ?? "")
    .split("\n")
    .map((l) => l.trim())
    .find(Boolean);

  if (!firstLine) return "Invalid XML syntax.";

  // Chrome/Edge pattern
  const match = firstLine.match(/line\s+(\d+)\s+at\s+column\s+(\d+)[:\s]+(.+)/i);
  if (match) {
    return `${match[3].trim()} (line ${match[1]}, column ${match[2]})`;
  }

  return firstLine;
}

function formatJsonParseError(error, source) {
  const message = error instanceof Error ? error.message : "Invalid JSON syntax.";

  if (/line\s+\d+\s+column\s+\d+/i.test(message)) return message;

  const positionMatch = message.match(/position\s+(\d+)/i);
  if (!positionMatch) return message;

  const position = Number(positionMatch[1]);
  if (Number.isNaN(position)) return message;

  const beforeError = source.slice(0, position);
  const line = beforeError.split("\n").length;
  const column = beforeError.length - beforeError.lastIndexOf("\n");

  return `${message} (line ${line}, column ${column})`;
}


const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<config>
  <app>
    <name>DevTasks</name>
    <version>1.0.0</version>
    <environment>development</environment>
    <debug>true</debug>
  </app>
  <server>
    <host>localhost</host>
    <port>5173</port>
    <cors>
      <enabled>true</enabled>
      <origin>http://localhost:5173</origin>
      <origin>https://dev-tasks-beta.vercel.app</origin>
    </cors>
  </server>
  <features>
    <feature key="taskManagement" enabled="true" />
    <feature key="snippetVault" enabled="true" />
    <feature key="resourceHub" enabled="false" />
  </features>
  <limits>
    <maxUploadMb>10</maxUploadMb>
    <retryAttempts>3</retryAttempts>
  </limits>
</config>`;

const SAMPLE_JSON = JSON.stringify(
  {
    config: {
      app: {
        name: "DevTasks",
        version: "1.0.0",
        environment: "development",
        debug: "true",
      },
      server: {
        host: "localhost",
        port: "5173",
        cors: {
          enabled: "true",
          origin: [
            "http://localhost:5173",
            "https://dev-tasks-beta.vercel.app",
          ],
        },
      },
      features: {
        feature: [
          { "@key": "taskManagement", "@enabled": "true" },
          { "@key": "snippetVault",   "@enabled": "true"  },
          { "@key": "resourceHub",    "@enabled": "false" },
        ],
      },
      limits: {
        maxUploadMb:   "10",
        retryAttempts: "3",
      },
    },
  },
  null,
  2
);


const XmlJsonConverter = () => {
  const { dark } = useTheme();

  const [xmlText,    setXmlText]    = useState("");
  const [jsonText,   setJsonText]   = useState("");
  const [activePane, setActivePane] = useState("xml");
  const [error,      setError]      = useState(null);

  // Theme token map — identical shape to JsonYamlConverter for consistency
  const theme = {
    light: {
      page:          "bg-[#F7F7F7]",
      panel:         "bg-white border-neutral-200",
      input:         "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black",
      inputError:    "bg-neutral-50 border-red-400 text-black placeholder-neutral-400 focus:border-red-500 focus:ring-1 focus:ring-red-500",
      softButton:    "bg-white border-neutral-200 text-zinc-600 hover:text-black hover:border-neutral-400",
      primaryButton: "bg-black text-white border-black hover:bg-zinc-800",
      label:         "text-neutral-500 group-focus-within:text-black",
      errorBox:      "bg-red-50 border-red-200 text-red-700",
      errorLabel:    "text-red-800",
    },
    dark: {
      page:          "bg-zinc-950",
      panel:         "bg-zinc-900 border-zinc-800",
      input:         "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white",
      inputError:    "bg-zinc-950 border-red-500/70 text-white placeholder-zinc-700 focus:border-red-400 focus:ring-1 focus:ring-red-400",
      softButton:    "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500",
      primaryButton: "bg-white text-black border-white hover:bg-zinc-200",
      label:         "text-zinc-400 group-focus-within:text-white",
      errorBox:      "bg-red-950/30 border-red-900/70 text-red-200",
      errorLabel:    "text-red-100",
    },
  };

  const t = dark ? theme.dark : theme.light;
  const clearError = () => setError(null);

  const handleXmlChange = (value) => {
    setActivePane("xml");
    setXmlText(value);

    if (!value.trim()) {
      setJsonText("");
      clearError();
      return;
    }

    try {
      setJsonText(JSON.stringify(xmlToJson(value), null, 2));
      clearError();
    } catch (err) {
      // Leave jsonText untouched — other pane survives invalid input
      setError({
        pane:    "xml",
        title:   "Invalid XML",
        message: formatXmlParseError(err.message ?? ""),
      });
    }
  };

  const handleJsonChange = (value) => {
    setActivePane("json");
    setJsonText(value);

    if (!value.trim()) {
      setXmlText("");
      clearError();
      return;
    }

    //JSON syntax check
    let parsed;
    try {
      parsed = JSON.parse(value);
    } catch (err) {
      setError({
        pane:    "json",
        title:   "Invalid JSON",
        message: formatJsonParseError(err, value),
      });
      return;
    }

    //XML structure check (exactly one root key required)
    const rootKeys = Object.keys(parsed);
    if (rootKeys.length === 0 || rootKeys.length > 1) {
      setError({
        pane:  "json",
        title: "XML Structure Error",
        message:
          rootKeys.length === 0
            ? "JSON object must have at least one key for XML conversion."
            : `XML requires exactly one root element. Found ${rootKeys.length} root keys: ${rootKeys.join(", ")}.`,
      });
      return;
    }

    //convert and pretty-print
    try {
      setXmlText(prettyPrintXml(jsonToXml(value)));
      clearError();
    } catch (err) {
      setError({
        pane:    "json",
        title:   "Conversion Error",
        message: err.message ?? "Could not convert JSON to XML.",
      });
    }
  };

  const handleSample = () => {
    setXmlText(SAMPLE_XML);
    setJsonText(SAMPLE_JSON);
    clearError();
  };

  const handleFormat = () => {
    if (activePane === "xml") {
      if (!xmlText.trim()) return;
      try {
        // prettyPrintXml re-parses and re-serialises → throws if XML is invalid
        const formatted = prettyPrintXml(xmlText);
        // Pass through handleXmlChange so JSON pane re-syncs automatically
        handleXmlChange(formatted);
        toast.success("Formatted successfully");
      } catch (err) {
        setError({
          pane:    "xml",
          title:   "Invalid XML",
          message: formatXmlParseError(err.message ?? ""),
        });
        toast.error("Fix syntax errors before formatting");
      }
    } else {
      if (!jsonText.trim()) return;
      try {
        const formatted = JSON.stringify(JSON.parse(jsonText), null, 2);
        // Pass through handleJsonChange so XML pane re-syncs automatically
        handleJsonChange(formatted);
        toast.success("Formatted successfully");
      } catch (err) {
        setError({
          pane:    "json",
          title:   "Invalid JSON",
          message: formatJsonParseError(err, jsonText),
        });
        toast.error("Fix syntax errors before formatting");
      }
    }
  };

  const handleCopy = async (value, label) => {
    if (!value.trim()) {
      toast.error(`No ${label} to copy`);
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error(`Failed to copy ${label}`);
    }
  };

  const handleClear = () => {
    setXmlText("");
    setJsonText("");
    setActivePane("xml");
    clearError();
  };


  const actions = [
    { label: "Sample Data",       onClick: handleSample, primary: true },
    { label: "Format / Beautify", onClick: handleFormat               },
    { label: "Clear",             onClick: handleClear                },
  ];


  const renderEditor = ({ pane, label, value, onChange, placeholder }) => {
    const hasError = error?.pane === pane;

    return (
      <section className="group flex min-h-0 flex-col gap-3">
        <div className="flex min-h-8 flex-wrap items-center justify-between gap-3">
          <label
            className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${t.label}`}
          >
            {label}
          </label>
          <button
            type="button"
            onClick={() => handleCopy(value, label)}
            className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.softButton}`}
          >
            Copy
          </button>
        </div>

        <textarea
          value={value}
          onFocus={() => setActivePane(pane)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          className={`min-h-[320px] lg:min-h-[460px] w-full flex-1 resize-none rounded-2xl border px-4 py-3 font-mono text-sm leading-6 outline-none transition-all duration-300 ${
            hasError ? t.inputError : t.input
          }`}
        />
      </section>
    );
  };

  return (
    <div
      className={`min-h-[calc(100vh-76px)] px-4 py-6 transition-colors duration-300 sm:px-6 ${t.page}`}
    >
      <title>XML JSON Converter - DevTasks</title>
      <meta
        name="description"
        content="Convert XML to JSON and JSON to XML in real time with live syntax validation. Works completely offline."
      />

      <div
        className={`mx-auto flex w-full max-w-7xl flex-col overflow-hidden rounded-3xl border shadow-xl transition-colors duration-300 ${t.panel}`}
      >
        <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

        <header className="flex flex-col gap-5 px-5 pt-6 sm:px-8 sm:pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/devutilities"
              className={`flex shrink-0 items-center justify-center rounded-xl border p-2.5 transition-all duration-200 active:scale-95 ${t.softButton}`}
              title="Back to Dev Utilities"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div>
              <h1
                className={`text-xl font-black uppercase tracking-tight transition-colors duration-300 sm:text-2xl ${
                  dark ? "text-white" : "text-black"
                }`}
              >
                XML ↔ JSON Converter
              </h1>
              <p
                className={`mt-1 text-sm font-medium ${
                  dark ? "text-zinc-500" : "text-neutral-500"
                }`}
              >
                Active pane:{" "}
                <span className={dark ? "text-zinc-300" : "text-zinc-700"}>
                  {activePane === "xml" ? "XML" : "JSON"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${
                  action.primary ? t.primaryButton : t.softButton
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </header>

        <main className="flex flex-col gap-5 p-5 sm:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {renderEditor({
              pane:        "xml",
              label:       "XML",
              value:       xmlText,
              onChange:    handleXmlChange,
              placeholder: `<config>\n  <app>\n    <name>DevTasks</name>\n  </app>\n</config>`,
            })}

            {renderEditor({
              pane:        "json",
              label:       "JSON",
              value:       jsonText,
              onChange:    handleJsonChange,
              placeholder: `{\n  "config": {\n    "app": {\n      "name": "DevTasks"\n    }\n  }\n}`,
            })}
          </div>

          {error && (
            <div
              className={`rounded-2xl border px-4 py-3 font-mono text-sm transition-colors duration-300 ${t.errorBox}`}
              role="alert"
              aria-live="polite"
            >
              <span
                className={`mr-2 font-black uppercase tracking-widest ${t.errorLabel}`}
              >
                {error.title}:
              </span>
              {error.message}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default XmlJsonConverter;