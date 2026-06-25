import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { FaCode } from "react-icons/fa";
import SIDEBAR_SECTIONS from "../../config/sidebarSections";

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

  // Initialize favorites from storage only in the browser.
  const FAVORITES_STORAGE_KEY = "favorite_utilities";
  const [favoritePaths, setFavoritePaths] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);

      if (!savedFavorites) {
        return [];
      }

      const parsedFavorites = JSON.parse(savedFavorites);

      if (!Array.isArray(parsedFavorites)) {
        return [];
      }

      return parsedFavorites.filter((path) => typeof path === "string");
    } catch (error) {
      console.error("Unable to load favorite tools", error);
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState("");

  const cards = [
    {
      title: "SVG Optimizer",
      description: "Optimize, clean and preview SVG code instantly",
      path: "/devutilities/svg-optimizer",
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
            d="M4 6h16M4 12h16M4 18h10"
          />
        </svg>
      ),
    },
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
            d="M13.828 10.172a4 4 0 00-5.656 0l-2 2a4 4 0 105.656 5.656l2-2m-3.656-7.656l2-2a4 4 0 115.656 5.656l-2 2"
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
      description:
        "Encode and inspect JSON Web Token header and payload data directly in the browser, completely offline.",
      path: "/devutilities/jwt-encode",
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
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
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
      title: "Bcrypt Generator",
      description:
        "Generate and verify bcrypt password hashes entirely offline.",
      path: "/devutilities/bcrypt",
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
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
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
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-3M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
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
      title: "Text Case Converter",
      description:
        "Convert text into camelCase, snake_case, kebab-case, PascalCase, title case, URL slug, and inspect text metrics.",
      path: "/devutilities/text-case",
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
            d="M3 18L8.5 5.5L14 18M4.5 14h8M21 12v6m0-3a2.5 2.5 0 10-5 0 2.5 2.5 0 005 0"
          />
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
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
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
            d="M8 6a1.5 1.5 0 00-1.5 1.5v3A1.5 1.5 0 015 12a1.5 1.5 0 011.5 1.5v3A1.5 1.5 0 008 18M16 6a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 001.5 1.5 1.5 1.5 0 00-1.5 1.5v3a1.5 1.5 0 01-1.5 1.5M11 10h2m-2 4h2"
          />
        </svg>
      ),
    },
    {
      title: "JSON Schema Validator",
      description: "Validate JSON data against a schema.",
      path: "/devutilities/json-schema-validator",
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      title: "Markdown Table Generator",
      description:
        "Build markdown tables visually or convert CSV and TSV data instantly.",
      path: "/devutilities/markdown-table-genertaor",
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
      title: "SQL Formatter & Minifier",
      description:
        "Beautify messy SQL with proper keyword casing and indentation, or minify to a single line. Fully offline.",
      path: "/devutilities/sql",
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
            d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4"
          />
        </svg>
      ),
    },
    {
      title: "HTML Entity Converter",
      description:
        "Encode and decode HTML/XML entities using named or numeric formats. Fully offline.",
      path: "/devutilities/html-entity",
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
            d="M8 9l-3 3 3 3m8-6l3 3-3 3M13 5l-2 14"
          />
        </svg>
      ),
    },
    {
      title: "Flexbox & Grid Generator",
      description:
        "Generate flexbox and grid layouts for responsive design. Fully offline.",
      path: "/devutilities/flexbox-grid-generator",
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
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h3a1 1 0 011 1v6a1 1 0 01-1 1h-3a1 1 0 01-1-1v-6z"
          />
        </svg>
      ),
    },
    {
      title: "IP Subnet Calculator",
      description:
        "Calculate IPv4 subnet masks, host ranges, wildcard masks, and visualize CIDR bit maps — completely offline.",
      path: "/devutilities/subnet",
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
            d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
          />
        </svg>
      ),
    },
    {
      title: "User Agent Parser",
      description:
        "Parse browser user-agent strings and inspect client environment information.",
      path: "/devutilities/user-agent",
      icon: <FaCode />,
    },
    {
      title: "Chmod Calculator",
      description:
        "Calculate Unix file permissions in octal and symbolic formats visually.",
      path: "/devutilities/chmod",
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
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
    {
      title: "CRON Expression Generator & Descriptor",
      description: "Generate and inspect CRON expressions. Fully offline.",
      path: "/devutilities/cron",
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "CSS Glassmorphism & Box-Shadow Playground",
      description:
        "Design modern glassmorphism effects with backdrop blur, shadows, and live CSS export.",
      path: "/devutilities/glassmorphism",
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
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },

    {
      title: "String Inspector",
      description:
        "Analyze character, word, sentence, and paragraph counts, byte size, reading/speaking time, and word frequency density.",
      path: "/devutilities/string-inspector",
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
            d="M9 4h6m-6 16h6M5 8h2m10 0h2M5 16h2m10 0h2M7 4v16M17 4v16M7 12h10"
          />
        </svg>
      ),
    },

    {
      title: "Number Base Converter & Bitwise Visualizer",
      description:
        "Convert numbers between decimal, hexadecimal, binary, and octal, and visualize bitwise AND/OR/XOR/NOT/shift operations bit by bit.",
      path: "/devutilities/number-base-converter",
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
            d="M4 6h16M4 6v12a1 1 0 001 1h14a1 1 0 001-1V6M8 10h.01M8 14h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01"
          />
        </svg>
      ),
    },
    {
      title: "CSS Gradient Generator",
      description: "Create beautiful CSS gradients with live preview",
      path: "/devutilities/css-gradient",
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
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Lorem Ipsum Generator",
      description:
        "Generate dummy placeholder text in various formats and lengths entirely offline for layouts and testing.",
      path: "/devutilities/lorem-ipsum",
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];

  const devUtilsSection = SIDEBAR_SECTIONS.find(
    (s) => s.title === "Dev Utilities",
  );
  const pathOrder = devUtilsSection
    ? devUtilsSection.items.map((item) => item.path)
    : [];

  const sortedCards = [...cards].sort((a, b) => {
    const indexA = pathOrder.indexOf(a.path);
    const indexB = pathOrder.indexOf(b.path);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // There are some duplicate cards, so I'm just leaving this here.
  const uniqueCards = Array.from(
    new Map(sortedCards.map((card) => [card.path, card])).values(),
  );

  const matchedCards = uniqueCards.filter(
    (card) =>
      card.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase().trim()),
  );

  const filteredUniqueCards =
    searchQuery.trim() && matchedCards.length === 0
      ? uniqueCards
      : matchedCards;

  // Splitting both favourite and other cards
  const favoriteSet = new Set(favoritePaths);
  const favoriteCards = filteredUniqueCards.filter((card) =>
    favoriteSet.has(card.path),
  );
  const otherCards = filteredUniqueCards.filter(
    (card) => !favoriteSet.has(card.path),
  );

  const hasFavorites = favoriteCards.length > 0;

  // Mirror favorites back to localStorage whenever the list changes.
  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoritePaths));
  }, [favoritePaths]);

  // Toggle a card between favorite and non-favorite states.
  const toggleFavorite = (path) => {
    setFavoritePaths((currentFavorites) =>
      currentFavorites.includes(path)
        ? currentFavorites.filter((item) => item !== path)
        : [...currentFavorites, path],
    );
  };

  return (
    <div
      className={`${t.wrapper} min-h-screen w-full font-sans overflow-x-hidden flex flex-col p-4 md:p-8 transition-colors duration-300`}
    >
      <title>Dev Utilities — DevTasks</title>
      <meta
        name="description"
        content="Quickly formatting, converting, validating, and checking regular expression statements."
      />

      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto flex flex-col h-full">
        <header className="shrink-0 mb-12 flex flex-col gap-4">
          {/* Back navigation and page title area. */}
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
              <div className="relative block w-full mb-3">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search utilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-2xl border py-2.5 pl-11 pr-4 text-xs font-semibold outline-none transition-all duration-300 ${
                    dark
                      ? "bg-zinc-950/60 border-zinc-800 text-white placeholder-zinc-600 focus:border-white"
                      : "bg-white border-neutral-250 text-black placeholder-neutral-400 focus:border-black"
                  }`}
                />
              </div>
              {searchQuery.trim() && matchedCards.length === 0 && (
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">
                  No matches found.
                </div>
              )}
              <div className="text-xs font-black uppercase tracking-widest mb-2">
                Utility Status: {uniqueCards.length} Active Utilities
              </div>
              <div className="text-[10px] font-bold text-gray-500 uppercase truncate">
                {uniqueCards
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
                    if (t.includes("SUBNET")) return "SUBNET";
                    if (t.includes("SQL")) return "SQL";
                    if (t.includes("CHMOD")) return "CHMOD";
                    if (t.includes("GRADIENT")) return "GRADIENT";
                    return t;
                  })
                  .join(" • ")}
              </div>
            </div>
          </div>
        </header>

        <div className="grow w-full">
          {filteredUniqueCards.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 font-semibold uppercase tracking-wider text-sm">
              No utilities matched your search criteria.
            </div>
          ) : (
            <>
              <section
                aria-hidden={!hasFavorites}
                className={`overflow-hidden transition-all duration-500 ease-out ${
                  hasFavorites
                    ? "mb-12 max-h-[3000px] opacity-100 translate-y-0"
                    : "max-h-0 opacity-0 -translate-y-4 pointer-events-none"
                }`}
              >
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">
                      Favourite Tools
                    </h2>
                    <p className="mt-1 text-sm font-medium text-zinc-500">
                      Your saved tools appear here first.
                    </p>
                  </div>
                  <div className="text-xs font-black uppercase tracking-widest text-zinc-500">
                    {favoriteCards.length} item
                    {favoriteCards.length === 1 ? "" : "s"}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                  {favoriteCards.map((card) => {
                    const isFavorite = favoriteSet.has(card.path);

                    return (
                      // Each card links to the tool, while the star updates local state.
                      <Link
                        key={card.path}
                        to={card.path}
                        id={`devutilities-card-${card.title.toLowerCase().replace(/\s+/g, "-")}`}
                        className={`group relative p-6 border rounded-3xl transition-all duration-300 flex flex-col justify-between min-h-70 h-full ${t.card}`}
                      >
                        <button
                          type="button"
                          aria-label={
                            isFavorite
                              ? `Remove ${card.title} from favorites`
                              : `Add ${card.title} to favorites`
                          }
                          aria-pressed={isFavorite}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            toggleFavorite(card.path);
                          }}
                          className={`absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
                            isFavorite
                              ? "border-amber-400/40 bg-amber-400/15 text-amber-400"
                              : dark
                                ? "border-zinc-800 bg-zinc-950/70 text-zinc-500 hover:border-amber-400/40 hover:text-amber-300"
                                : "border-zinc-200 bg-white/90 text-zinc-400 hover:border-amber-400/40 hover:text-amber-500"
                          }`}
                        >
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill={isFavorite ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth={1.9}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {/* STAR ICON */}
                            <path d="M12 3.6l2.93 5.94 6.55.95-4.74 4.62 1.12 6.52L12 18.55l-5.86 3.08 1.12-6.52L2.52 10.49l6.55-.95L12 3.6z" />
                          </svg>
                        </button>
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
                    );
                  })}
                </div>
              </section>

              <section>
                <div className="mb-5 flex items-end justify-between gap-4">
                  {hasFavorites && (
                    <>
                      <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">
                          All Other Tools
                        </h2>
                        <p className="mt-1 text-sm font-medium text-zinc-500">
                          The full utility list lives below your favorites.
                        </p>
                      </div>
                      <div className="text-xs font-black uppercase tracking-widest text-zinc-500">
                        {otherCards.length} item
                        {otherCards.length === 1 ? "" : "s"}
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                  {otherCards.map((card) => {
                    const isFavorite = favoriteSet.has(card.path);

                    return (
                      // Each card links to the tool, while the star updates local state.
                      <Link
                        key={card.path}
                        to={card.path}
                        id={`devutilities-card-${card.title.toLowerCase().replace(/\s+/g, "-")}`}
                        className={`group relative p-6 border rounded-3xl transition-all duration-300 flex flex-col justify-between min-h-70 h-full ${t.card}`}
                      >
                        <button
                          type="button"
                          aria-label={
                            isFavorite
                              ? `Remove ${card.title} from favorites`
                              : `Add ${card.title} to favorites`
                          }
                          aria-pressed={isFavorite}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            toggleFavorite(card.path);
                          }}
                          className={`absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
                            isFavorite
                              ? "border-amber-400/40 bg-amber-400/15 text-amber-400"
                              : dark
                                ? "border-zinc-800 bg-zinc-950/70 text-zinc-500 hover:border-amber-400/40 hover:text-amber-300"
                                : "border-zinc-200 bg-white/90 text-zinc-400 hover:border-amber-400/40 hover:text-amber-500"
                          }`}
                        >
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill={isFavorite ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth={1.9}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {/* STAR ICON */}
                            <path d="M12 3.6l2.93 5.94 6.55.95-4.74 4.62 1.12 6.52L12 18.55l-5.86 3.08 1.12-6.52L2.52 10.49l6.55-.95L12 3.6z" />
                          </svg>
                        </button>
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
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevUtilities;
