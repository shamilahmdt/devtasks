import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const DevUtilities = () => {
  const { dark } = useTheme();

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      card: "bg-white border-zinc-200/85 hover:border-zinc-400 hover:shadow-md hover:-translate-y-1",
      icon: "bg-black text-white border border-black/10",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      card: "bg-zinc-900/50 border-zinc-800/85 hover:border-zinc-600 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1",
      icon: "bg-white text-black border border-white/10",
    },
  };
  const t = dark ? theme.dark : theme.light;

  const cards = [
    {
      title: "Regex Tester",
      description:
        "Test regular expressions with flags, highlights, matching text, and capturing groups.",
      path: "/devutilities/regex",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "JSON Formatter",
      description:
        "Validate JSON string formats, structure code outputs, beautify spacing, or minify data.",
      path: "/devutilities/json",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
    },
    {
      title: "JSON YAML Converter",
      description:
        "Convert JSON to YAML and YAML to JSON in real time with syntax validation.",
      path: "/devutilities/json-yaml",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h10M7 12h6m-6 5h10M4 4v16m16-16v16"
          />
        </svg>
      ),
    },
    {
  title: "URL Parser & Query Builder",
  description:
    "Parse URLs into protocol, hostname, port, pathname, hash, and editable query parameters in real time.",
  path: "/devutilities/url-parser",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-2 2a4 4 0 105.656 5.656l2-2m-3.656-7.656l2-2a4 4 0 115.656 5.656l-2 2"
      />
    </svg>
  ),
},
    {
  title: "Text Case Converter",
  description:
    "Convert text into camelCase, snake_case, kebab-case, PascalCase, title case, URL slug, and inspect text metrics.",
  path: "/devutilities/text-case",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h10M4 17h7" />
    </svg>
  ),
},
    {
      title: "Base64 / URL",
      description:
        "Encode and decode binary string fragments, escape special URL query variables, and test strings.",
      path: "/devutilities/base64",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
    },
    {
      title: "Timestamp",
      description:
        "Convert epoch/unix values to human-readable datetime formats and parse date strings.",
      path: "/devutilities/timestamp",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "UUID Generator",
      description:
        "Generate RFC4122-compliant v4 UUIDs offline with formatting options.",
      path: "/devutilities/uuid",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
      ),
    },
    {
      title: "JWT Decoder",
      description:
        "Decode and inspect JSON Web Token header and payload data directly in the browser, completely offline.",
      path: "/devutilities/jwt",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      title: "JWT Encoder",
      description: "Encode and inspect JSON Web Token header and payload data directly in the browser, completely offline.",
      path: "/devutilities/jwt-encode",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: "Diff Checker",
      description:
        "Compare two text blocks and highlight added, removed, and unchanged lines in split or inline view.",
      path: "/devutilities/diff",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
    },
    {
      title: "Code Sandbox",
      description:
        "Instantly test raw HTML/CSS/JS with a live preview. No local environment required.",
      path: "/devutilities/code",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="m16 18 6-6-6-6M8 6l-6 6 6 6"
          />
        </svg>
      ),
    },
    {
      title: "Hash Generator",
      description:
        "Generate MD5, SHA-1, SHA-256, and SHA-512 cryptographic hashes directly in the browser.",
      path: "/devutilities/hash",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
          />
        </svg>
      ),
    },
    {
      title: "Color Converter & Contrast Checker",
      description:
        "Convert HEX, RGB, HSL, and CMYK colors, generate palettes, and verify WCAG contrast offline.",
      path: "/devutilities/color",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 0c1.5 2 2 4 2 6s-.5 4-2 6c-1.5-2-2-4-2-6s.5-4 2-6zm-6.36 4.64c2.08.83 3.8 2.55 4.64 4.64-2.09-.83-3.81-2.55-4.64-4.64zm12.72 0c-.83 2.09-2.55 3.81-4.64 4.64.83-2.09 2.55-3.81 4.64-4.64z"
          />
        </svg>
      ),
    },
    {
      title: "QR Code Generator",
      description:
        "Create customizable QR codes from text or URLs with color and size options. Fully offline.",
      path: "/devutilities/qrcode",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm13 0h1v1h-1v-1zm-3 0h1v1h-1v-1zm3 3h1v1h-1v-1zm-3 0h1v1h-1v-1zm3 3h1v1h-1v-1zm-3 0h1v1h-1v-1zm3-6h1v1h-1v-1z"
          />
        </svg>
      ),
    },
    {
      title: "Markdown Previewer",
      description:
        "Write markdown and instantly preview rendered HTML output with support for headings, lists, links, code blocks, and more.",
      path: "/devutilities/markdown",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2zm2 3v6l3-3 3 3V9m4 0v6m0-6h2"
          />
        </svg>
      ),
    },
    {
      title: "Text Case Converter",
      description:
        "Convert text to uppercase, lowercase, title case, sentence case, and more. Fully offline.",
      path: "/devutilities/text-case-converter",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm13 0h1v1h-1v-1zm-3 0h1v1h-1v-1zm3 3h1v1h-1v-1zm-3 0h1v1h-1v-1zm3 3h1v1h-1v-1zm-3 0h1v1h-1v-1zm3-6h1v1h-1v-1z"
          />
        </svg>
      ),
    },
    {
      title: "Mock JSON Generator",
      description:
        "Generate mock JSON data for testing and prototyping. Fully offline.",
      path: "/devutilities/mock-json-generator",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm13 0h1v1h-1v-1zm-3 0h1v1h-1v-1zm3 3h1v1h-1v-1zm-3 0h1v1h-1v-1zm3 3h1v1h-1v-1zm-3 0h1v1h-1v-1zm3-6h1v1h-1v-1z"
          />
        </svg>
      ),
    },
    {
      title: "Markdown Table Generator",
      description:
        "Build markdown tables visually or convert CSV and TSV data instantly.",
      path: "/devutilities/markdown-table-generator",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16M8 4v16M16 4v16"
          />
        </svg>
      ),
    },
    {
      title: "Flexbox & Grid Generator",
      description: "Generate flexbox and grid layouts for responsive design. Fully offline.",
      path: "/devutilities/flexbox-grid-generator",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm13 0h1v1h-1v-1zm-3 0h1v1h-1v-1zm3 3h1v1h-1v-1zm-3 0h1v1h-1v-1zm3 3h1v1h-1v-1zm-3 0h1v1h-1v-1zm3-6h1v1h-1v-1z" />
        </svg>
      ),
    },
    {
      title: "SQL Formatter",
      description: "Format SQL queries. Fully offline.",
      path: "/devutilities/sql-formatter",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm13 0h1v1h-1v-1zm-3 0h1v1h-1v-1zm3 3h1v1h-1v-1zm-3 0h1v1h-1v-1zm3 3h1v1h-1v-1zm-3 0h1v1h-1v-1zm3-6h1v1h-1v-1z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={`${t.wrapper} min-h-screen w-full font-sans overflow-y-auto overflow-x-hidden flex flex-col p-4 md:p-8 transition-colors duration-300`}
    >
      <title>Dev Utilities — DevTasks</title>
      <meta
        name="description"
        content="Quickly formatting, converting, validating, and checking regular expression statements."
      />

      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto flex flex-col h-full">
        <header className="shrink-0 mb-12 flex flex-col gap-4">
          <Link
            to="/dashboard"
            className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all duration-300 w-fit ${
              dark
                ? "text-neutral-400 hover:text-white"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            <span>← Back to Dashboard</span>
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 w-full">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
                Dev Utilities
              </h1>
              <p className="text-gray-400 font-medium mb-6 md:mb-0">
                Essential developer tools and offline code converters
              </p>
            </div>

            <div className="w-full max-w-sm">
              <div className="text-xs font-black uppercase tracking-widest mb-2">
                Utility Status: {cards.length} Active Utilities
              </div>
              <div className="text-[10px] font-bold text-gray-500 uppercase truncate">
                {cards
                  .map((card) => {
                    const t = card.title.toUpperCase();
                    if (t.includes("REGEX")) return "REGEXP";
                    if (t.includes("YAML")) return "JSON/YAML";
                    if (t.includes("JSON")) return "JSON";
                    if (t.includes("BASE64")) return "BASE64/URL";
                    if (t.includes("TIMESTAMP")) return "TIMESTAMP";
                    if (t.includes("UUID")) return "UUID";
                    if (t.includes("JWT")) return "JWT";
                    if (t.includes("DIFF")) return "DIFF";
                    if (t.includes("HASH")) return "HASH";
                    if (t.includes("COLOR")) return "COLOR";
                    if (t.includes("CODE")) return "CODE";
                    if (t.includes("QR")) return "QR";
                    return t;
                  })
                  .join(" • ")}
              </div>
            </div>
          </div>
        </header>

        <div className="grow w-full py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {cards.map((card) => (
              <Link
                key={card.title}
                to={card.path}
                id={`devutilities-card-${card.title.toLowerCase().replace(/\s+/g, "-")}`}
                className={`group relative p-6 border rounded-3xl transition-all duration-300 flex flex-col justify-between min-h-[280px] h-full ${t.card}`}
              >
                <div>
                  <div
                    className={`mb-6 p-3 w-fit rounded-xl transition-colors shadow-sm ${t.icon}`}
                  >
                    {card.icon}
                  </div>
                  <h2 className="text-xl font-black mb-3 uppercase tracking-tight">
                    {card.title}
                  </h2>
                  <p className="text-sm font-medium text-zinc-500 group-hover:text-zinc-400 transition-colors leading-relaxed">
                    {card.description}
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Tool{" "}
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevUtilities;
