import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

/*
 * Cookie & Set-Cookie Inspector
 *
 * Parses `Cookie` request headers and `Set-Cookie` response headers, explains
 * every attribute, and flags common security / spec problems based on
 * RFC 6265bis and current browser behaviour. Everything runs locally in the
 * browser — cookie data is never sent anywhere.
 */

const EXAMPLE_INPUT = `Set-Cookie: session_id=a3fWa9x2; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=86400
Set-Cookie: __Host-csrf=7d1c0e; Path=/; Secure; SameSite=Strict
Set-Cookie: tracking=xyz%20123; Domain=.example.com; Expires=Wed, 21 Oct 2015 07:28:00 GMT; SameSite=None
Set-Cookie: __Host-prefs=dark; Domain=example.com; Path=/app; Secure
Set-Cookie: embed_state=1; Secure; Partitioned; SameSite=None; Path=/
Cookie: theme=dark; lang=en-US; session_id=a3fWa9x2`;

const LEVELS = {
  error: { label: "Error", symbol: "✕", order: 0 },
  warning: { label: "Warning", symbol: "!", order: 1 },
  info: { label: "Info", symbol: "i", order: 2 },
};

const KNOWN_ATTRIBUTES = [
  "expires",
  "max-age",
  "domain",
  "path",
  "secure",
  "httponly",
  "samesite",
  "partitioned",
  "priority",
];
const SET_COOKIE_PREFIX = /^set-cookie\s*:\s*/i;
const COOKIE_PREFIX = /^cookie\s*:\s*/i;
const ATTRIBUTE_HINT = new RegExp(`;\\s*(${KNOWN_ATTRIBUTES.join("|")})\\b`, "i");
// RFC 7230 "token" characters — the only characters allowed in a cookie name.
const TOKEN_NAME = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
// Heuristic for session/auth cookies. CSRF tokens are excluded because the
// double-submit pattern needs them to be readable from JavaScript.
const SESSION_LIKE_NAME = /sess|(^|[_.-])sid$|auth|jwt|remember|(access|refresh|id)[_-]?token/i;
const CSRF_NAME = /csrf|xsrf/i;
const MAX_COOKIE_BYTES = 4096;
const MAX_LIFETIME_SECONDS = 400 * 24 * 60 * 60;

const byteLength = (text) => new TextEncoder().encode(text).length;

const hasControlChars = (text) =>
  [...text].some((char) => {
    const code = char.charCodeAt(0);
    return code < 32 || code === 127;
  });

const stripQuotes = (value) =>
  value.length >= 2 && value.startsWith('"') && value.endsWith('"')
    ? value.slice(1, -1)
    : value;

const decodeValue = (value) => {
  if (!value.includes("%")) return { decoded: value, malformed: false };
  try {
    return { decoded: decodeURIComponent(value), malformed: false };
  } catch {
    return { decoded: value, malformed: true };
  }
};

const sortIssues = (issues) =>
  issues.sort((a, b) => LEVELS[a.level].order - LEVELS[b.level].order);

const formatDuration = (totalSeconds) => {
  const seconds = Math.abs(Math.round(totalSeconds));
  if (seconds < 60) return `${seconds}s`;
  const units = [
    ["d", 86400],
    ["h", 3600],
    ["m", 60],
    ["s", 1],
  ];
  const parts = [];
  let remaining = seconds;
  for (const [unit, size] of units) {
    const amount = Math.floor(remaining / size);
    if (amount > 0) {
      parts.push(`${amount}${unit}`);
      remaining -= amount * size;
    }
    if (parts.length === 2) break;
  }
  return parts.join(" ");
};

const splitPair = (segment) => {
  const index = segment.indexOf("=");
  if (index === -1) return { name: "", value: segment.trim(), hasEquals: false };
  return {
    name: segment.slice(0, index).trim(),
    value: segment.slice(index + 1).trim(),
    hasEquals: true,
  };
};

// Parses the leading name=value pair and runs the checks shared by Cookie and
// Set-Cookie headers.
const parseNameValue = (segment, add) => {
  const { name, value: rawValue, hasEquals } = splitPair(segment);

  if (!hasEquals) {
    add("warning", `"${segment}" has no "=" separator. Browsers treat it as a nameless cookie with this value.`);
  } else if (!name) {
    add("warning", "Cookie has no name. Browsers accept it, but nameless cookies are easy to overwrite and hard to debug.");
  } else if (!TOKEN_NAME.test(name)) {
    add("warning", `Name "${name}" contains characters that are not allowed in a cookie name (spaces, separators or non-ASCII).`);
  }

  const value = stripQuotes(rawValue);
  if (/[\s",;\\]/.test(value) || hasControlChars(value)) {
    add("warning", "Value contains whitespace, quotes, commas, semicolons, backslashes or control characters. URL-encode the value to keep it portable.");
  }
  if (byteLength(name + value) > MAX_COOKIE_BYTES) {
    add("warning", `Name + value exceed ${MAX_COOKIE_BYTES} bytes. Browsers will reject this cookie.`);
  }

  const { decoded, malformed } = decodeValue(value);
  if (malformed) {
    add("info", "Value contains malformed percent-encoding and could not be URL-decoded.");
  }

  return { name, value, decoded, hasEquals };
};

const parseCookieHeader = (header, line) => {
  const seenNames = new Set();

  return header
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const issues = [];
      const add = (level, message) => issues.push({ level, message });
      const { name, value, decoded, hasEquals } = parseNameValue(segment, add);

      const possibleAttribute = hasEquals ? name : segment;
      if (KNOWN_ATTRIBUTES.includes(possibleAttribute.toLowerCase())) {
        add("warning", `"${possibleAttribute}" looks like a Set-Cookie attribute. Attributes are never sent in a Cookie request header — did you mean to inspect a Set-Cookie header?`);
      }
      if (seenNames.has(name)) {
        add("info", `Duplicate name "${name}". Browsers send one entry per matching Domain/Path, and servers usually read only the first.`);
      }
      seenNames.add(name);

      return {
        kind: "cookie",
        line,
        raw: segment,
        name,
        value,
        decoded,
        attributes: null,
        lifetime: null,
        issues: sortIssues(issues),
      };
    });
};

const parseSetCookie = (header, line) => {
  const [first, ...attributeSegments] = header.split(";");
  if (!first.trim()) {
    return {
      error: `Line ${line}: missing the leading name=value pair, so the Set-Cookie header would be ignored.`,
    };
  }

  const issues = [];
  const add = (level, message) => issues.push({ level, message });
  const { name, value, decoded } = parseNameValue(first.trim(), add);

  const attributes = {
    domain: null,
    path: null,
    expires: null,
    maxAge: null,
    sameSite: null,
    secure: false,
    httpOnly: false,
    partitioned: false,
    priority: null,
    unknown: [],
  };
  const seenAttributes = new Set();
  const repeatedAttributes = new Set();
  let expiresDate = null;
  let maxAgeSeconds = null;

  attributeSegments.forEach((segment) => {
    const trimmed = segment.trim();
    if (!trimmed) return;
    const { name: key, value: attrValue, hasEquals } = splitPair(trimmed);
    const attrName = hasEquals ? key : trimmed;
    const lower = attrName.toLowerCase();

    if (seenAttributes.has(lower) && KNOWN_ATTRIBUTES.includes(lower) && !repeatedAttributes.has(lower)) {
      repeatedAttributes.add(lower);
      add("info", `"${attrName}" is set more than once. Browsers use the last occurrence.`);
    }
    seenAttributes.add(lower);

    switch (lower) {
      case "expires": {
        attributes.expires = attrValue;
        const timestamp = Date.parse(attrValue);
        expiresDate = Number.isNaN(timestamp) ? null : new Date(timestamp);
        if (!expiresDate) {
          add("warning", `Expires value "${attrValue}" is not a valid date and will be ignored. Use the format "Wed, 21 Oct 2026 07:28:00 GMT".`);
        }
        break;
      }
      case "max-age":
        attributes.maxAge = attrValue;
        maxAgeSeconds = /^-?\d+$/.test(attrValue) ? Number(attrValue) : null;
        if (maxAgeSeconds === null) {
          add("warning", `Max-Age value "${attrValue}" is not an integer number of seconds and will be ignored.`);
        }
        break;
      case "domain": {
        attributes.domain = attrValue;
        const domain = attrValue.replace(/^\./, "");
        if (!domain) {
          add("warning", "Domain is empty and will be ignored. The cookie becomes host-only.");
        } else if (/[\s/:]/.test(domain)) {
          add("error", `Domain "${attrValue}" must be a bare host name (no scheme, port or path). Browsers will reject this cookie.`);
        } else {
          add("info", `Domain is set, so the cookie is also sent to every subdomain of ${domain}. Omit Domain to keep it host-only.`);
        }
        break;
      }
      case "path":
        attributes.path = attrValue;
        if (!attrValue.startsWith("/")) {
          add("warning", `Path "${attrValue}" does not start with "/" and will be replaced by the default path of the request URL.`);
        }
        break;
      case "secure":
        attributes.secure = true;
        break;
      case "httponly":
        attributes.httpOnly = true;
        break;
      case "partitioned":
        attributes.partitioned = true;
        break;
      case "samesite": {
        const valid = { strict: "Strict", lax: "Lax", none: "None" };
        attributes.sameSite = valid[attrValue.toLowerCase()] || attrValue || "(empty)";
        if (!valid[attrValue.toLowerCase()]) {
          add("warning", `SameSite value "${attrValue}" is not Strict, Lax or None and will be ignored, as if SameSite were not set.`);
        }
        break;
      }
      case "priority":
        attributes.priority = attrValue;
        if (!/^(low|medium|high)$/i.test(attrValue)) {
          add("info", `Priority "${attrValue}" is not Low, Medium or High (a non-standard, Chromium-only attribute).`);
        }
        break;
      default:
        attributes.unknown.push(trimmed);
        add("info", `Unknown attribute "${attrName}" will be ignored by browsers.`);
    }
  });

  // Prefix rules (browsers compare prefixes case-insensitively).
  const lowerName = name.toLowerCase();
  const hasSecurePrefix = lowerName.startsWith("__secure-");
  const hasHostPrefix = lowerName.startsWith("__host-");
  if (hasSecurePrefix && !attributes.secure) {
    add("error", "Cookies with the __Secure- prefix must have the Secure attribute. Browsers will reject this cookie.");
  }
  if (hasHostPrefix) {
    const problems = [];
    if (!attributes.secure) problems.push("have Secure");
    if (attributes.domain !== null) problems.push("have no Domain attribute");
    if (attributes.path !== "/") problems.push("use Path=/");
    if (problems.length) {
      add("error", `Cookies with the __Host- prefix must ${problems.join(" and ")}. Browsers will reject this cookie.`);
    }
  }

  if (attributes.sameSite === "None" && !attributes.secure) {
    add("error", "SameSite=None requires the Secure attribute. Chromium-based browsers reject this cookie.");
  }
  if (attributes.partitioned && !attributes.secure) {
    add("error", "Partitioned (CHIPS) cookies must also have the Secure attribute, otherwise they are rejected.");
  }
  if (!attributes.secure && !hasSecurePrefix && !hasHostPrefix) {
    add("info", "Secure is not set, so the cookie can be sent over unencrypted HTTP.");
  }
  if (!attributes.httpOnly && SESSION_LIKE_NAME.test(name) && !CSRF_NAME.test(name)) {
    add("warning", `"${name}" looks like a session or auth cookie but is missing HttpOnly, so JavaScript (and XSS payloads) can read it.`);
  }
  if (attributes.sameSite === null) {
    add("info", "SameSite is not set. Chromium-based browsers default to Lax, while Firefox and Safari currently default to None. Set it explicitly.");
  }

  // Lifetime: Max-Age takes precedence over Expires.
  let lifetime = "Session cookie (deleted when the browser closes)";
  let lifetimeSeconds = null;
  if (maxAgeSeconds !== null) {
    if (expiresDate) {
      add("info", "Both Max-Age and Expires are set. Max-Age takes precedence.");
    }
    lifetimeSeconds = maxAgeSeconds;
    lifetime =
      maxAgeSeconds <= 0
        ? "Expires immediately (deletes the cookie)"
        : `Expires in ${formatDuration(maxAgeSeconds)}`;
  } else if (expiresDate) {
    lifetimeSeconds = (expiresDate.getTime() - Date.now()) / 1000;
    lifetime =
      lifetimeSeconds > 0
        ? `Expires in ${formatDuration(lifetimeSeconds)} (${expiresDate.toUTCString()})`
        : `Already expired ${formatDuration(lifetimeSeconds)} ago — this deletes the cookie`;
  }
  if (lifetimeSeconds !== null && lifetimeSeconds > MAX_LIFETIME_SECONDS) {
    add("warning", "Lifetime is longer than 400 days. RFC 6265bis browsers such as Chrome cap it at 400 days.");
  }

  return {
    cookie: {
      kind: "set-cookie",
      line,
      raw: header.trim(),
      name,
      value,
      decoded,
      attributes,
      lifetime,
      issues: sortIssues(issues),
    },
  };
};

const analyzeInput = (input, mode) => {
  const cookies = [];
  const lineErrors = [];

  input.split(/\r?\n/).forEach((rawLine, index) => {
    const lineNumber = index + 1;
    let line = rawLine.trim();
    if (!line) return;

    let kind = mode;
    if (SET_COOKIE_PREFIX.test(line)) {
      kind = "set-cookie";
      line = line.replace(SET_COOKIE_PREFIX, "");
    } else if (COOKIE_PREFIX.test(line)) {
      kind = "cookie";
      line = line.replace(COOKIE_PREFIX, "");
    } else if (mode === "auto") {
      kind = ATTRIBUTE_HINT.test(line) ? "set-cookie" : "cookie";
    }

    if (!line.trim()) {
      lineErrors.push(`Line ${lineNumber}: header name found but the value is empty.`);
    } else if (kind === "set-cookie") {
      const result = parseSetCookie(line, lineNumber);
      if (result.error) lineErrors.push(result.error);
      else cookies.push(result.cookie);
    } else {
      cookies.push(...parseCookieHeader(line, lineNumber));
    }
  });

  return { cookies, lineErrors };
};

const DEFAULT_BUILDER = {
  name: "",
  value: "",
  encodeValue: true,
  domain: "",
  path: "/",
  expiryMode: "session",
  maxAge: "3600",
  expires: "",
  sameSite: "Lax",
  secure: true,
  httpOnly: true,
  partitioned: false,
};

const buildSetCookie = (b) => {
  if (!b.name.trim()) return "";
  const value = b.encodeValue ? encodeURIComponent(b.value) : b.value;
  const parts = [`${b.name.trim()}=${value}`];
  if (b.domain.trim()) parts.push(`Domain=${b.domain.trim()}`);
  if (b.path.trim()) parts.push(`Path=${b.path.trim()}`);
  if (b.expiryMode === "max-age" && b.maxAge.trim()) parts.push(`Max-Age=${b.maxAge.trim()}`);
  if (b.expiryMode === "expires" && b.expires) {
    const date = new Date(b.expires);
    if (!Number.isNaN(date.getTime())) parts.push(`Expires=${date.toUTCString()}`);
  }
  if (b.sameSite) parts.push(`SameSite=${b.sameSite}`);
  if (b.secure) parts.push("Secure");
  if (b.httpOnly) parts.push("HttpOnly");
  if (b.partitioned) parts.push("Partitioned");
  return parts.join("; ");
};

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

const TABS = [
  { id: "inspect", label: "Inspect" },
  { id: "build", label: "Build" },
];

export default function CookieInspector() {
  const { dark } = useTheme();
  const [activeTab, setActiveTab] = useState("inspect");
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("auto");
  const [builder, setBuilder] = useState(DEFAULT_BUILDER);
  const tabRefs = useRef({});

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      card: "bg-white border-zinc-250/90 shadow-sm",
      headerBorder: "border-zinc-200",
      input: "bg-white border-zinc-250 text-zinc-900 focus:border-zinc-900 placeholder-zinc-400 focus:bg-white",
      buttonPrimary: "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]",
      buttonSecondary: "bg-white border-zinc-250 text-zinc-700 hover:bg-zinc-50 active:scale-[0.98]",
      label: "text-zinc-500",
      outputPre: "bg-[#F9FAFB] border-zinc-200 text-emerald-700",
      panel: "bg-[#F9FAFB] border-zinc-200",
      tabList: "border-zinc-200 bg-zinc-50",
      tabActive: "bg-zinc-900 text-white shadow-sm",
      tagOn: "bg-zinc-900 border-zinc-900 text-white",
      tagOff: "bg-white border-zinc-200 text-zinc-400",
      focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
      level: {
        error: "border-red-200 bg-red-50 text-red-700",
        warning: "border-amber-200 bg-amber-50 text-amber-800",
        info: "border-zinc-200 bg-white text-zinc-600",
      },
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      card: "bg-zinc-900/50 border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.4)]",
      headerBorder: "border-zinc-800/85",
      input: "bg-zinc-950/60 border-zinc-800 text-white focus:border-zinc-500 placeholder-zinc-600 focus:bg-zinc-950",
      buttonPrimary: "bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.98]",
      buttonSecondary: "bg-zinc-900 border-zinc-800/80 text-zinc-300 hover:bg-zinc-850 active:scale-[0.98]",
      label: "text-zinc-400",
      outputPre: "bg-zinc-950/80 border-zinc-800/80 text-emerald-400",
      panel: "bg-zinc-950/60 border-zinc-800/80",
      tabList: "border-zinc-800 bg-zinc-950",
      tabActive: "bg-white text-zinc-950 shadow-sm",
      tagOn: "bg-white border-white text-zinc-950",
      tagOff: "bg-zinc-950 border-zinc-800 text-zinc-500",
      focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
      level: {
        error: "border-red-900/60 bg-red-950/30 text-red-300",
        warning: "border-amber-900/60 bg-amber-950/30 text-amber-300",
        info: "border-zinc-800 bg-zinc-950/60 text-zinc-400",
      },
    },
  };
  const t = dark ? theme.dark : theme.light;

  const secondaryButton = `px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${t.buttonSecondary} ${t.focus}`;
  const primaryButton = `px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${t.buttonPrimary} ${t.focus}`;
  const fieldLabel = `text-[10px] font-black uppercase tracking-widest ${t.label}`;
  const fieldInput = `w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all duration-200 ${t.input}`;

  const { cookies, lineErrors } = useMemo(() => analyzeInput(input, mode), [input, mode]);

  const counts = useMemo(() => {
    const result = { error: 0, warning: 0, info: 0 };
    cookies.forEach((cookie) =>
      cookie.issues.forEach((issue) => {
        result[issue.level] += 1;
      })
    );
    return result;
  }, [cookies]);

  const builtHeader = useMemo(() => buildSetCookie(builder), [builder]);
  const builderIssues = useMemo(
    () => (builtHeader ? parseSetCookie(builtHeader, 1).cookie.issues : []),
    [builtHeader]
  );

  const copyText = async (text, successMessage) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleCopyJson = () => {
    const data = cookies.map(({ kind, line, name, value, decoded, attributes, lifetime, issues }) => ({
      type: kind === "set-cookie" ? "Set-Cookie" : "Cookie",
      line,
      name,
      value,
      ...(decoded !== value && { decodedValue: decoded }),
      ...(attributes && { attributes, lifetime }),
      issues,
    }));
    copyText(JSON.stringify(data, null, 2), "Parsed cookies copied as JSON");
  };

  const handleReset = () => {
    setInput("");
    setMode("auto");
  };

  const handleLoadExample = () => {
    setInput(EXAMPLE_INPUT);
    setMode("auto");
  };

  const updateBuilder = (field, value) =>
    setBuilder((prev) => ({ ...prev, [field]: value }));

  const sendToInspector = () => {
    setInput(`Set-Cookie: ${builtHeader}`);
    setMode("auto");
    setActiveTab("inspect");
    tabRefs.current.inspect?.focus();
  };

  // Arrow-key navigation between tabs (WAI-ARIA tabs pattern).
  const handleTabKeyDown = (event) => {
    const index = TABS.findIndex((tab) => tab.id === activeTab);
    const targets = {
      ArrowRight: TABS[(index + 1) % TABS.length],
      ArrowLeft: TABS[(index - 1 + TABS.length) % TABS.length],
      Home: TABS[0],
      End: TABS[TABS.length - 1],
    };
    const next = targets[event.key];
    if (next) {
      event.preventDefault();
      setActiveTab(next.id);
      tabRefs.current[next.id]?.focus();
    }
  };

  const sectionHeader = (title, actions) => (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
      <h2 className="text-xs font-black uppercase tracking-[0.2em]">{title}</h2>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </div>
  );

  const renderIssues = (issues) =>
    issues.length === 0 ? (
      <p className={`text-xs font-semibold ${t.label}`}>No issues found.</p>
    ) : (
      <ul className="flex flex-col gap-2">
        {issues.map((issue, index) => (
          <li
            key={index}
            className={`flex items-start gap-2.5 rounded-xl border px-3 py-2 text-xs font-medium leading-relaxed ${t.level[issue.level]}`}
          >
            <span
              aria-hidden="true"
              className="mt-px inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current text-[9px] font-black"
            >
              {LEVELS[issue.level].symbol}
            </span>
            <span>
              <span className="font-black uppercase tracking-wider text-[10px] mr-1.5">
                {LEVELS[issue.level].label}
              </span>
              {issue.message}
            </span>
          </li>
        ))}
      </ul>
    );

  const renderFlag = (label, enabled) => (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${enabled ? t.tagOn : t.tagOff}`}
    >
      <span aria-hidden="true">{enabled ? "✓" : "—"}</span>
      {label}
      <span className="sr-only">{enabled ? "enabled" : "not set"}</span>
    </span>
  );

  const renderAttribute = (label, value) => (
    <div className="flex flex-col gap-1 min-w-0">
      <dt className={fieldLabel}>{label}</dt>
      <dd className="font-mono text-xs break-all">
        {value === null || value === "" ? <span className={t.label}>—</span> : value}
      </dd>
    </div>
  );

  const renderCookie = (cookie, index) => {
    const a = cookie.attributes;
    const displayName = cookie.name || "(no name)";
    return (
      <article
        key={`${cookie.line}-${index}`}
        className={`rounded-2xl border p-4 sm:p-5 flex flex-col gap-4 ${t.panel}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex flex-wrap items-center gap-2">
            <h3 className={`font-mono text-sm font-bold break-all ${cookie.name ? "" : t.label}`}>
              {displayName}
            </h3>
            <span
              className={`px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest ${t.tagOff}`}
            >
              {cookie.kind === "set-cookie" ? "Set-Cookie" : "Cookie"} · Line {cookie.line}
            </span>
          </div>
          <button
            type="button"
            onClick={() => copyText(cookie.raw, "Cookie copied")}
            className={secondaryButton}
            aria-label={`Copy cookie ${displayName}`}
          >
            Copy
          </button>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {renderAttribute("Value", cookie.value)}
          {cookie.decoded !== cookie.value && renderAttribute("Decoded Value", cookie.decoded)}
        </dl>

        {a && (
          <>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderAttribute("Domain", a.domain === null ? "Host-only" : a.domain)}
              {renderAttribute("Path", a.path)}
              {renderAttribute("Expires", a.expires)}
              {renderAttribute("Max-Age", a.maxAge)}
              {renderAttribute("SameSite", a.sameSite === null ? "Not set" : a.sameSite)}
              {renderAttribute("Priority", a.priority)}
              <div className="sm:col-span-2 flex flex-col gap-1 min-w-0">
                <dt className={fieldLabel}>Lifetime</dt>
                <dd className="text-xs font-semibold">{cookie.lifetime}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              {renderFlag("Secure", a.secure)}
              {renderFlag("HttpOnly", a.httpOnly)}
              {renderFlag("Partitioned", a.partitioned)}
            </div>
          </>
        )}

        <div className="flex flex-col gap-2">
          <h4 className={fieldLabel}>Findings</h4>
          {renderIssues(cookie.issues)}
        </div>
      </article>
    );
  };

  const textField = (field, label, placeholder, type = "text") => (
    <div className="flex flex-col gap-2">
      <label htmlFor={`builder-${field}`} className={fieldLabel}>{label}</label>
      <input
        id={`builder-${field}`}
        type={type}
        value={builder[field]}
        onChange={(e) => updateBuilder(field, e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className={`${fieldInput} font-mono`}
      />
    </div>
  );

  const selectField = (field, label, options) => (
    <div className="flex flex-col gap-2">
      <label htmlFor={`builder-${field}`} className={fieldLabel}>{label}</label>
      <select
        id={`builder-${field}`}
        value={builder[field]}
        onChange={(e) => updateBuilder(field, e.target.value)}
        className={`${fieldInput} cursor-pointer`}
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>{text}</option>
        ))}
      </select>
    </div>
  );

  const checkbox = (field, label, hint) => (
    <label className="flex items-start gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={builder[field]}
        onChange={(e) => updateBuilder(field, e.target.checked)}
        className={`mt-0.5 h-4 w-4 cursor-pointer rounded ${dark ? "accent-white" : "accent-zinc-900"} ${t.focus}`}
      />
      <span className="flex flex-col">
        <span className="text-xs font-bold">{label}</span>
        <span className={`text-[10px] font-medium ${t.label}`}>{hint}</span>
      </span>
    </label>
  );

  const summary =
    cookies.length === 0 && lineErrors.length === 0
      ? "No cookies parsed yet."
      : [
          plural(cookies.length, "cookie"),
          plural(counts.error, "error"),
          plural(counts.warning, "warning"),
          `${counts.info} info`,
          ...(lineErrors.length ? [plural(lineErrors.length, "parse error")] : []),
        ].join(" · ");

  return (
    <div
      className={`min-h-[calc(100vh-76px)] px-4 py-8 flex items-start justify-center transition-colors duration-300 ${t.wrapper}`}
    >
      <div
        className={`w-full max-w-5xl rounded-3xl border overflow-hidden transition-all duration-300 ${t.card}`}
      >
        <div className={`flex items-center gap-4 p-5 border-b ${t.headerBorder}`}>
          <Link
            to="/devutilities"
            className={`w-10 h-10 shrink-0 border rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-200 ${t.buttonSecondary} ${t.focus}`}
            title="Back to Utilities"
            aria-label="Back to Utilities"
          >
            ←
          </Link>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">
              Cookie & Set-Cookie Inspector
            </h1>
            <p className={`text-xs font-semibold mt-0.5 ${t.label}`}>
              Parse Cookie and Set-Cookie headers, explain every attribute, and
              catch security issues — fully offline.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 p-6">
          <div
            role="tablist"
            aria-label="Cookie tool mode"
            className={`flex w-fit rounded-xl border p-1 ${t.tabList}`}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                type="button"
                role="tab"
                id={`cookie-tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`cookie-panel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={handleTabKeyDown}
                className={`rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${t.focus} ${activeTab === tab.id ? t.tabActive : "text-zinc-500"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "inspect" && (
            <div
              role="tabpanel"
              id="cookie-panel-inspect"
              aria-labelledby="cookie-tab-inspect"
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-4">
                {sectionHeader(
                  "Input",
                  <>
                    <button type="button" onClick={handleLoadExample} className={secondaryButton}>
                      Load Example
                    </button>
                    <button type="button" onClick={handleReset} className={secondaryButton}>
                      Reset
                    </button>
                  </>
                )}

                <div className="flex flex-col gap-2 sm:max-w-xs">
                  <label htmlFor="cookie-input-mode" className={fieldLabel}>
                    Header Type
                  </label>
                  <select
                    id="cookie-input-mode"
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className={`${fieldInput} cursor-pointer`}
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="cookie">Cookie (request header)</option>
                    <option value="set-cookie">Set-Cookie (response header)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="cookie-input" className={fieldLabel}>
                    Headers
                  </label>
                  <textarea
                    id="cookie-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    spellCheck={false}
                    autoComplete="off"
                    aria-describedby="cookie-input-hint"
                    placeholder={"Set-Cookie: id=abc123; Path=/; Secure; HttpOnly; SameSite=Lax\nCookie: theme=dark; lang=en"}
                    className={`w-full min-h-[160px] px-4 py-3 rounded-xl border font-mono text-xs leading-relaxed outline-none transition-all duration-200 resize-y ${t.input}`}
                  />
                  <p id="cookie-input-hint" className={`text-[10px] font-medium ${t.label}`}>
                    Paste one Set-Cookie header per line, or a Cookie header. The
                    "Set-Cookie:" / "Cookie:" prefix is optional.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {sectionHeader(
                  "Results",
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    disabled={cookies.length === 0}
                    className={primaryButton}
                  >
                    Copy JSON
                  </button>
                )}

                <p aria-live="polite" className={`text-xs font-bold ${t.label}`}>
                  {summary}
                </p>

                {lineErrors.length > 0 && (
                  <ul className="flex flex-col gap-2">
                    {lineErrors.map((message) => (
                      <li
                        key={message}
                        className={`rounded-xl border px-3 py-2 text-xs font-medium ${t.level.error}`}
                      >
                        <span className="font-black uppercase tracking-wider text-[10px] mr-1.5">
                          Parse Error
                        </span>
                        {message}
                      </li>
                    ))}
                  </ul>
                )}

                {!input.trim() ? (
                  <div
                    className={`rounded-2xl border border-dashed p-8 flex flex-col items-center gap-3 text-center ${t.panel}`}
                  >
                    <p className="text-sm font-bold">Paste a header to get started</p>
                    <p className={`text-xs font-medium max-w-md ${t.label}`}>
                      Copy a Cookie or Set-Cookie header from your browser&apos;s
                      DevTools (Network tab), cURL output or server logs.
                    </p>
                    <button type="button" onClick={handleLoadExample} className={primaryButton}>
                      Load Example
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">{cookies.map(renderCookie)}</div>
                )}

                <p className={`text-[10px] font-medium ${t.label}`}>
                  Parsed client-side — no cookie data leaves your browser
                </p>
              </div>
            </div>
          )}

          {activeTab === "build" && (
            <div
              role="tabpanel"
              id="cookie-panel-build"
              aria-labelledby="cookie-tab-build"
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-4">
                {sectionHeader(
                  "Cookie",
                  <button
                    type="button"
                    onClick={() => setBuilder(DEFAULT_BUILDER)}
                    className={secondaryButton}
                  >
                    Reset
                  </button>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {textField("name", "Name", "session_id")}
                  {textField("value", "Value", "a3fWa9x2")}
                  {textField("domain", "Domain (optional)", "example.com")}
                  {textField("path", "Path", "/")}
                  {selectField("expiryMode", "Expiry", [
                    ["session", "Session (no expiry)"],
                    ["max-age", "Max-Age (seconds)"],
                    ["expires", "Expires (date)"],
                  ])}
                  {builder.expiryMode === "max-age" &&
                    textField("maxAge", "Max-Age (seconds)", "3600", "number")}
                  {builder.expiryMode === "expires" &&
                    textField("expires", "Expires (local time)", "", "datetime-local")}
                  {selectField("sameSite", "SameSite", [
                    ["", "Not set"],
                    ["Lax", "Lax"],
                    ["Strict", "Strict"],
                    ["None", "None"],
                  ])}
                </div>

                <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <legend className={`${fieldLabel} mb-3`}>Options</legend>
                  {checkbox("secure", "Secure", "Only send over HTTPS")}
                  {checkbox("httpOnly", "HttpOnly", "Hide from JavaScript (document.cookie)")}
                  {checkbox("partitioned", "Partitioned", "CHIPS: separate jar per top-level site")}
                  {checkbox("encodeValue", "URL-encode value", "Escape spaces, ; and other unsafe characters")}
                </fieldset>
              </div>

              <div className="flex flex-col gap-4">
                {sectionHeader(
                  "Output",
                  <>
                    <button
                      type="button"
                      onClick={sendToInspector}
                      disabled={!builtHeader}
                      className={secondaryButton}
                    >
                      Inspect
                    </button>
                    <button
                      type="button"
                      onClick={() => copyText(`Set-Cookie: ${builtHeader}`, "Set-Cookie header copied")}
                      disabled={!builtHeader}
                      className={primaryButton}
                    >
                      Copy
                    </button>
                  </>
                )}

                <pre
                  className={`rounded-2xl border p-4 font-mono text-xs leading-relaxed overflow-x-auto min-h-[72px] whitespace-pre-wrap break-all ${t.outputPre}`}
                >
                  {builtHeader ? `Set-Cookie: ${builtHeader}` : "# Enter a cookie name to generate a Set-Cookie header"}
                </pre>

                {builtHeader && (
                  <div className="flex flex-col gap-2">
                    <h3 className={fieldLabel}>Findings</h3>
                    {renderIssues(builderIssues)}
                  </div>
                )}

                <p className={`text-[10px] font-medium ${t.label}`}>
                  Generated client-side — no data leaves your browser
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
