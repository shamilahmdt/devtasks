import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

function CharBadge({ current, max }) {
  const pct = current / max;
  let color = "text-emerald-500";
  if (pct > 1) color = "text-red-500";
  else if (pct > 0.85) color = "text-amber-500";
  return (
    <span className={`text-[10px] font-bold tabular-nums ${color}`}>
      {current}/{max}
    </span>
  );
}

function Toggle({ enabled, onChange, label, t }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 cursor-pointer ${
          enabled
            ? "bg-zinc-900 border-zinc-700 dark:bg-white dark:border-zinc-300"
            : "bg-zinc-200 border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-sm transition-transform duration-200 ${
            enabled
              ? "translate-x-4 bg-white dark:bg-zinc-900"
              : "translate-x-0 bg-white dark:bg-zinc-500"
          }`}
        />
      </button>
      <span className={`text-[10px] font-black uppercase tracking-widest ${t.label}`}>
        {label}
      </span>
    </label>
  );
}

function ImagePlaceholder({ dark, wide }) {
  return (
    <div
      className={`flex items-center justify-center ${wide ? "w-full aspect-[1.91/1]" : "w-full aspect-square"} rounded ${
        dark ? "bg-zinc-800/60" : "bg-zinc-100"
      }`}
    >
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="opacity-30">
        <rect x="6" y="10" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="17" cy="21" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M6 33l10-10 8 8 6-6 12 12H9a3 3 0 01-3-3v-1z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function MetaTagsGenerator() {
  const { dark } = useTheme();

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      card: "bg-white border-zinc-250/90 shadow-sm",
      headerBorder: "border-zinc-200",
      input: "bg-white border-zinc-250 text-zinc-900 focus:border-zinc-900 placeholder-zinc-400 focus:bg-white",
      select: "bg-white border-zinc-250 text-zinc-900 focus:border-zinc-900",
      buttonPrimary: "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]",
      buttonSecondary: "bg-white border-zinc-250 text-zinc-700 hover:bg-zinc-50 active:scale-[0.98]",
      buttonActive: "bg-zinc-900 text-white border-zinc-900",
      label: "text-zinc-500",
      previewCard: "bg-white border-zinc-200",
      previewLabel: "text-zinc-400",
      outputTextarea: "bg-[#F9FAFB] border-zinc-200 text-emerald-700 focus:border-zinc-300",
      sectionBorder: "border-zinc-200",
      googleTitle: "text-[#1a0dab]",
      googleUrl: "text-[#006621]",
      googleDesc: "text-zinc-600",
      fbCard: "bg-[#f0f2f5] border-[#dadde1]",
      fbDomain: "text-[#606770]",
      fbTitle: "text-[#1d2129]",
      fbDesc: "text-[#606770]",
      twitterCard: "bg-white border-zinc-200",
      twitterTitle: "text-zinc-900",
      twitterDesc: "text-zinc-500",
      twitterDomain: "text-zinc-400",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      card: "bg-zinc-900/50 border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.4)]",
      headerBorder: "border-zinc-800/85",
      input: "bg-zinc-950/60 border-zinc-800 text-white focus:border-zinc-500 placeholder-zinc-600 focus:bg-zinc-950",
      select: "bg-zinc-950/60 border-zinc-800 text-white focus:border-zinc-500",
      buttonPrimary: "bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.98]",
      buttonSecondary: "bg-zinc-900 border-zinc-800/80 text-zinc-300 hover:bg-zinc-850 active:scale-[0.98]",
      buttonActive: "bg-white text-zinc-950 border-white",
      label: "text-zinc-400",
      previewCard: "bg-zinc-900/60 border-zinc-800/80",
      previewLabel: "text-zinc-500",
      outputTextarea: "bg-zinc-950/80 border-zinc-800/80 text-emerald-400 focus:border-zinc-700",
      sectionBorder: "border-zinc-800/60",
      googleTitle: "text-[#8ab4f8]",
      googleUrl: "text-[#bdc1c6]",
      googleDesc: "text-[#bdc1c6]",
      fbCard: "bg-zinc-800/50 border-zinc-700/60",
      fbDomain: "text-zinc-400",
      fbTitle: "text-zinc-100",
      fbDesc: "text-zinc-400",
      twitterCard: "bg-zinc-800/50 border-zinc-700/60",
      twitterTitle: "text-zinc-100",
      twitterDesc: "text-zinc-400",
      twitterDomain: "text-zinc-500",
    },
  };
  const t = dark ? theme.dark : theme.light;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [robots, setRobots] = useState("index, follow");

  const [ogEnabled, setOgEnabled] = useState(true);
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");

  const [twitterEnabled, setTwitterEnabled] = useState(true);
  const [twitterCardType, setTwitterCardType] = useState("summary_large_image");
  const [twitterTitle, setTwitterTitle] = useState("");
  const [twitterDescription, setTwitterDescription] = useState("");
  const [twitterImageUrl, setTwitterImageUrl] = useState("");
  const [twitterCreator, setTwitterCreator] = useState("");

  const [minified, setMinified] = useState(false);

  const resolvedOgTitle = ogTitle || title;
  const resolvedOgDesc = ogDescription || description;
  const resolvedTwitterTitle = twitterTitle || title;
  const resolvedTwitterDesc = twitterDescription || description;
  const resolvedTwitterImage = twitterImageUrl || ogImageUrl;

  const displayDomain = useMemo(() => {
    try {
      return new URL(canonicalUrl).hostname;
    } catch {
      return canonicalUrl || "example.com";
    }
  }, [canonicalUrl]);

  const generatedHtml = useMemo(() => {
    const tags = [];
    const indent = minified ? "" : "  ";
    const nl = minified ? "" : "\n";

    if (title) tags.push(`${indent}<title>${title}</title>`);
    if (description) tags.push(`${indent}<meta name="description" content="${description}" />`);
    if (keywords) tags.push(`${indent}<meta name="keywords" content="${keywords}" />`);
    if (robots) tags.push(`${indent}<meta name="robots" content="${robots}" />`);
    if (canonicalUrl) tags.push(`${indent}<link rel="canonical" href="${canonicalUrl}" />`);

    if (ogEnabled) {
      if (tags.length > 0) tags.push("");
      tags.push(`${indent}<!-- Open Graph / Facebook -->`);
      tags.push(`${indent}<meta property="og:type" content="website" />`);
      if (resolvedOgTitle) tags.push(`${indent}<meta property="og:title" content="${resolvedOgTitle}" />`);
      if (resolvedOgDesc) tags.push(`${indent}<meta property="og:description" content="${resolvedOgDesc}" />`);
      if (ogImageUrl) tags.push(`${indent}<meta property="og:image" content="${ogImageUrl}" />`);
      if (canonicalUrl) tags.push(`${indent}<meta property="og:url" content="${canonicalUrl}" />`);
    }

    if (twitterEnabled) {
      if (tags.length > 0) tags.push("");
      tags.push(`${indent}<!-- Twitter Card -->`);
      tags.push(`${indent}<meta name="twitter:card" content="${twitterCardType}" />`);
      if (resolvedTwitterTitle) tags.push(`${indent}<meta name="twitter:title" content="${resolvedTwitterTitle}" />`);
      if (resolvedTwitterDesc) tags.push(`${indent}<meta name="twitter:description" content="${resolvedTwitterDesc}" />`);
      if (resolvedTwitterImage) tags.push(`${indent}<meta name="twitter:image" content="${resolvedTwitterImage}" />`);
      if (twitterCreator) tags.push(`${indent}<meta name="twitter:creator" content="${twitterCreator}" />`);
    }

    if (minified) {
      return tags.filter(Boolean).join("");
    }
    return tags.join("\n");
  }, [
    title, description, keywords, robots, canonicalUrl,
    ogEnabled, resolvedOgTitle, resolvedOgDesc, ogImageUrl,
    twitterEnabled, twitterCardType, resolvedTwitterTitle, resolvedTwitterDesc, resolvedTwitterImage, twitterCreator,
    minified,
  ]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(generatedHtml);
    toast.success("Meta tags copied to clipboard!");
  }, [generatedHtml]);

  const loadSample = () => {
    setTitle("DevTasks — Developer Workspace");
    setDescription("A unified workspace to manage tasks, snippets, bookmarks and developer utilities entirely offline.");
    setCanonicalUrl("https://devtasks.app");
    setKeywords("developer tools, task manager, code snippets, bookmarks, offline utilities");
    setRobots("index, follow");
    setOgEnabled(true);
    setOgTitle("");
    setOgDescription("");
    setOgImageUrl("https://devtasks.app/og-banner.png");
    setTwitterEnabled(true);
    setTwitterCardType("summary_large_image");
    setTwitterTitle("");
    setTwitterDescription("");
    setTwitterImageUrl("");
    setTwitterCreator("@devtasks");
  };

  const clearAll = () => {
    setTitle(""); setDescription(""); setCanonicalUrl(""); setKeywords(""); setRobots("index, follow");
    setOgEnabled(true); setOgTitle(""); setOgDescription(""); setOgImageUrl("");
    setTwitterEnabled(true); setTwitterCardType("summary_large_image"); setTwitterTitle(""); setTwitterDescription(""); setTwitterImageUrl(""); setTwitterCreator("");
  };

  const inputCls = `w-full rounded-xl border p-3 text-xs font-bold outline-none transition-all duration-200 ${t.input}`;
  const selectCls = `w-full rounded-xl border p-3 text-xs font-bold outline-none transition-all duration-200 appearance-none cursor-pointer ${t.select}`;
  const labelCls = `text-[10px] font-black uppercase tracking-widest ${t.label}`;

  const [previewTab, setPreviewTab] = useState("google");

  return (
    <div className={`min-h-[calc(100vh-76px)] px-4 py-8 flex items-start justify-center transition-colors duration-300 ${t.wrapper}`}>
      <div className={`w-full max-w-7xl rounded-3xl border overflow-hidden transition-all duration-300 ${t.card}`}>

        <div className={`flex items-center gap-4 p-5 border-b ${t.headerBorder}`}>
          <Link
            to="/devutilities"
            className={`w-10 h-10 border rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-200 ${t.buttonSecondary}`}
            title="Back to Utilities"
          >
            ←
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-black uppercase tracking-tight">Meta Tags Generator</h1>
            <p className={`text-xs font-semibold mt-0.5 ${t.label}`}>
              Generate SEO, Open Graph &amp; Twitter Card meta tags with live previews.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadSample} className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonSecondary}`}>
              Load Sample
            </button>
            <button onClick={clearAll} className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonSecondary}`}>
              Clear All
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-0">

          <div className={`p-6 flex flex-col gap-6 lg:border-r ${t.sectionBorder}`}>

            <div className="flex flex-col gap-4">
              <h2 className={`text-xs font-black uppercase tracking-[0.2em] pb-2 border-b ${t.sectionBorder}`}>
                Basic SEO
              </h2>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className={labelCls}>Page Title</label>
                  <CharBadge current={title.length} max={60} />
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. My Awesome Page — Brand Name"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className={labelCls}>Meta Description</label>
                  <CharBadge current={description.length} max={160} />
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A concise summary of your page content…"
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Canonical URL</label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://example.com/page"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="react, developer tools, productivity"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Robots Directive</label>
                <select value={robots} onChange={(e) => setRobots(e.target.value)} className={selectCls}>
                  <option value="index, follow">index, follow</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className={`flex items-center justify-between pb-2 border-b ${t.sectionBorder}`}>
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Open Graph</h2>
                <Toggle enabled={ogEnabled} onChange={setOgEnabled} label="Enable OG" t={t} />
              </div>

              {ogEnabled && (
                <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className={labelCls}>OG Title <span className="normal-case font-normal">(defaults to page title)</span></label>
                      <CharBadge current={(ogTitle || title).length} max={60} />
                    </div>
                    <input type="text" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} placeholder="Leave blank to use page title" className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className={labelCls}>OG Description <span className="normal-case font-normal">(defaults to meta desc)</span></label>
                      <CharBadge current={(ogDescription || description).length} max={160} />
                    </div>
                    <textarea value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} placeholder="Leave blank to use meta description" rows={2} className={`${inputCls} resize-none`} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>OG Image URL</label>
                    <input type="url" value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)} placeholder="https://example.com/og-image.png" className={inputCls} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className={`flex items-center justify-between pb-2 border-b ${t.sectionBorder}`}>
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Twitter Card</h2>
                <Toggle enabled={twitterEnabled} onChange={setTwitterEnabled} label="Enable Twitter" t={t} />
              </div>

              {twitterEnabled && (
                <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Card Type</label>
                    <select value={twitterCardType} onChange={(e) => setTwitterCardType(e.target.value)} className={selectCls}>
                      <option value="summary">summary</option>
                      <option value="summary_large_image">summary_large_image</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className={labelCls}>Twitter Title <span className="normal-case font-normal">(defaults to page title)</span></label>
                      <CharBadge current={(twitterTitle || title).length} max={70} />
                    </div>
                    <input type="text" value={twitterTitle} onChange={(e) => setTwitterTitle(e.target.value)} placeholder="Leave blank to use page title" className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className={labelCls}>Twitter Description <span className="normal-case font-normal">(defaults to meta desc)</span></label>
                      <CharBadge current={(twitterDescription || description).length} max={200} />
                    </div>
                    <textarea value={twitterDescription} onChange={(e) => setTwitterDescription(e.target.value)} placeholder="Leave blank to use meta description" rows={2} className={`${inputCls} resize-none`} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Twitter Image URL <span className="normal-case font-normal">(defaults to OG image)</span></label>
                    <input type="url" value={twitterImageUrl} onChange={(e) => setTwitterImageUrl(e.target.value)} placeholder="Leave blank to use OG image URL" className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Creator Handle</label>
                    <input type="text" value={twitterCreator} onChange={(e) => setTwitterCreator(e.target.value)} placeholder="@username" className={inputCls} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 flex flex-col gap-6">

            <div className="flex flex-col gap-4">
              <div className={`flex items-center justify-between pb-2 border-b ${t.sectionBorder}`}>
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Live Preview</h2>
                <div className="flex gap-1">
                  {[
                    { key: "google", label: "Google" },
                    { key: "facebook", label: "Facebook" },
                    { key: "twitter", label: "Twitter" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setPreviewTab(tab.key)}
                      className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        previewTab === tab.key ? t.buttonActive : t.buttonSecondary
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {previewTab === "google" && (
                <div className={`rounded-2xl border p-5 transition-all duration-200 ${t.previewCard}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${t.previewLabel}`}>Google Search Result</p>
                  <div className="flex flex-col gap-1">
                    <p className={`text-lg font-medium leading-snug cursor-pointer hover:underline ${t.googleTitle}`}>
                      {title || "Page Title"}
                    </p>
                    <p className={`text-xs ${t.googleUrl}`}>
                      {canonicalUrl || "https://example.com"} <span className="opacity-50">›</span>
                    </p>
                    <p className={`text-sm leading-relaxed line-clamp-2 ${t.googleDesc}`}>
                      {description || "Meta description will appear here. Add a description to see how it looks in Google search results."}
                    </p>
                  </div>
                </div>
              )}

              {previewTab === "facebook" && (
                <div className={`rounded-2xl border overflow-hidden transition-all duration-200 ${t.fbCard}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest px-5 pt-4 pb-2 ${t.previewLabel}`}>Facebook Share Card</p>
                  <div className="mx-4 mb-4 rounded-lg overflow-hidden border border-inherit">
                    {/* Image */}
                    <div className="w-full aspect-[1.91/1] overflow-hidden bg-zinc-200 dark:bg-zinc-700 relative">
                      {ogImageUrl ? (
                        <img src={ogImageUrl} alt="OG Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                      ) : null}
                      <div style={{ display: ogImageUrl ? "none" : "flex" }} className="w-full h-full items-center justify-center absolute inset-0">
                        <ImagePlaceholder dark={dark} wide />
                      </div>
                    </div>
                    <div className={`px-3 py-2.5 ${dark ? "bg-zinc-800/60" : "bg-[#f2f3f5]"}`}>
                      <p className={`text-[10px] uppercase tracking-wider ${t.fbDomain}`}>
                        {displayDomain}
                      </p>
                      <p className={`text-sm font-semibold leading-snug mt-0.5 line-clamp-1 ${t.fbTitle}`}>
                        {resolvedOgTitle || "Page Title"}
                      </p>
                      <p className={`text-xs leading-relaxed mt-0.5 line-clamp-1 ${t.fbDesc}`}>
                        {resolvedOgDesc || "Page description preview will appear here."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {previewTab === "twitter" && (
                <div className={`rounded-2xl border p-5 transition-all duration-200 ${t.twitterCard}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${t.previewLabel}`}>Twitter / X Card</p>

                  {twitterCardType === "summary_large_image" ? (
                    <div className="rounded-xl overflow-hidden border border-inherit">
                      <div className="w-full aspect-[2/1] overflow-hidden bg-zinc-200 dark:bg-zinc-700 relative">
                        {resolvedTwitterImage ? (
                          <img src={resolvedTwitterImage} alt="Twitter Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                        ) : null}
                        <div style={{ display: resolvedTwitterImage ? "none" : "flex" }} className="w-full h-full items-center justify-center absolute inset-0">
                          <ImagePlaceholder dark={dark} wide />
                        </div>
                      </div>
                      <div className="px-3 py-2.5">
                        <p className={`text-sm font-semibold leading-snug line-clamp-1 ${t.twitterTitle}`}>
                          {resolvedTwitterTitle || "Page Title"}
                        </p>
                        <p className={`text-xs leading-relaxed mt-0.5 line-clamp-2 ${t.twitterDesc}`}>
                          {resolvedTwitterDesc || "Page description preview."}
                        </p>
                        <p className={`text-[10px] mt-1 ${t.twitterDomain}`}>
                          🔗 {displayDomain}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex rounded-xl overflow-hidden border border-inherit">
                      <div className="w-32 h-32 shrink-0 overflow-hidden bg-zinc-200 dark:bg-zinc-700 relative">
                        {resolvedTwitterImage ? (
                          <img src={resolvedTwitterImage} alt="Twitter Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                        ) : null}
                        <div style={{ display: resolvedTwitterImage ? "none" : "flex" }} className="w-full h-full items-center justify-center absolute inset-0">
                          <ImagePlaceholder dark={dark} />
                        </div>
                      </div>
                      <div className="flex flex-col justify-center px-3 py-2 flex-1 min-w-0">
                        <p className={`text-[10px] ${t.twitterDomain}`}>
                          {displayDomain}
                        </p>
                        <p className={`text-sm font-semibold leading-snug mt-0.5 line-clamp-2 ${t.twitterTitle}`}>
                          {resolvedTwitterTitle || "Page Title"}
                        </p>
                        <p className={`text-xs leading-relaxed mt-0.5 line-clamp-2 ${t.twitterDesc}`}>
                          {resolvedTwitterDesc || "Page description preview."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 flex-1">
              <div className={`flex items-center justify-between pb-2 border-b ${t.sectionBorder}`}>
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Generated HTML</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMinified((v) => !v)}
                    className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonSecondary}`}
                  >
                    {minified ? "Beautify" : "Minify"}
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonPrimary}`}
                  >
                    Copy HTML
                  </button>
                </div>
              </div>
              <div className="relative flex-1 flex flex-col min-h-[260px]">
                <textarea
                  readOnly
                  value={generatedHtml}
                  className={`w-full flex-1 rounded-2xl p-4 font-mono text-xs leading-relaxed resize-none outline-none border transition-colors duration-200 ${t.outputTextarea}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
