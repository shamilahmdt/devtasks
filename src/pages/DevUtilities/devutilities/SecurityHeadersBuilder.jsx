import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const HEADER_INFO = {
  contentSecurityPolicy: {
    label: "Content-Security-Policy",
    description:
      "Controls which resources the browser is allowed to load and helps reduce XSS and injection attacks.",
  },
  hsts: {
    label: "Strict-Transport-Security",
    description:
      "Tells browsers to use HTTPS for future requests to your domain.",
  },
  frameOptions: {
    label: "X-Frame-Options",
    description:
      "Controls whether your site can be embedded inside an iframe.",
  },
  contentType: {
    label: "X-Content-Type-Options",
    description:
      "Prevents browsers from MIME-sniffing responses away from their declared content type.",
  },
  referrerPolicy: {
    label: "Referrer-Policy",
    description:
      "Controls how much referrer information browsers send with requests.",
  },
  permissionsPolicy: {
    label: "Permissions-Policy",
    description:
      "Controls access to browser features such as camera, microphone, and geolocation.",
  },
  coop: {
    label: "Cross-Origin-Opener-Policy",
    description:
      "Controls whether your browsing context can share a window group with cross-origin documents.",
  },
  corp: {
    label: "Cross-Origin-Resource-Policy",
    description:
      "Controls which origins can load resources from your site.",
  },
};

const DEFAULT_SETTINGS = {
  csp: {
    enabled: true,
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
    imgSrc: ["'self", "data:"],
    fontSrc: ["'self'"],
    connectSrc: ["'self'"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
  },

  hsts: {
    enabled: true,
    maxAge: "31536000",
    includeSubDomains: true,
    preload: false,
  },

  frameOptions: {
    enabled: true,
    value: "DENY",
  },

  contentType: {
    enabled: true,
  },

  referrerPolicy: {
    enabled: true,
    value: "strict-origin-when-cross-origin",
  },

  permissionsPolicy: {
    enabled: true,
    camera: "'none'",
    microphone: "'none'",
    geolocation: "'self'",
    payment: "'none'",
  },

  coop: {
    enabled: true,
    value: "same-origin",
  },

  corp: {
    enabled: true,
    value: "same-origin",
  },
};

const PRESETS = {
  Basic: {
    ...DEFAULT_SETTINGS,
    csp: {
      ...DEFAULT_SETTINGS.csp,
      connectSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
    },
    hsts: {
      ...DEFAULT_SETTINGS.hsts,
      enabled: false,
    },
    permissionsPolicy: {
      ...DEFAULT_SETTINGS.permissionsPolicy,
      enabled: false,
    },
    coop: {
      ...DEFAULT_SETTINGS.coop,
      enabled: false,
    },
    corp: {
      ...DEFAULT_SETTINGS.corp,
      enabled: false,
    },
  },

  SPA: {
    ...DEFAULT_SETTINGS,
    csp: {
      ...DEFAULT_SETTINGS.csp,
      connectSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },

  API: {
    ...DEFAULT_SETTINGS,
    csp: {
      ...DEFAULT_SETTINGS.csp,
      defaultSrc: ["'none'"],
      scriptSrc: ["'none'"],
      styleSrc: ["'none'"],
      imgSrc: ["'none'"],
      fontSrc: ["'none'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
    frameOptions: {
      ...DEFAULT_SETTINGS.frameOptions,
      value: "DENY",
    },
    permissionsPolicy: {
      ...DEFAULT_SETTINGS.permissionsPolicy,
      enabled: true,
    },
  },

  "Production Hardened": {
    ...DEFAULT_SETTINGS,
    csp: {
      ...DEFAULT_SETTINGS.csp,
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:"],
      connectSrc: ["'self'", "https:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
    hsts: {
      enabled: true,
      maxAge: "63072000",
      includeSubDomains: true,
      preload: true,
    },
  },
};

const OUTPUT_FORMATS = [
  { value: "http", label: "HTTP Headers" },
  { value: "nginx", label: "Nginx" },
  { value: "apache", label: "Apache" },
  { value: "express", label: "Express.js" },
  { value: "vercel", label: "Vercel" },
];

const cloneSettings = (settings) => JSON.parse(JSON.stringify(settings));

const quoteForConfig = (value) => value.replace(/"/g, '\\"');

const joinCspDirective = (name, values) => {
  if (!values || values.length === 0) return "";
  return `${name} ${values.join(" ")}`;
};

const buildCsp = (csp) => {
  const directives = [
    joinCspDirective("default-src", csp.defaultSrc),
    joinCspDirective("script-src", csp.scriptSrc),
    joinCspDirective("style-src", csp.styleSrc),
    joinCspDirective("img-src", csp.imgSrc),
    joinCspDirective("font-src", csp.fontSrc),
    joinCspDirective("connect-src", csp.connectSrc),
    joinCspDirective("frame-src", csp.frameSrc),
    joinCspDirective("object-src", csp.objectSrc),
  ].filter(Boolean);

  return directives.join("; ");
};

const buildHeaders = (settings) => {
  const headers = [];

  if (settings.csp.enabled) {
    headers.push({
      name: "Content-Security-Policy",
      value: buildCsp(settings.csp),
    });
  }

  if (settings.hsts.enabled) {
    let value = `max-age=${settings.hsts.maxAge}`;

    if (settings.hsts.includeSubDomains) {
      value += "; includeSubDomains";
    }

    if (settings.hsts.preload) {
      value += "; preload";
    }

    headers.push({
      name: "Strict-Transport-Security",
      value,
    });
  }

  if (settings.frameOptions.enabled) {
    headers.push({
      name: "X-Frame-Options",
      value: settings.frameOptions.value,
    });
  }

  if (settings.contentType.enabled) {
    headers.push({
      name: "X-Content-Type-Options",
      value: "nosniff",
    });
  }

  if (settings.referrerPolicy.enabled) {
    headers.push({
      name: "Referrer-Policy",
      value: settings.referrerPolicy.value,
    });
  }

  if (settings.permissionsPolicy.enabled) {
    const permissions = [
      `camera=${settings.permissionsPolicy.camera}`,
      `microphone=${settings.permissionsPolicy.microphone}`,
      `geolocation=${settings.permissionsPolicy.geolocation}`,
      `payment=${settings.permissionsPolicy.payment}`,
    ];

    headers.push({
      name: "Permissions-Policy",
      value: permissions.join(", "),
    });
  }

  if (settings.coop.enabled) {
    headers.push({
      name: "Cross-Origin-Opener-Policy",
      value: settings.coop.value,
    });
  }

  if (settings.corp.enabled) {
    headers.push({
      name: "Cross-Origin-Resource-Policy",
      value: settings.corp.value,
    });
  }

  return headers;
};

const generateOutput = (headers, format) => {
  if (format === "http") {
    return headers.map((header) => `${header.name}: ${header.value}`).join("\n");
  }

  if (format === "nginx") {
    return headers
      .map(
        (header) =>
          `add_header ${header.name} "${quoteForConfig(header.value)}" always;`
      )
      .join("\n");
  }

  if (format === "apache") {
    return headers
      .map(
        (header) =>
          `Header always set ${header.name} "${quoteForConfig(header.value)}"`
      )
      .join("\n");
  }

  if (format === "express") {
    return headers
      .map(
        (header) =>
          `res.setHeader("${header.name}", "${quoteForConfig(header.value)}");`
      )
      .join("\n");
  }

  if (format === "vercel") {
    return JSON.stringify(
      {
        headers: [
          {
            source: "/(.*)",
            headers: headers.map((header) => ({
              key: header.name,
              value: header.value,
            })),
          },
        ],
      },
      null,
      2
    );
  }

  return "";
};

const calculateScore = (settings) => {
  let score = 0;

  if (settings.csp.enabled) score += 25;
  if (settings.hsts.enabled) score += 15;
  if (settings.frameOptions.enabled) score += 10;
  if (settings.contentType.enabled) score += 10;
  if (settings.referrerPolicy.enabled) score += 10;
  if (settings.permissionsPolicy.enabled) score += 10;
  if (settings.coop.enabled) score += 5;
  if (settings.corp.enabled) score += 5;

  if (
    settings.csp.enabled &&
    settings.csp.scriptSrc.includes("'unsafe-inline'")
  ) {
    score -= 5;
  }

  if (
    settings.csp.enabled &&
    settings.csp.scriptSrc.includes("'unsafe-eval'")
  ) {
    score -= 5;
  }

  if (
    settings.hsts.enabled &&
    settings.hsts.maxAge === "0"
  ) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
};

const getScoreLabel = (score) => {
  if (score >= 90) {
    return {
      label: "Excellent",
      color: "text-emerald-500",
    };
  }

  if (score >= 75) {
    return {
      label: "Strong",
      color: "text-green-500",
    };
  }

  if (score >= 50) {
    return {
      label: "Moderate",
      color: "text-yellow-500",
    };
  }

  return {
    label: "Needs work",
    color: "text-red-500",
  };
};

const getRecommendations = (settings) => {
  const recommendations = [];

  if (!settings.csp.enabled) {
    recommendations.push({
      type: "warning",
      text: "Add a Content-Security-Policy to control which resources browsers can load.",
    });
  }

  if (!settings.hsts.enabled) {
    recommendations.push({
      type: "warning",
      text: "Enable HSTS when your website is served exclusively over HTTPS.",
    });
  }

  if (!settings.permissionsPolicy.enabled) {
    recommendations.push({
      type: "warning",
      text: "Consider adding Permissions-Policy to restrict browser features.",
    });
  }

  if (
    settings.csp.enabled &&
    settings.csp.scriptSrc.includes("'unsafe-inline'")
  ) {
    recommendations.push({
      type: "warning",
      text: "Avoid 'unsafe-inline' in script-src where possible. Prefer nonces or hashes.",
    });
  }

  if (
    settings.csp.enabled &&
    settings.csp.scriptSrc.includes("'unsafe-eval'")
  ) {
    recommendations.push({
      type: "warning",
      text: "Avoid 'unsafe-eval' in script-src unless your application specifically requires it.",
    });
  }

  if (
    settings.hsts.enabled &&
    Number(settings.hsts.maxAge) < 31536000
  ) {
    recommendations.push({
      type: "warning",
      text: "For production HSTS, consider a max-age of at least one year.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: "success",
      text: "Your configuration includes a strong baseline of common security headers.",
    });
  }

  return recommendations;
};

const Toggle = ({ enabled, onChange, dark }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    aria-pressed={enabled}
    className={`relative w-11 h-6 rounded-full shrink-0 transition-colors duration-200 focus:outline-none ${
      enabled
        ? dark
          ? "bg-white"
          : "bg-black"
        : dark
        ? "bg-zinc-700"
        : "bg-neutral-300"
    }`}
  >
    <span
      className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md transition-all duration-200 ${
        enabled ? "right-0.5" : "left-0.5"
      } ${enabled && dark ? "bg-black" : "bg-white"}`}
    />
  </button>
);

const SectionHeader = ({ title, description, enabled, onToggle, dark }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="min-w-0">
      <h3
        className={`text-sm font-black uppercase tracking-wide ${
          dark ? "text-white" : "text-black"
        }`}
      >
        {title}
      </h3>

      <p
        className={`mt-1 text-xs leading-relaxed ${
          dark ? "text-zinc-500" : "text-neutral-500"
        }`}
      >
        {description}
      </p>
    </div>

    {typeof enabled === "boolean" && onToggle && (
      <Toggle enabled={enabled} onChange={onToggle} dark={dark} />
    )}
  </div>
);

const SecurityHeadersBuilder = () => {
  const { dark } = useTheme();

  const [settings, setSettings] = useState(() =>
    cloneSettings(DEFAULT_SETTINGS)
  );

  const [outputFormat, setOutputFormat] = useState("http");

  const headers = useMemo(
    () => buildHeaders(settings),
    [settings]
  );

  const output = useMemo(
    () => generateOutput(headers, outputFormat),
    [headers, outputFormat]
  );

  const score = useMemo(
    () => calculateScore(settings),
    [settings]
  );

  const scoreInfo = getScoreLabel(score);

  const recommendations = useMemo(
    () => getRecommendations(settings),
    [settings]
  );

  const updateSection = (section, updates) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        ...updates,
      },
    }));
  };

  const updatePermission = (key, value) => {
    setSettings((current) => ({
      ...current,
      permissionsPolicy: {
        ...current.permissionsPolicy,
        [key]: value,
      },
    }));
  };

  const addCspSource = (directive, source) => {
    const cleanSource = source.trim();

    if (!cleanSource) return;

    setSettings((current) => {
      const existing = current.csp[directive] || [];

      if (existing.includes(cleanSource)) {
        return current;
      }

      return {
        ...current,
        csp: {
          ...current.csp,
          [directive]: [...existing, cleanSource],
        },
      };
    });
  };

  const removeCspSource = (directive, source) => {
    setSettings((current) => ({
      ...current,
      csp: {
        ...current.csp,
        [directive]: current.csp[directive].filter(
          (item) => item !== source
        ),
      },
    }));
  };

  const applyPreset = (presetName) => {
    setSettings(cloneSettings(PRESETS[presetName]));
    toast.success(`${presetName} preset applied`);
  };

  const reset = () => {
    setSettings(cloneSettings(DEFAULT_SETTINGS));
    setOutputFormat("http");
    toast.success("Configuration reset");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Configuration copied to clipboard");
    } catch {
      toast.error("Failed to copy configuration");
    }
  };

  const inputClass = `w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all duration-300 ${
    dark
      ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus:border-white focus:ring-1 focus:ring-white"
      : "bg-white border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
  }`;

  const selectClass = `px-3 py-2 rounded-xl border text-xs outline-none transition-all ${
    dark
      ? "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-white"
      : "bg-white border-neutral-300 text-neutral-800 focus:border-black"
  }`;

  const labelClass = `text-[11px] font-black uppercase tracking-widest ${
    dark ? "text-zinc-500" : "text-neutral-400"
  }`;

  const panelClass = `rounded-2xl border p-4 ${
    dark
      ? "bg-zinc-950/50 border-zinc-800/80"
      : "bg-neutral-50 border-neutral-200/85"
  }`;

  const softBtnClass = `rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all duration-200 ${
    dark
      ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
      : "bg-white border-neutral-200 text-zinc-600 hover:text-black hover:border-neutral-400"
  }`;

  const primaryBtnClass = `rounded-xl border px-6 py-3 text-xs font-black uppercase tracking-widest transition-all duration-200 hover:scale-105 ${
    dark
      ? "bg-white text-black border-white hover:bg-zinc-200"
      : "bg-black text-white border-black hover:bg-zinc-800"
  }`;

  const presetChipClass = (active = false) =>
    `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
      active
        ? dark
          ? "border-white text-black bg-white"
          : "border-black text-white bg-black"
        : dark
        ? "border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
        : "border-neutral-200 text-neutral-500 hover:text-black hover:border-neutral-300"
    }`;

  // CSP source values ('self', data:, https://...) are literal syntax, not labels —
  // never text-transformed, always shown in monospace like the header value blocks below.
  const sourceChipClass = `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border transition-colors ${
    dark
      ? "border-zinc-700 text-zinc-200 bg-zinc-800"
      : "border-neutral-300 text-neutral-800 bg-neutral-100"
  }`;

  // Inline field labels paired with a control (Max Age, Camera, Microphone...) —
  // matches the reference's "Delimiter" label: plain case, not a standalone section label.
  const fieldLabelClass = `text-xs font-semibold ${
    dark ? "text-zinc-300" : "text-neutral-700"
  }`;

  return (
    <div
      className={`min-h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden relative ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      {/* Decorative background */}
      <div
        className={`absolute top-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />

      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${
          dark ? "bg-zinc-900" : "bg-neutral-100"
        }`}
      />

      {/* Main card */}
      <div
        className={`relative z-10 w-full max-w-7xl mx-auto rounded-[32px] border shadow-xl flex flex-col overflow-hidden transition-all duration-300 ${
          dark
            ? "bg-zinc-900 border-zinc-800"
            : "bg-white border-neutral-200"
        }`}
      >
        {/* Accent bar */}
        <div
          className={`h-2 w-full ${
            dark ? "bg-white" : "bg-black"
          }`}
        />

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex items-center gap-3">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
              dark
                ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                : "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-300"
            }`}
            title="Back to Workspace"
          >
            <svg
              className="w-4 h-4"
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

          <div className="min-w-0 flex-1">
            <h1
              className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
                dark ? "text-white" : "text-black"
              }`}
            >
              Security Headers Builder
            </h1>

            <p
              className={`mt-1 text-xs ${
                dark ? "text-zinc-500" : "text-neutral-500"
              }`}
            >
              Build common web security headers and generate deployment-ready
              configuration.
            </p>
          </div>

          <button
            onClick={reset}
            className={`hidden sm:block ${softBtnClass}`}
          >
            Reset
          </button>
        </div>

        {/* Content */}
        <div className="px-5 sm:px-8 pt-5 pb-6 sm:pb-8">
          {/* Presets */}
          <div className={`${panelClass} mb-4`}>
            <div className="flex flex-wrap items-center gap-3">
              <span className={labelClass}>Presets</span>

              <div className="flex flex-wrap gap-1.5">
                {Object.keys(PRESETS).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => applyPreset(preset)}
                    className={presetChipClass()}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <button
                onClick={reset}
                className={`ml-auto text-xs font-black uppercase tracking-widest sm:hidden ${
                  dark
                    ? "text-zinc-400 hover:text-white"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Two-column workspace */}
          <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4">
            {/* LEFT: Configuration */}
            <div className="space-y-4">
              {/* CSP */}
              <div className={panelClass}>
                <SectionHeader
                  title={HEADER_INFO.contentSecurityPolicy.label}
                  description={HEADER_INFO.contentSecurityPolicy.description}
                  enabled={settings.csp.enabled}
                  onToggle={(value) =>
                    updateSection("csp", { enabled: value })
                  }
                  dark={dark}
                />

                {settings.csp.enabled && (
                  <div className="mt-4 space-y-3">
                    {[
                      ["defaultSrc", "default-src"],
                      ["scriptSrc", "script-src"],
                      ["styleSrc", "style-src"],
                      ["imgSrc", "img-src"],
                      ["fontSrc", "font-src"],
                      ["connectSrc", "connect-src"],
                      ["frameSrc", "frame-src"],
                      ["objectSrc", "object-src"],
                    ].map(([key, label]) => (
                      <CspDirective
                        key={key}
                        label={label}
                        sources={settings.csp[key]}
                        dark={dark}
                        sourceChipClass={sourceChipClass}
                        inputClass={inputClass}
                        onAdd={(source) => addCspSource(key, source)}
                        onRemove={(source) =>
                          removeCspSource(key, source)
                        }
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* HSTS */}
              <div className={panelClass}>
                <SectionHeader
                  title={HEADER_INFO.hsts.label}
                  description={HEADER_INFO.hsts.description}
                  enabled={settings.hsts.enabled}
                  onToggle={(value) =>
                    updateSection("hsts", { enabled: value })
                  }
                  dark={dark}
                />

                {settings.hsts.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    <div>
                      <label className={fieldLabelClass}>Max Age</label>
                      <input
                        type="number"
                        min="0"
                        value={settings.hsts.maxAge}
                        onChange={(e) =>
                          updateSection("hsts", {
                            maxAge: e.target.value,
                          })
                        }
                        className={`${inputClass} mt-2`}
                      />
                    </div>

                    <label
                      className={`flex items-center gap-2 cursor-pointer text-xs ${
                        dark ? "text-zinc-300" : "text-neutral-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={settings.hsts.includeSubDomains}
                        onChange={(e) =>
                          updateSection("hsts", {
                            includeSubDomains: e.target.checked,
                          })
                        }
                        className={dark ? "accent-white" : "accent-black"}
                      />
                      Include subdomains
                    </label>

                    <label
                      className={`flex items-center gap-2 cursor-pointer text-xs ${
                        dark ? "text-zinc-300" : "text-neutral-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={settings.hsts.preload}
                        onChange={(e) =>
                          updateSection("hsts", {
                            preload: e.target.checked,
                          })
                        }
                        className={dark ? "accent-white" : "accent-black"}
                      />
                      Preload
                    </label>
                  </div>
                )}
              </div>

              {/* Other headers */}
              <div className={panelClass}>
                <div className="mb-4">
                  <h3
                    className={`text-sm font-black uppercase tracking-wide ${
                      dark ? "text-white" : "text-black"
                    }`}
                  >
                    Browser Security Controls
                  </h3>

                  <p
                    className={`mt-1 text-xs ${
                      dark ? "text-zinc-500" : "text-neutral-500"
                    }`}
                  >
                    Configure additional commonly used response headers.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* X-Frame-Options */}
                  <div
                    className={`rounded-xl border p-3 ${
                      dark
                        ? "border-zinc-800 bg-zinc-900"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <SectionHeader
                      title={HEADER_INFO.frameOptions.label}
                      description={HEADER_INFO.frameOptions.description}
                      enabled={settings.frameOptions.enabled}
                      onToggle={(value) =>
                        updateSection("frameOptions", {
                          enabled: value,
                        })
                      }
                      dark={dark}
                    />

                    {settings.frameOptions.enabled && (
                      <select
                        value={settings.frameOptions.value}
                        onChange={(e) =>
                          updateSection("frameOptions", {
                            value: e.target.value,
                          })
                        }
                        className={`${selectClass} mt-3`}
                      >
                        <option value="DENY">DENY</option>
                        <option value="SAMEORIGIN">SAMEORIGIN</option>
                      </select>
                    )}
                  </div>

                  {/* Content type */}
                  <div
                    className={`rounded-xl border p-3 ${
                      dark
                        ? "border-zinc-800 bg-zinc-900"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <SectionHeader
                      title={HEADER_INFO.contentType.label}
                      description={HEADER_INFO.contentType.description}
                      enabled={settings.contentType.enabled}
                      onToggle={(value) =>
                        updateSection("contentType", {
                          enabled: value,
                        })
                      }
                      dark={dark}
                    />
                  </div>

                  {/* Referrer Policy */}
                  <div
                    className={`rounded-xl border p-3 ${
                      dark
                        ? "border-zinc-800 bg-zinc-900"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <SectionHeader
                      title={HEADER_INFO.referrerPolicy.label}
                      description={HEADER_INFO.referrerPolicy.description}
                      enabled={settings.referrerPolicy.enabled}
                      onToggle={(value) =>
                        updateSection("referrerPolicy", {
                          enabled: value,
                        })
                      }
                      dark={dark}
                    />

                    {settings.referrerPolicy.enabled && (
                      <select
                        value={settings.referrerPolicy.value}
                        onChange={(e) =>
                          updateSection("referrerPolicy", {
                            value: e.target.value,
                          })
                        }
                        className={`${selectClass} mt-3 w-full sm:w-auto`}
                      >
                        <option value="no-referrer">no-referrer</option>
                        <option value="strict-origin">
                          strict-origin
                        </option>
                        <option value="strict-origin-when-cross-origin">
                          strict-origin-when-cross-origin
                        </option>
                        <option value="same-origin">same-origin</option>
                        <option value="origin">origin</option>
                        <option value="no-referrer-when-downgrade">
                          no-referrer-when-downgrade
                        </option>
                      </select>
                    )}
                  </div>

                  {/* Permissions Policy */}
                  <div
                    className={`rounded-xl border p-3 ${
                      dark
                        ? "border-zinc-800 bg-zinc-900"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <SectionHeader
                      title={HEADER_INFO.permissionsPolicy.label}
                      description={HEADER_INFO.permissionsPolicy.description}
                      enabled={settings.permissionsPolicy.enabled}
                      onToggle={(value) =>
                        updateSection("permissionsPolicy", {
                          enabled: value,
                        })
                      }
                      dark={dark}
                    />

                    {settings.permissionsPolicy.enabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        {[
                          ["camera", "Camera"],
                          ["microphone", "Microphone"],
                          ["geolocation", "Geolocation"],
                          ["payment", "Payment"],
                        ].map(([key, label]) => (
                          <div key={key}>
                            <label className={fieldLabelClass}>{label}</label>

                            <select
                              value={settings.permissionsPolicy[key]}
                              onChange={(e) =>
                                updatePermission(
                                  key,
                                  e.target.value
                                )
                              }
                              className={`${selectClass} mt-2 w-full`}
                            >
                              <option value="'none'">None</option>
                              <option value="'self'">Self</option>
                              <option value="*">All origins</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* COOP */}
                  <div
                    className={`rounded-xl border p-3 ${
                      dark
                        ? "border-zinc-800 bg-zinc-900"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <SectionHeader
                      title={HEADER_INFO.coop.label}
                      description={HEADER_INFO.coop.description}
                      enabled={settings.coop.enabled}
                      onToggle={(value) =>
                        updateSection("coop", { enabled: value })
                      }
                      dark={dark}
                    />

                    {settings.coop.enabled && (
                      <select
                        value={settings.coop.value}
                        onChange={(e) =>
                          updateSection("coop", {
                            value: e.target.value,
                          })
                        }
                        className={`${selectClass} mt-3`}
                      >
                        <option value="same-origin">same-origin</option>
                        <option value="same-origin-allow-popups">
                          same-origin-allow-popups
                        </option>
                        <option value="unsafe-none">unsafe-none</option>
                      </select>
                    )}
                  </div>

                  {/* CORP */}
                  <div
                    className={`rounded-xl border p-3 ${
                      dark
                        ? "border-zinc-800 bg-zinc-900"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <SectionHeader
                      title={HEADER_INFO.corp.label}
                      description={HEADER_INFO.corp.description}
                      enabled={settings.corp.enabled}
                      onToggle={(value) =>
                        updateSection("corp", { enabled: value })
                      }
                      dark={dark}
                    />

                    {settings.corp.enabled && (
                      <select
                        value={settings.corp.value}
                        onChange={(e) =>
                          updateSection("corp", {
                            value: e.target.value,
                          })
                        }
                        className={`${selectClass} mt-3`}
                      >
                        <option value="same-origin">same-origin</option>
                        <option value="same-site">same-site</option>
                        <option value="cross-origin">
                          cross-origin
                        </option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Score + Output */}
            <div className="space-y-4">
              {/* Score */}
              <div className={panelClass}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className={labelClass}>Security Score</span>

                    <div className="flex items-baseline gap-2 mt-1">
                      <span
                        className={`text-4xl font-black ${
                          dark ? "text-white" : "text-black"
                        }`}
                      >
                        {score}
                      </span>

                      <span
                        className={`text-sm font-bold ${
                          dark ? "text-zinc-400" : "text-neutral-500"
                        }`}
                      >
                        / 100
                      </span>
                    </div>
                  </div>

                  <div
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      score >= 75
                        ? dark
                          ? "border-white text-black bg-white"
                          : "border-black text-white bg-black"
                        : score >= 50
                        ? dark
                          ? "border-zinc-600 text-zinc-300"
                          : "border-neutral-300 text-neutral-600"
                        : "border-red-500/60 text-red-500 bg-red-500/10"
                    }`}
                  >
                    {scoreInfo.label}
                  </div>
                </div>

                <div
                  className={`mt-4 h-2 rounded-full overflow-hidden ${
                    dark ? "bg-zinc-800" : "bg-neutral-200"
                  }`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      score >= 50
                        ? dark
                          ? "bg-white"
                          : "bg-black"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>

                <div className="mt-4 space-y-2">
                  {recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className={`flex gap-2 text-xs leading-relaxed ${
                        dark ? "text-zinc-400" : "text-neutral-600"
                      }`}
                    >
                      <span
                        className={
                          recommendation.type === "success"
                            ? dark
                              ? "text-white"
                              : "text-black"
                            : "text-red-500"
                        }
                      >
                        {recommendation.type === "success" ? "✓" : "!"}
                      </span>

                      <span>{recommendation.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active headers */}
              <div className={panelClass}>
                <div className="flex items-center justify-between mb-3">
                  <span className={labelClass}>
                    Generated Headers
                  </span>

                  <span
                    className={`text-[10px] font-semibold ${
                      dark ? "text-zinc-600" : "text-neutral-400"
                    }`}
                  >
                    {headers.length} active
                  </span>
                </div>

                <div className="space-y-2">
                  {headers.map((header) => (
                    <div
                      key={header.name}
                      className={`rounded-xl border px-3 py-2 ${
                        dark
                          ? "border-zinc-800 bg-zinc-900"
                          : "border-neutral-200 bg-white"
                      }`}
                    >
                      <div
                        className={`text-[10px] font-bold ${
                          dark ? "text-zinc-300" : "text-neutral-700"
                        }`}
                      >
                        {header.name}
                      </div>

                      <div
                        className={`mt-1 text-[10px] font-mono break-all ${
                          dark ? "text-zinc-500" : "text-neutral-500"
                        }`}
                      >
                        {header.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Output */}
              <div className="flex flex-col min-h-[420px]">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <label className={labelClass}>
                    Configuration Output
                  </label>

                  <div className="flex gap-2">
                    <select
                      value={outputFormat}
                      onChange={(e) =>
                        setOutputFormat(e.target.value)
                      }
                      className={selectClass}
                    >
                      {OUTPUT_FORMATS.map((format) => (
                        <option
                          key={format.value}
                          value={format.value}
                        >
                          {format.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleCopy}
                      className={softBtnClass}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="relative flex-1 flex flex-col rounded-2xl overflow-hidden border bg-[#0D1117] border-zinc-800 shadow-inner min-h-[320px]">
                  <div className="flex items-center gap-2 px-4 py-3 bg-[#161B22] border-b border-zinc-800">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />

                    <span className="ml-2 text-[10px] text-zinc-500 font-mono">
                      {OUTPUT_FORMATS.find(
                        (item) => item.value === outputFormat
                      )?.label || "HTTP Headers"}
                    </span>
                  </div>

                  <pre className="flex-1 p-5 overflow-auto font-mono text-[11px] sm:text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed custom-scrollbar">
                    {output}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-xs leading-relaxed ${
              dark
                ? "border-zinc-800 bg-zinc-950 text-zinc-500"
                : "border-neutral-200 bg-neutral-50 text-neutral-500"
            }`}
          >
            <strong
              className={dark ? "text-zinc-300" : "text-neutral-700"}
            >
              Note:
            </strong>{" "}
            This tool generates a practical baseline configuration. Security
            headers should still be tested against your application's actual
            resources and deployment environment before production use.
          </div>
        </div>
      </div>
    </div>
  );
};

const CspDirective = ({
  label,
  sources,
  dark,
  sourceChipClass,
  inputClass,
  onAdd,
  onRemove,
}) => {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    const cleanValue = value.trim();

    if (!cleanValue) return;

    onAdd(cleanValue);
    setValue("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span
          className={`text-[10px] font-mono font-bold ${
            dark ? "text-zinc-300" : "text-neutral-700"
          }`}
        >
          {label}
        </span>

        <div className="flex flex-wrap gap-1.5">
          {sources.map((source) => (
            <span
              key={source}
              className={sourceChipClass}
            >
              {source}

              <button
                type="button"
                onClick={() => onRemove(source)}
                className="ml-0.5 opacity-60 hover:opacity-100"
                aria-label={`Remove ${source}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add source, e.g. https://cdn.example.com"
          className={inputClass}
        />

        <button
          type="button"
          onClick={handleAdd}
          className={`px-3 rounded-xl border text-xs font-semibold shrink-0 transition-colors ${
            dark
              ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default SecurityHeadersBuilder;