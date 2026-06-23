/**
 * Central sidebar navigation configuration used by section-aware UI.
 *
 * Update this file when adding, removing, or renaming sidebar entries.
 * Keep each item path aligned with route definitions in src/App.jsx.
 *
 * Shape:
 * - section.title: section heading shown in sidebar
 * - section.description: short section summary
 * - section.match(pathname): returns true when section should be active
 * - section.items: clickable links shown for the active section
 * - item.exact (optional): when true, only exact path is treated as active
 */
const SIDEBAR_SECTIONS = [
  {
    title: "Overview",
    description: "Jump back to the main workspace",
    match: (pathname) => pathname === "/" || pathname === "/dashboard",
    items: [
      { label: "Home", description: "Landing page", path: "/", exact: true },
      {
        label: "Dashboard",
        description: "App overview",
        path: "/dashboard",
        exact: true,
      },
    ],
  },
  {
    title: "Task Management",
    description: "Roadmaps, logs, and backups",
    match: (pathname) => pathname.startsWith("/taskmanage"),
    items: [
      {
        label: "Task Workspace",
        description: "Task section hub",
        path: "/taskmanage",
        exact: true,
      },
      {
        label: "Add Tasks",
        description: "Create new roadmap items",
        path: "/taskmanage/add-tasks",
      },
      {
        label: "Task List",
        description: "Review active and completed tasks",
        path: "/taskmanage/list-tasks",
      },
      {
        label: "Delete History",
        description: "Restore removed items",
        path: "/taskmanage/delete-history",
      },
      {
        label: "Data Center",
        description: "Import and export backups",
        path: "/taskmanage/data-center",
      },
    ],
  },
  {
    title: "Snippet Vault",
    description: "Save, review, and restore snippets",
    match: (pathname) => pathname.startsWith("/snippetvault"),
    items: [
      {
        label: "Vault Home",
        description: "Snippet overview",
        path: "/snippetvault",
        exact: true,
      },
      {
        label: "Add Snippet",
        description: "Create a new snippet",
        path: "/snippetvault/add",
      },
      {
        label: "Snippet List",
        description: "Browse saved snippets",
        path: "/snippetvault/list",
      },
      {
        label: "Delete History",
        description: "Restore removed snippets",
        path: "/snippetvault/delete-history",
      },
      {
        label: "Data Center",
        description: "Import and export backups",
        path: "/snippetvault/data-center",
      },
    ],
  },
  {
    title: "Resource Hub",
    description: "Links, references, and backups",
    match: (pathname) => pathname.startsWith("/resourcehub"),
    items: [
      {
        label: "Hub Home",
        description: "Resource overview",
        path: "/resourcehub",
        exact: true,
      },
      {
        label: "Add Resource",
        description: "Save a new link",
        path: "/resourcehub/add",
      },
      {
        label: "Resource List",
        description: "Browse saved resources",
        path: "/resourcehub/list",
      },
      {
        label: "Delete History",
        description: "Restore removed resources",
        path: "/resourcehub/delete-history",
      },
      {
        label: "Data Center",
        description: "Import and export backups",
        path: "/resourcehub/data-center",
      },
    ],
  },
  {
    title: "Dev Utilities",
    description: "Quick tools and converters",
    match: (pathname) => pathname.startsWith("/devutilities"),
    items: [
      {
        label: "Utilities Home",
        description: "Tool overview",
        path: "/devutilities",
        exact: true,
      },
      {
        label: "Regex Tester",
        description: "Test expressions",
        path: "/devutilities/regex",
      },
      {
        label: "JSON Formatter",
        description: "Format and validate JSON",
        path: "/devutilities/json",
      },
      {
        label: "JWT Encoder",
        description: "Create and sign JWT tokens",
        path: "/devutilities/jwt-encode",
      },
      {
        label: "JSON YAML Converter",
        description: "Convert JSON and YAML",
        path: "/devutilities/json-yaml",
      },
      {
        label: "URL Parser",
        description: "Parse and build URLs",
        path: "/devutilities/url-parser",
      },
      {
        label: "Text Case Converter",
        description: "Convert text into different cases",
        path: "/devutilities/text-case",
      },
      {
        label: "Base64 / URL",
        description: "Encode and decode",
        path: "/devutilities/base64",
      },
      {
        label: "Timestamp",
        description: "Convert timestamps",
        path: "/devutilities/timestamp",
      },
      {
        label: "UUID Generator",
        description: "Generate UUIDs",
        path: "/devutilities/uuid",
      },
      {
        label: "JWT Decoder",
        description: "Inspect tokens",
        path: "/devutilities/jwt",
      },

      {
        label: "Diff Checker",
        description: "Compare text differences",
        path: "/devutilities/diff",
      },
      {
        label: "Code Sandbox",
        description: "Live HTML/CSS/JS preview",
        path: "/devutilities/code",
      },
      {
        label: "Hash Generator",
        description: "Generate crypto hashes",
        path: "/devutilities/hash",
      },
      {
        label: "Color Converter",
        description: "Convert colors and check contrast",
        path: "/devutilities/color",
      },
      {
        label: "QR Code Generator",
        description: "Generate QR codes",
        path: "/devutilities/qrcode",
      },
      {
        label: "Markdown Previewer",
        description: "Preview markdown syntax",
        path: "/devutilities/markdown",
      },
      {
        label: "Mock JSON Generator",
        description: "Generate mock JSON data",
        path: "/devutilities/mock-json-generator",
      },
      {
        label: "JSON Schema Validator",
        description: "Validate JSON data against a schema",
        path: "/devutilities/json-schema-validator",
      },
      {
        label: "Markdown Table Generator",
        description: "Build markdown tables visually",
        path: "/devutilities/markdown-table-genertaor",
      },
      {
        label: "SQL Formatter",
        description: "Format and minify SQL queries",
        path: "/devutilities/sql",
      },
      {
        label: "HTML Entity Converter",
        description: "Encode/decode HTML entities",
        path: "/devutilities/html-entity",
      },
      {
        label: "Flexbox & Grid Generator",
        description: "Generate CSS flexbox and grid completely offline",
        path: "/devutilities/flexbox-grid-generator",
      },
      {
        label: "User Agent Parser",
        description:
          "Parse browser user-agent strings and inspect client environment",
        path: "/devutilities/user-agent",
      },
      {
        label: "Chmod Calculator",
        description:
          "Calculate Unix file permissions in decimal and octal notation.",
        path: "/devutilities/chmod",
        label: "CRON Expression Generator & Descriptor",
        description: "Generate and inspect CRON expressions. Fully offline.",
        path: "/devutilities/cron",
      },
      {
        label: "CSS Gradient Generator",
        description: "Create beautiful CSS gradients with live preview",
        path: "/devutilities/css-gradient",
      },
      {
        label: "String Inspector",
        description: "Analyze character, word, sentence, and paragraph counts",
        path: "/devutilities/string-inspector",
      },
    ],
  },
];

export default SIDEBAR_SECTIONS;
