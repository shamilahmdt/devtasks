import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  FaArrowLeft,
  FaCopy,
  FaCheck,
  FaSearch,
  FaTimes,
  FaStar,
  FaCode,
  FaTerminal,
  FaRedo,
  FaLink,
} from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

const HTTP_STATUS_CODES = [
  // 1xx Informational
  {
    code: 100,
    name: "Continue",
    category: "1xx Informational",
    categoryCode: "1xx",
    description:
      "The server has received the request headers and the client should proceed to send the request body.",
    common: true,
  },
  {
    code: 101,
    name: "Switching Protocols",
    category: "1xx Informational",
    categoryCode: "1xx",
    description:
      "The requester has asked the server to switch protocols and the server has agreed to do so.",
    common: true,
  },
  {
    code: 102,
    name: "Processing",
    category: "1xx Informational",
    categoryCode: "1xx",
    description:
      "The server has received and is processing the request, but no response is available yet (WebDAV).",
    common: false,
  },
  {
    code: 103,
    name: "Early Hints",
    category: "1xx Informational",
    categoryCode: "1xx",
    description:
      "Used to return some response headers before final HTTP message to allow preloading of resources.",
    common: false,
  },

  // 2xx Success
  {
    code: 200,
    name: "OK",
    category: "2xx Success",
    categoryCode: "2xx",
    description:
      "Standard response for successful HTTP requests. The actual response will depend on the request method used.",
    common: true,
  },
  {
    code: 201,
    name: "Created",
    category: "2xx Success",
    categoryCode: "2xx",
    description:
      "The request has been fulfilled, resulting in the creation of a new resource.",
    common: true,
  },
  {
    code: 202,
    name: "Accepted",
    category: "2xx Success",
    categoryCode: "2xx",
    description:
      "The request has been accepted for processing, but the processing has not been completed.",
    common: true,
  },
  {
    code: 203,
    name: "Non-Authoritative Information",
    category: "2xx Success",
    categoryCode: "2xx",
    description:
      "The server is a transforming proxy that received a 200 OK from its origin, but is returning a modified version.",
    common: false,
  },
  {
    code: 204,
    name: "No Content",
    category: "2xx Success",
    categoryCode: "2xx",
    description:
      "The server successfully processed the request and is not returning any content.",
    common: true,
  },
  {
    code: 205,
    name: "Reset Content",
    category: "2xx Success",
    categoryCode: "2xx",
    description:
      "The server successfully processed the request, but requires that the requester reset the document view.",
    common: false,
  },
  {
    code: 206,
    name: "Partial Content",
    category: "2xx Success",
    categoryCode: "2xx",
    description:
      "The server is delivering only part of the resource (byte serving) due to a range header sent by the client.",
    common: true,
  },
  {
    code: 207,
    name: "Multi-Status",
    category: "2xx Success",
    categoryCode: "2xx",
    description:
      "Conveys information about multiple resources in situations where multiple status codes might be appropriate (WebDAV).",
    common: false,
  },
  {
    code: 208,
    name: "Already Reported",
    category: "2xx Success",
    categoryCode: "2xx",
    description:
      "The members of a DAV binding have already been enumerated in a preceding part of the response (WebDAV).",
    common: false,
  },
  {
    code: 226,
    name: "IM Used",
    category: "2xx Success",
    categoryCode: "2xx",
    description:
      "The server has fulfilled a GET request for the resource, and the response is a representation of the result of one or more instance-manipulations.",
    common: false,
  },

  // 3xx Redirection
  {
    code: 300,
    name: "Multiple Choices",
    category: "3xx Redirection",
    categoryCode: "3xx",
    description:
      "Indicates multiple options for the resource from which the client may choose.",
    common: false,
  },
  {
    code: 301,
    name: "Moved Permanently",
    category: "3xx Redirection",
    categoryCode: "3xx",
    description:
      "This request and all future requests should be directed to the given URI.",
    common: true,
  },
  {
    code: 302,
    name: "Found",
    category: "3xx Redirection",
    categoryCode: "3xx",
    description:
      "Tells the client to look at another URL temporarily (historically 'Moved Temporarily').",
    common: true,
  },
  {
    code: 303,
    name: "See Other",
    category: "3xx Redirection",
    categoryCode: "3xx",
    description:
      "The response to the request can be found under another URI using the GET method.",
    common: false,
  },
  {
    code: 304,
    name: "Not Modified",
    category: "3xx Redirection",
    categoryCode: "3xx",
    description:
      "Indicates that the resource has not been modified since the version specified by the request headers.",
    common: true,
  },
  {
    code: 305,
    name: "Use Proxy",
    category: "3xx Redirection",
    categoryCode: "3xx",
    description:
      "The requested resource is available only through a proxy specified in the response.",
    common: false,
  },
  {
    code: 307,
    name: "Temporary Redirect",
    category: "3xx Redirection",
    categoryCode: "3xx",
    description:
      "The request should be repeated with another URI; however, future requests should still use the original URI.",
    common: true,
  },
  {
    code: 308,
    name: "Permanent Redirect",
    category: "3xx Redirection",
    categoryCode: "3xx",
    description:
      "The request and all future requests should be repeated using another URI without changing the HTTP method.",
    common: true,
  },

  // 4xx Client Error
  {
    code: 400,
    name: "Bad Request",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The server cannot or will not process the request due to an apparent client error (e.g., malformed syntax).",
    common: true,
  },
  {
    code: 401,
    name: "Unauthorized",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "Authentication is required and has failed or has not yet been provided.",
    common: true,
  },
  {
    code: 402,
    name: "Payment Required",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "Reserved for future use. Intended for digital payment systems, but currently rarely used.",
    common: false,
  },
  {
    code: 403,
    name: "Forbidden",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The request was valid, but the server is refusing action. The user might not have necessary permissions.",
    common: true,
  },
  {
    code: 404,
    name: "Not Found",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The requested resource could not be found but may be available in the future.",
    common: true,
  },
  {
    code: 405,
    name: "Method Not Allowed",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "A request method is not supported for the requested resource (e.g., GET on a form requiring POST).",
    common: true,
  },
  {
    code: 406,
    name: "Not Acceptable",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The requested resource is capable of generating only content not acceptable according to the Accept headers.",
    common: false,
  },
  {
    code: 407,
    name: "Proxy Authentication Required",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The client must first authenticate itself with the proxy.",
    common: false,
  },
  {
    code: 408,
    name: "Request Timeout",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The server timed out waiting for the request from the client.",
    common: true,
  },
  {
    code: 409,
    name: "Conflict",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "Indicates that the request could not be processed because of conflict in the current state of the resource.",
    common: true,
  },
  {
    code: 410,
    name: "Gone",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "Indicates that the resource requested is no longer available and will not be available again.",
    common: true,
  },
  {
    code: 411,
    name: "Length Required",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The request did not specify the length of its content, which is required by the requested resource.",
    common: false,
  },
  {
    code: 412,
    name: "Precondition Failed",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The server does not meet one of the preconditions that the requester put on the request header fields.",
    common: false,
  },
  {
    code: 413,
    name: "Payload Too Large",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The request is larger than the server is willing or able to process.",
    common: true,
  },
  {
    code: 414,
    name: "URI Too Long",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The URI provided was too long for the server to process.",
    common: false,
  },
  {
    code: 415,
    name: "Unsupported Media Type",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The request entity has a media type which the server or resource does not support.",
    common: true,
  },
  {
    code: 416,
    name: "Range Not Satisfiable",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The client has asked for a portion of the file (byte serving), but the server cannot supply that portion.",
    common: false,
  },
  {
    code: 417,
    name: "Expectation Failed",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The server cannot meet the requirements of the Expect request-header field.",
    common: false,
  },
  {
    code: 418,
    name: "I'm a Teapot",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "Any attempt to brew coffee with a teapot should result in the error code '418 I'm a teapot' (RFC 2324).",
    common: false,
  },
  {
    code: 421,
    name: "Misdirected Request",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The request was directed at a server that is not able to produce a response.",
    common: false,
  },
  {
    code: 422,
    name: "Unprocessable Content",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The request was well-formed but was unable to be followed due to semantic errors (often validation errors).",
    common: true,
  },
  {
    code: 423,
    name: "Locked",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The resource that is being accessed is locked (WebDAV).",
    common: false,
  },
  {
    code: 424,
    name: "Failed Dependency",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The request failed because it depended on another request and that request failed (WebDAV).",
    common: false,
  },
  {
    code: 425,
    name: "Too Early",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "Indicates that the server is unwilling to risk processing a request that might be replayed.",
    common: false,
  },
  {
    code: 426,
    name: "Upgrade Required",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The client should switch to a different protocol such as TLS/1.3.",
    common: false,
  },
  {
    code: 428,
    name: "Precondition Required",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The origin server requires the request to be conditional to prevent 'lost update' conflicts.",
    common: false,
  },
  {
    code: 429,
    name: "Too Many Requests",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The user has sent too many requests in a given amount of time ('rate limiting').",
    common: true,
  },
  {
    code: 431,
    name: "Request Header Fields Too Large",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "The server is unwilling to process the request because its header fields are too large.",
    common: false,
  },
  {
    code: 451,
    name: "Unavailable For Legal Reasons",
    category: "4xx Client Error",
    categoryCode: "4xx",
    description:
      "A server operator has received a legal demand to deny access to a resource or to a set of resources.",
    common: false,
  },

  // 5xx Server Error
  {
    code: 500,
    name: "Internal Server Error",
    category: "5xx Server Error",
    categoryCode: "5xx",
    description:
      "A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.",
    common: true,
  },
  {
    code: 501,
    name: "Not Implemented",
    category: "5xx Server Error",
    categoryCode: "5xx",
    description:
      "The server either does not recognize the request method, or it lacks the ability to fulfill the request.",
    common: true,
  },
  {
    code: 502,
    name: "Bad Gateway",
    category: "5xx Server Error",
    categoryCode: "5xx",
    description:
      "The server was acting as a gateway or proxy and received an invalid response from the upstream server.",
    common: true,
  },
  {
    code: 503,
    name: "Service Unavailable",
    category: "5xx Server Error",
    categoryCode: "5xx",
    description:
      "The server cannot handle the request (because it is overloaded or down for maintenance).",
    common: true,
  },
  {
    code: 504,
    name: "Gateway Timeout",
    category: "5xx Server Error",
    categoryCode: "5xx",
    description:
      "The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.",
    common: true,
  },
  {
    code: 505,
    name: "HTTP Version Not Supported",
    category: "5xx Server Error",
    categoryCode: "5xx",
    description:
      "The server does not support the HTTP protocol version used in the request.",
    common: false,
  },
  {
    code: 506,
    name: "Variant Also Negotiates",
    category: "5xx Server Error",
    categoryCode: "5xx",
    description:
      "Transparent content negotiation for the request results in a circular reference.",
    common: false,
  },
  {
    code: 507,
    name: "Insufficient Storage",
    category: "5xx Server Error",
    categoryCode: "5xx",
    description:
      "The server is unable to store the representation needed to complete the request (WebDAV).",
    common: false,
  },
  {
    code: 508,
    name: "Loop Detected",
    category: "5xx Server Error",
    categoryCode: "5xx",
    description:
      "The server detected an infinite loop while processing the request (WebDAV).",
    common: false,
  },
  {
    code: 510,
    name: "Not Extended",
    category: "5xx Server Error",
    categoryCode: "5xx",
    description:
      "Further extensions to the request are required for the server to fulfill it.",
    common: false,
  },
  {
    code: 511,
    name: "Network Authentication Required",
    category: "5xx Server Error",
    categoryCode: "5xx",
    description:
      "The client needs to authenticate to gain network access.",
    common: false,
  },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "common", label: "Common Only" },
  { id: "1xx", label: "1xx Informational" },
  { id: "2xx", label: "2xx Success" },
  { id: "3xx", label: "3xx Redirection" },
  { id: "4xx", label: "4xx Client Error" },
  { id: "5xx", label: "5xx Server Error" },
];

export default function HttpStatusExplorer() {
  const { dark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const inspectorRef = useRef(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedKey, setCopiedKey] = useState(null);

  // Quick lookup text state
  const [lookupInput, setLookupInput] = useState("");

  // Simulator state
  const [httpVersion, setHttpVersion] = useState("HTTP/1.1");
  const [simulatedHeaders, setSimulatedHeaders] = useState("");
  const [simulatedBody, setSimulatedBody] = useState("");

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85 shadow-sm hover:border-zinc-350 transition-all duration-200",
      input:
        "bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900",
      buttonSecondary:
        "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 active:scale-[0.98]",
      buttonActive: "bg-zinc-900 text-white border-zinc-900 shadow-sm",
      backLink:
        "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350",
      badgeDefault: "bg-zinc-100 text-zinc-700 border-zinc-200",
      badgeCommon: "bg-amber-50 text-amber-700 border-amber-200",
      codeText: "text-zinc-900",
      copyBtn:
        "bg-zinc-100 text-zinc-700 hover:bg-zinc-900 hover:text-white border-zinc-200",
      copyBtnActive: "bg-emerald-600 text-white border-emerald-600 font-bold",
      statBox: "bg-white border-zinc-200 hover:border-zinc-400 text-zinc-900",
      statBoxActive: "bg-zinc-900 border-zinc-900 text-white shadow-md",
      codeBox: "bg-zinc-950 text-emerald-400 border-zinc-800 font-mono text-xs",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-300",
      card: "bg-zinc-900/50 border-zinc-800/85 backdrop-blur-md shadow-md hover:border-zinc-700 transition-all duration-200",
      input:
        "bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500",
      buttonSecondary:
        "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850 active:scale-[0.98]",
      buttonActive: "bg-white text-zinc-950 border-white shadow-sm",
      backLink:
        "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600",
      badgeDefault: "bg-zinc-800/80 text-zinc-300 border-zinc-700/60",
      badgeCommon: "bg-amber-950/40 text-amber-300 border-amber-800/60",
      codeText: "text-white",
      copyBtn:
        "bg-zinc-800 text-zinc-300 hover:bg-white hover:text-zinc-950 border-zinc-700",
      copyBtnActive: "bg-emerald-500 text-zinc-950 border-emerald-500 font-bold",
      statBox:
        "bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700 text-zinc-100",
      statBoxActive: "bg-white border-white text-zinc-950 shadow-md font-bold",
      codeBox: "bg-black/60 text-emerald-400 border-zinc-800/80 font-mono text-xs",
    },
  };

  const t = dark ? theme.dark : theme.light;

  // Compute dataset statistics dynamically
  const categoryStats = useMemo(() => {
    const stats = {
      all: HTTP_STATUS_CODES.length,
      common: 0,
      "1xx": 0,
      "2xx": 0,
      "3xx": 0,
      "4xx": 0,
      "5xx": 0,
    };
    HTTP_STATUS_CODES.forEach((item) => {
      if (item.common) stats.common += 1;
      if (stats[item.categoryCode] !== undefined) {
        stats[item.categoryCode] += 1;
      }
    });
    return stats;
  }, []);

  // Determine currently selected status code from URL search parameter ?code=
  const activeCodeParam = searchParams.get("code");

  const selectedStatusRecord = useMemo(() => {
    if (!activeCodeParam) return null;
    const parsed = parseInt(activeCodeParam, 10);
    if (isNaN(parsed)) return null;
    return HTTP_STATUS_CODES.find((item) => item.code === parsed) || null;
  }, [activeCodeParam]);

  // Keep lookup input in sync with active URL selection or manual input
  useEffect(() => {
    if (activeCodeParam) {
      setLookupInput(activeCodeParam);
    }
  }, [activeCodeParam]);

  // Pre-fill Response Simulator when selected status record changes
  useEffect(() => {
    const currentCode = selectedStatusRecord ? selectedStatusRecord.code : 200;
    const currentName = selectedStatusRecord
      ? selectedStatusRecord.name
      : "OK";

    setSimulatedHeaders(
      `Content-Type: application/json\nCache-Control: no-cache, no-store, must-revalidate\nDate: ${new Date().toUTCString()}`
    );

    if (currentCode >= 400) {
      setSimulatedBody(
        JSON.stringify(
          {
            status: currentCode,
            error: currentName,
            message:
              selectedStatusRecord?.description ||
              "An error occurred processing the request.",
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
      );
    } else if (currentCode >= 300 && currentCode < 400) {
      setSimulatedBody(
        JSON.stringify(
          {
            status: currentCode,
            message: currentName,
            location: "https://api.example.com/v2/resource",
          },
          null,
          2
        )
      );
    } else {
      setSimulatedBody(
        JSON.stringify(
          {
            status: currentCode,
            message: currentName,
            data: {
              id: "res_84920",
              type: "developer_tool",
              active: true,
            },
          },
          null,
          2
        )
      );
    }
  }, [selectedStatusRecord]);

  // Derived list of status codes based on active filters
  const filteredStatusCodes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return HTTP_STATUS_CODES.filter((item) => {
      // Filter by category or common pill
      if (selectedCategory === "common" && !item.common) {
        return false;
      }
      if (
        selectedCategory !== "all" &&
        selectedCategory !== "common" &&
        item.categoryCode !== selectedCategory
      ) {
        return false;
      }

      // Filter by search query
      if (!q) return true;

      const codeStr = item.code.toString();
      const nameLower = item.name.toLowerCase();
      const categoryLower = item.category.toLowerCase();
      const descLower = item.description.toLowerCase();

      return (
        codeStr.includes(q) ||
        nameLower.includes(q) ||
        categoryLower.includes(q) ||
        descLower.includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  // Select code helper
  const handleSelectCode = (codeNumber) => {
    const codeStr = String(codeNumber);
    setSearchParams({ code: codeStr });
    setLookupInput(codeStr);
    if (inspectorRef.current) {
      inspectorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleClearSelection = () => {
    setSearchParams({});
    setLookupInput("");
  };

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    const trimmed = lookupInput.trim();
    if (!trimmed) {
      handleClearSelection();
      return;
    }
    setSearchParams({ code: trimmed });
    if (inspectorRef.current) {
      inspectorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Copy helper with feedback
  const copyToClipboard = async (text, keyLabel) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyLabel);
      toast.success(`Copied ${keyLabel} to clipboard!`);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === keyLabel ? null : prev));
      }, 2000);
    } catch (error) {
      console.error("Clipboard copy failed", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  const getCategoryBadgeStyle = (categoryCode) => {
    switch (categoryCode) {
      case "1xx":
        return dark
          ? "bg-blue-950/40 text-blue-300 border-blue-800/60"
          : "bg-blue-50 text-blue-700 border-blue-200";
      case "2xx":
        return dark
          ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/60"
          : "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "3xx":
        return dark
          ? "bg-purple-950/40 text-purple-300 border-purple-800/60"
          : "bg-purple-50 text-purple-700 border-purple-200";
      case "4xx":
        return dark
          ? "bg-orange-950/40 text-orange-300 border-orange-800/60"
          : "bg-orange-50 text-orange-700 border-orange-200";
      case "5xx":
        return dark
          ? "bg-rose-950/40 text-rose-300 border-rose-800/60"
          : "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return t.badgeDefault;
    }
  };

  // Simulated Raw HTTP Response string
  const generatedHttpResponse = useMemo(() => {
    const code = selectedStatusRecord ? selectedStatusRecord.code : 200;
    const name = selectedStatusRecord ? selectedStatusRecord.name : "OK";

    const headersText = simulatedHeaders.trim();
    const bodyText = simulatedBody.trim();

    return `${httpVersion} ${code} ${name}\n${headersText}${
      bodyText ? `\n\n${bodyText}` : ""
    }`;
  }, [selectedStatusRecord, httpVersion, simulatedHeaders, simulatedBody]);

  return (
    <div className={`min-h-screen ${t.wrapper} px-4 sm:px-6 py-6 sm:py-10 transition-colors duration-300`}>
      <title>HTTP Status Code Workbench — DevTasks</title>
      <meta
        name="description"
        content="Search and explore HTTP status codes, meanings, categories, and standard descriptions completely offline."
      />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${t.backLink}`}
            title="Back to Dev Utilities"
            aria-label="Back to Dev Utilities"
          >
            <FaArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${t.heading}`}>
              HTTP Status Code Workbench
            </h1>
            <p className={`mt-0.5 text-xs sm:text-sm font-semibold ${t.subtext}`}>
              Search HTTP status codes, inspect RFC specs, simulate responses, and copy shareable links. Fully offline.
            </p>
          </div>
        </div>

        {/* 1. Statistics Bar */}
        <div className="space-y-2">
          <label className={`text-[10px] font-black uppercase tracking-widest ${t.subtext}`}>
            Status Category Distribution
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2.5">
            {[
              { key: "all", label: "All Codes", count: categoryStats.all },
              { key: "common", label: "Common", count: categoryStats.common },
              { key: "1xx", label: "1xx Info", count: categoryStats["1xx"] },
              { key: "2xx", label: "2xx Success", count: categoryStats["2xx"] },
              { key: "3xx", label: "3xx Redirect", count: categoryStats["3xx"] },
              { key: "4xx", label: "4xx Client", count: categoryStats["4xx"] },
              { key: "5xx", label: "5xx Server", count: categoryStats["5xx"] },
            ].map((stat) => (
              <button
                key={stat.key}
                type="button"
                onClick={() => setSelectedCategory(stat.key)}
                className={`p-3 rounded-2xl border transition-all duration-200 text-left cursor-pointer flex flex-col justify-between ${
                  selectedCategory === stat.key ? t.statBoxActive : t.statBox
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-wider opacity-80">
                  {stat.label}
                </span>
                <span className="text-lg font-black tracking-tight mt-1">
                  {stat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Interactive Status Inspector & Quick Lookup */}
        <div ref={inspectorRef} id="status-inspector" className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-6 scroll-mt-6`}>
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-4">
            <div className="flex items-center gap-2">
              <FaCode className="w-4 h-4 text-indigo-500" />
              <h2 className={`text-sm font-black uppercase tracking-wider ${t.heading}`}>
                Status Inspector & Quick Lookup
              </h2>
            </div>

            <form onSubmit={handleLookupSubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={lookupInput}
                onChange={(e) => setLookupInput(e.target.value)}
                placeholder='Lookup code (e.g. "404")'
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold w-full sm:w-48 ${t.input}`}
                aria-label="Direct Status Code Lookup"
              />
              <button
                type="submit"
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider ${t.buttonActive}`}
              >
                Inspect
              </button>
              {activeCodeParam && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs ${t.buttonSecondary}`}
                  title="Clear Selection"
                  aria-label="Clear Selection"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              )}
            </form>
          </div>

          {/* Active Status Display or Validation Error */}
          {activeCodeParam && !selectedStatusRecord ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-between">
              <span>
                Status code <strong>&quot;{activeCodeParam}&quot;</strong> is not recognized in standard RFC specification dataset.
              </span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="underline hover:no-underline font-bold text-xs cursor-pointer ml-3 shrink-0"
              >
                Clear lookup
              </button>
            </div>
          ) : selectedStatusRecord ? (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-4xl font-black font-mono tracking-tight ${t.codeText}`}>
                      {selectedStatusRecord.code}
                    </span>
                    <span className={`text-xl font-bold ${t.heading}`}>
                      {selectedStatusRecord.name}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold uppercase ${getCategoryBadgeStyle(selectedStatusRecord.categoryCode)}`}>
                      {selectedStatusRecord.categoryCode}
                    </span>
                    {selectedStatusRecord.common && (
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase flex items-center gap-1 ${t.badgeCommon}`}>
                        <FaStar className="w-2.5 h-2.5 text-amber-500" />
                        Common
                      </span>
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed max-w-3xl font-medium ${t.subtext}`}>
                    {selectedStatusRecord.description}
                  </p>
                </div>

                {/* Developer Copy Representation Actions */}
                <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(String(selectedStatusRecord.code), "numeric code")}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      copiedKey === "numeric code" ? t.copyBtnActive : t.copyBtn
                    }`}
                  >
                    {copiedKey === "numeric code" ? <FaCheck className="w-3 h-3" /> : <FaCopy className="w-3 h-3" />}
                    Copy Code ({selectedStatusRecord.code})
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${selectedStatusRecord.code} ${selectedStatusRecord.name}`, "status line")}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      copiedKey === "status line" ? t.copyBtnActive : t.copyBtn
                    }`}
                  >
                    {copiedKey === "status line" ? <FaCheck className="w-3 h-3" /> : <FaCopy className="w-3 h-3" />}
                    Copy &quot;{selectedStatusRecord.code} {selectedStatusRecord.name}&quot;
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(JSON.stringify(selectedStatusRecord, null, 2), "JSON")}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      copiedKey === "JSON" ? t.copyBtnActive : t.copyBtn
                    }`}
                  >
                    {copiedKey === "JSON" ? <FaCheck className="w-3 h-3" /> : <FaCode className="w-3 h-3" />}
                    Copy JSON
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${window.location.origin}${window.location.pathname}?code=${selectedStatusRecord.code}`, "share link")}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      copiedKey === "share link" ? t.copyBtnActive : t.copyBtn
                    }`}
                  >
                    {copiedKey === "share link" ? <FaCheck className="w-3 h-3" /> : <FaLink className="w-3 h-3" />}
                    Copy Share Link
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-4 rounded-2xl border text-xs font-medium ${t.subtext} bg-zinc-50/50 dark:bg-zinc-950/30`}>
              Tip: Click any status code card below or enter a code in Quick Lookup to inspect details and generate shareable links.
            </div>
          )}
        </div>

        {/* 3. HTTP Response Builder / Simulator */}
        <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-4`}>
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
            <div className="flex items-center gap-2">
              <FaTerminal className="w-4 h-4 text-emerald-500" />
              <h2 className={`text-sm font-black uppercase tracking-wider ${t.heading}`}>
                Offline HTTP Response Simulator
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={httpVersion}
                onChange={(e) => setHttpVersion(e.target.value)}
                className={`px-2.5 py-1 rounded-xl border text-xs font-mono font-bold ${t.input}`}
                aria-label="HTTP Version"
              >
                <option value="HTTP/1.1">HTTP/1.1</option>
                <option value="HTTP/2">HTTP/2</option>
                <option value="HTTP/3">HTTP/3</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSimulatedHeaders(
                    `Content-Type: application/json\nCache-Control: no-cache\nDate: ${new Date().toUTCString()}`
                  );
                  setSimulatedBody(
                    JSON.stringify(
                      {
                        status: selectedStatusRecord
                          ? selectedStatusRecord.code
                          : 200,
                        message: selectedStatusRecord
                          ? selectedStatusRecord.name
                          : "OK",
                      },
                      null,
                      2
                    )
                  );
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${t.buttonSecondary}`}
              >
                <FaRedo className="w-3 h-3" /> Reset Simulator
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Headers & Body Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={`text-[10px] font-black uppercase tracking-widest ${t.subtext}`}>
                  Response Headers
                </label>
                <textarea
                  value={simulatedHeaders}
                  onChange={(e) => setSimulatedHeaders(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-xl border font-mono text-xs resize-none ${t.input}`}
                  placeholder="Content-Type: application/json..."
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-[10px] font-black uppercase tracking-widest ${t.subtext}`}>
                  Response Body (JSON / Text)
                </label>
                <textarea
                  value={simulatedBody}
                  onChange={(e) => setSimulatedBody(e.target.value)}
                  rows={5}
                  className={`w-full px-3 py-2 rounded-xl border font-mono text-xs resize-none ${t.input}`}
                  placeholder='{"message": "Hello world"}'
                />
              </div>
            </div>

            {/* Generated Raw Output Preview */}
            <div className="space-y-1.5 flex flex-col">
              <div className="flex items-center justify-between">
                <label className={`text-[10px] font-black uppercase tracking-widest ${t.subtext}`}>
                  Formatted Response Preview
                </label>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedHttpResponse, "simulated response")}
                  className={`px-3 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    copiedKey === "simulated response" ? t.copyBtnActive : t.copyBtn
                  }`}
                >
                  {copiedKey === "simulated response" ? <FaCheck className="w-3 h-3" /> : <FaCopy className="w-3 h-3" />}
                  Copy Generated Response
                </button>
              </div>

              <pre className={`p-4 rounded-2xl border flex-1 overflow-x-auto whitespace-pre-wrap break-all ${t.codeBox}`}>
                {generatedHttpResponse}
              </pre>
            </div>
          </div>
        </div>

        {/* 4. Controls Section: Search & Category Filters */}
        <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-4`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${t.subtext}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search status code, name, category, or description (e.g. "404", "Unauthorized", "Client Error")'
                className={`w-full pl-10 pr-10 py-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all duration-200 ${t.input}`}
                aria-label="Search HTTP status codes"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full opacity-70 hover:opacity-100 transition-opacity ${t.subtext}`}
                  aria-label="Clear search input"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat.id ? t.buttonActive : t.buttonSecondary
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Result Count and Active Filters Summary */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs font-semibold border-t border-zinc-200/60 dark:border-zinc-800/60">
            <span className={t.subtext}>
              Showing <strong className={t.heading}>{filteredStatusCodes.length}</strong> of{" "}
              <strong>{HTTP_STATUS_CODES.length}</strong> HTTP status codes
            </span>

            {(searchQuery || selectedCategory !== "all") && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* 5. Cards Grid / Empty State */}
        {filteredStatusCodes.length === 0 ? (
          <div className={`rounded-3xl border ${t.card} p-12 text-center space-y-4`}>
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto">
              <FaSearch className={`w-5 h-5 ${t.subtext}`} />
            </div>
            <div className="space-y-1">
              <h3 className={`text-base font-bold ${t.heading}`}>
                No HTTP status codes found
              </h3>
              <p className={`text-xs max-w-md mx-auto ${t.subtext}`}>
                No status codes match your current search terms or selected category filter.
              </p>
            </div>
            <button
              type="button"
              onClick={clearAllFilters}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${t.buttonActive}`}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStatusCodes.map((item) => {
              const isSelected = selectedStatusRecord?.code === item.code;
              const isCardCopied = copiedKey === `card-${item.code}`;

              return (
                <div
                  key={item.code}
                  className={`rounded-2xl border ${t.card} p-5 flex flex-col justify-between space-y-4 group ${
                    isSelected ? "ring-2 ring-indigo-500" : ""
                  }`}
                >
                  <div className="space-y-3">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectCode(item.code)}
                        className={`text-2xl font-black font-mono tracking-tight hover:underline text-left cursor-pointer ${t.codeText}`}
                        title="Click to inspect status details"
                      >
                        {item.code}
                      </button>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {item.common && (
                          <span
                            className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${t.badgeCommon}`}
                            title="Frequently used HTTP status code"
                          >
                            <FaStar className="w-2.5 h-2.5 text-amber-500" />
                            Common
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wide ${getCategoryBadgeStyle(
                            item.categoryCode
                          )}`}
                        >
                          {item.categoryCode}
                        </span>
                      </div>
                    </div>

                    {/* Status Title & Description */}
                    <div>
                      <h3 className={`text-base font-bold tracking-tight ${t.heading}`}>
                        {item.name}
                      </h3>
                      <p className={`text-xs leading-relaxed mt-1.5 font-medium ${t.subtext}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectCode(item.code)}
                      className="text-xs font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      {isSelected ? "Inspecting" : "Inspect →"}
                    </button>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(String(item.code), `card-${item.code}`)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                        isCardCopied ? t.copyBtnActive : t.copyBtn
                      }`}
                      aria-label={`Copy status code ${item.code}`}
                    >
                      {isCardCopied ? (
                        <>
                          <FaCheck className="w-3 h-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <FaCopy className="w-3 h-3" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
