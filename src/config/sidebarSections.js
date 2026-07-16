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
        label: "Keyboard Keycode Inspector",
        path: "/devutilities/keycode-inspector",
        description: "Inspect keyboard events in real time.",
      },
      {
        label: "JSON Formatter",
        description: "Format and validate JSON",
        path: "/devutilities/json",
      },
      {
        label: "JSON YAML CSV XML Converter",
        description: "Convert JSON, YAML, CSV and XML formats",
        path: "/devutilities/json-yaml-csv-xml",
      },
      {
        label: "XML Validator & Formatter",
        description: "Validate syntax and beautify or minify XML data.",
        path: "/devutilities/xml-validator",
      },
      {
        label: "JSON Schema Validator",
        description: "Validate JSON data against a schema",
        path: "/devutilities/json-schema-validator",
      },
      {
        label: "Mock JSON Generator",
        description: "Generate mock JSON data",
        path: "/devutilities/mock-json-generator",
      },
      {
        label: "SQL Formatter",
        description: "Format and minify SQL queries",
        path: "/devutilities/sql",
      },
      {
        label: "Markdown Previewer",
        description: "Preview markdown syntax",
        path: "/devutilities/markdown",
      },
      {
        label: "Markdown Table Generator",
        description: "Build markdown tables visually",
        path: "/devutilities/markdown-table-generator",
      },
      {
        label: "Regex Tester",
        description: "Test expressions",
        path: "/devutilities/regex",
      },
      {
        label: "Text Case Converter",
        description: "Convert text into different cases",
        path: "/devutilities/text-case",
      },
      {
        label: "String Inspector",
        description: "Analyze character, word, sentence, and paragraph counts",
        path: "/devutilities/string-inspector",
      },
      {
        label: "Diff Checker",
        description: "Compare text differences",
        path: "/devutilities/diff",
      },
      {
        label: "Base64 / URL",
        description: "Encode and decode",
        path: "/devutilities/base64",
      },
      {
        label: "Base64 Image",
        description: "Encode/decode images with Base64",
        path: "/devutilities/base64-image",
      },
      {
        label: "Morse Code Converter",
        description: "Convert text and Morse code",
        path: "/devutilities/morse-code",
      },
      {
        label: "YAML ↔ TOML Converter",
        description: "Convert between YAML and TOML formats",
        path: "/devutilities/yaml-toml",
      },
      {
        label: "JSON → Types Converter",
        description: "Convert JSON into TypeScript interfaces and Go structs.",
        path: "/devutilities/json-types-converter",
      },
      {
        label: "HTML Entity Converter",
        description: "Encode/decode HTML entities",
        path: "/devutilities/html-entity",
      },
      {
        label: "URL Parser",
        description: "Parse and build URLs",
        path: "/devutilities/url-parser",
      },
      {
        label: "User Agent Parser",
        description:
          "Parse browser user-agent strings and inspect client environment",
        path: "/devutilities/user-agent",
      },
      {
        label: "Subnet Calculator",
        description: "Calculate IPv4 subnets, CIDR ranges, and host counts",
        path: "/devutilities/subnet",
      },
      {
        label: "Chmod Calculator",
        description:
          "Calculate Unix file permissions in decimal and octal notation.",
        path: "/devutilities/chmod",
      },
      {
        label: "Number Base Converter",
        description: "Convert between decimal, hex, binary, and octal",
        path: "/devutilities/number-base-converter",
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
        label: "Hash Generator",
        description: "Generate crypto hashes",
        path: "/devutilities/hash",
      },
      {
        label: "Bcrypt Generator",
        description:
          "Generate and verify bcrypt password hashes entirely offline.",
        path: "/devutilities/bcrypt",
      },
      {
        label: "JWT Encoder",
        description: "Create and sign JWT tokens",
        path: "/devutilities/jwt-encode",
      },
      {
        label: "JWT Decoder",
        description: "Inspect tokens",
        path: "/devutilities/jwt",
      },
      {
        label: "CSS Clip-path Maker & Shape Generator",
        description:
          "Design CSS clip-path shapes with draggable vertices, presets, and instant copy-ready CSS output.",
        path: "/devutilities/clip-path",
      },
      {
        label: "CSS Animation Generator",
        description:
          "Create custom keyframe animations, customize duration and timing functions, and copy generated CSS.",
        path: "/devutilities/css-animation",
      },
      {
        label: "CSS Gradient Generator",
        description: "Create beautiful CSS gradients with live preview",
        path: "/devutilities/css-gradient",
      },
      {
        label: "CSS Border-Image Generator",
        description:
          "Design custom sliced image borders and generate copy-ready CSS properties visually.",
        path: "/devutilities/border-image",
      },
      {
        label: "Glassmorphism Playground",
        description: "Design glassmorphism effects with shadows and blur",
        path: "/devutilities/glassmorphism",
      },
      {
        label: "CSS Unit Converter",
        description:
          "Convert CSS units and generate fluid typography clamp function",
        path: "/devutilities/css-unit-converter",
      },
      {
        label: "Flexbox & Grid Generator",
        description: "Generate CSS flexbox and grid completely offline",
        path: "/devutilities/flexbox-grid-generator",
      },
      {
        label: "Color Converter",
        description: "Convert colors and check contrast",
        path: "/devutilities/color",
      },
      {
        label: "Image Color Palette Extractor",
        description:
          "Extract dominant color palettes and HEX codes from any uploaded image client-side.",
        path: "/devutilities/color-extractor",
      },
      {
        label: "QR Code Generator",
        description: "Generate QR codes",
        path: "/devutilities/qrcode",
      },
      {
        label: "Code Sandbox",
        description: "Live HTML/CSS/JS preview",
        path: "/devutilities/code",
      },
      {
        label: "CRON Expression Generator & Descriptor",
        description: "Generate and inspect CRON expressions. Fully offline.",
        path: "/devutilities/cron",
      },
      {
        label: "SVG Optimizer & React JSX Generator",
        description: "Optimize, clean, and convert SVG code into optimized React JSX/TSX components instantly.",
        path: "/devutilities/svg-optimizer",
      },
      {
        label: "Password Generator",
        description:
          "Generate secure passwords and analyze entropy, strength, and crack times.",
        path: "/devutilities/password-generator",
      },
      {
        label: "Lorem Ipsum Generator",
        description: "Generate dummy placeholder text offline",
        path: "/devutilities/lorem-ipsum",
      },
      {
        label: "HTML Multi Converter",
        description: "HTML to JSX, Markdown & Text",
        path: "/devutilities/html-multi-converter",
      },
      {
        label: "JSON Path & JSON Query Playground",
        description: "JSON Path and JSON Query Playground. Fully offline.",
        path: "/devutilities/jsonpath-playground",
      },
      {
        label: "Design Token Generator",
        description:
          "Generate design system tokens for colors, typography, and spacing. Export as CSS variables, Tailwind config, or Sass. Fully offline.",
        path: "/devutilities/design-tokens",
      },
      {
        label: "Docker Configuration Generator",
        description: "Generate production-ready Dockerfile and docker-compose.yml configurations client-side.",
        path: "/devutilities/docker-generator",
      },
      {
        label: "Word Counter",
        description: "Character & word count tool",
        path: "/devutilities/word-counter",
      },
     
      {
        label: "Text List Cleaner",
        description: "Sort, clean, and remove duplicate text lines",
        path: "/devutilities/text-list-cleaner",
      },

      {
        label: "SQL Schema Converter",
        description:
          "Convert SQL CREATE TABLE schemas into JSON Schema and Markdown tables.",
        path: "/devutilities/sql-converter",
      },
      {
        label: "Git Command Builder",
        description:
          "Scenario-based Git command builder to help find and customize commands for common tasks.",
        path: "/devutilities/git-builder",
      },
      {
        label: ".gitignore Generator",
        description:
          "Generate custom, compiled .gitignore configurations for languages, IDEs, and OS environments.",
        path: "/devutilities/gitignore-generator",
      },
      {
        label: "URL Slug Generator & Text Sanitizer",
        description:
          "Convert raw text into clean, URL-safe slugs with customizable separators, casing, and accent stripping.",
        path: "/devutilities/slug-generator",
      },
      {
        label: "Robots.txt Generator",
        description: "Generate robots.txt files for your website.",
        path: "/devutilities/robots-txt-generator",
      },
      {
        label: "ASCII Art Generator",
        description:
          "Convert text strings into custom ASCII art banners for code comments and terminals.",
        path: "/devutilities/ascii-banner",
      },
      {
        label: "Image Optimizer",
        description:
          "Compress, resize, and convert images to WebP/JPEG/PNG client-side.",
        path: "/devutilities/image-optimizer",
      },
      {
        label: "API Status Checker",
        description:
          "Test API endpoints and inspect HTTP status, response time and output",
        path: "/devutilities/api-status-checker",
      },
      {
        label: "Meta Tags Generator",
        description:
          "Generate SEO, Open Graph, and Twitter Card meta tags with live previews",
        path: "/devutilities/meta-tags",
      },
      {
        label: "Favicon Generator",
        description:
          "Generate multi-size favicons and web manifest from a single image.",
        path: "/devutilities/favicon-generator",
      },
      {
        label: "SVG Wave & Shape Divider Generator",
        description: "Design organic SVG section dividers and curves visually.",
        path: "/devutilities/shape-divider",
      },
    ],
  },
];

export default SIDEBAR_SECTIONS;
