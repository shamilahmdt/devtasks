import { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";
import {
  ArrowLeft,
  Upload,
  Search,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Copy,
  Layers,
} from "lucide-react";

// Format bytes into readable format
function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

// Sample HAR dataset for instant 1-click exploration
const SAMPLE_HAR_DATA = {
  log: {
    version: "1.2",
    creator: { name: "DevTasks HAR Generator", version: "1.0" },
    pages: [
      {
        startedDateTime: "2026-09-22T08:00:00.000Z",
        id: "page_1",
        title: "https://devtasks.io/dashboard",
        pageTimings: { onContentLoad: 850, onLoad: 1420 },
      },
    ],
    entries: [
      {
        startedDateTime: "2026-09-22T08:00:00.000Z",
        time: 145,
        request: {
          method: "GET",
          url: "https://devtasks.io/dashboard",
          httpVersion: "HTTP/2.0",
          headers: [
            { name: "accept", value: "text/html,application/xhtml+xml" },
            { name: "user-agent", value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
            { name: "accept-encoding", value: "gzip, deflate, br" },
          ],
          queryString: [],
          cookies: [{ name: "session_id", value: "s_9f3a8b2c1" }],
        },
        response: {
          status: 200,
          statusText: "OK",
          headers: [
            { name: "content-type", value: "text/html; charset=utf-8" },
            { name: "content-encoding", value: "br" },
            { name: "strict-transport-security", value: "max-age=31536000; includeSubDomains" },
            { name: "x-frame-options", value: "DENY" },
            { name: "cache-control", value: "no-cache, no-store, must-revalidate" },
          ],
          content: {
            size: 24500,
            mimeType: "text/html",
            text: "<!DOCTYPE html><html><head><title>DevTasks Dashboard</title></head><body><div id='root'></div></body></html>",
          },
          bodySize: 8400,
        },
        timings: { blocked: 5, dns: 18, connect: 32, ssl: 25, send: 2, wait: 45, receive: 18 },
        serverIPAddress: "104.21.45.12",
      },
      {
        startedDateTime: "2026-09-22T08:00:00.120Z",
        time: 210,
        request: {
          method: "GET",
          url: "https://devtasks.io/assets/main.css",
          httpVersion: "HTTP/2.0",
          headers: [{ name: "accept", value: "text/css,*/*;q=0.1" }],
          queryString: [{ name: "v", value: "3.4.1" }],
          cookies: [],
        },
        response: {
          status: 200,
          statusText: "OK",
          headers: [
            { name: "content-type", value: "text/css; charset=utf-8" },
            { name: "content-encoding", value: "gzip" },
            { name: "cache-control", value: "public, max-age=31536000, immutable" },
          ],
          content: {
            size: 89400,
            mimeType: "text/css",
            text: ":root{--bg:#090a0f;--card:#18181b;} body{margin:0;font-family:Inter,sans-serif;}",
          },
          bodySize: 22100,
        },
        timings: { blocked: 2, dns: 0, connect: 0, ssl: 0, send: 1, wait: 160, receive: 47 },
        serverIPAddress: "104.21.45.12",
      },
      {
        startedDateTime: "2026-09-22T08:00:00.130Z",
        time: 320,
        request: {
          method: "GET",
          url: "https://devtasks.io/assets/bundle.js",
          httpVersion: "HTTP/2.0",
          headers: [{ name: "accept", value: "*/*" }],
          queryString: [{ name: "hash", value: "8ef91a0c" }],
          cookies: [],
        },
        response: {
          status: 200,
          statusText: "OK",
          headers: [
            { name: "content-type", value: "application/javascript" },
            { name: "content-encoding", value: "br" },
            { name: "cache-control", value: "public, max-age=31536000, immutable" },
          ],
          content: {
            size: 645000,
            mimeType: "application/javascript",
            text: "import React from 'react'; console.log('Bundle loaded');",
          },
          bodySize: 184000,
        },
        timings: { blocked: 3, dns: 0, connect: 0, ssl: 0, send: 1, wait: 190, receive: 126 },
        serverIPAddress: "104.21.45.12",
      },
      {
        startedDateTime: "2026-09-22T08:00:00.380Z",
        time: 580,
        request: {
          method: "GET",
          url: "https://api.devtasks.io/v1/user/projects?limit=20&status=active",
          httpVersion: "HTTP/2.0",
          headers: [
            { name: "accept", value: "application/json" },
            { name: "authorization", value: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          ],
          queryString: [
            { name: "limit", value: "20" },
            { name: "status", value: "active" },
          ],
          cookies: [],
        },
        response: {
          status: 200,
          statusText: "OK",
          headers: [
            { name: "content-type", value: "application/json; charset=utf-8" },
            { name: "content-encoding", value: "gzip" },
            { name: "strict-transport-security", value: "max-age=31536000" },
            { name: "x-ratelimit-remaining", value: "94" },
          ],
          content: {
            size: 15400,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                success: true,
                projects: [
                  { id: "proj_1", name: "Dev Utilities Sandbox", stars: 1240, status: "active" },
                  { id: "proj_2", name: "API Gateway Proxy", stars: 490, status: "active" },
                  { id: "proj_3", name: "Offline Vault Engine", stars: 830, status: "active" },
                ],
                total: 3,
              },
              null,
              2
            ),
          },
          bodySize: 4200,
        },
        timings: { blocked: 4, dns: 25, connect: 40, ssl: 35, send: 2, wait: 420, receive: 54 },
        serverIPAddress: "172.67.182.88",
      },
      {
        startedDateTime: "2026-09-22T08:00:00.410Z",
        time: 640,
        request: {
          method: "POST",
          url: "https://api.devtasks.io/v1/telemetry/events",
          httpVersion: "HTTP/2.0",
          headers: [
            { name: "content-type", value: "application/json" },
            { name: "x-client-ver", value: "2.4.0" },
          ],
          postData: {
            mimeType: "application/json",
            text: JSON.stringify({ event: "page_view", path: "/dashboard", duration_ms: 350 }),
          },
          queryString: [],
          cookies: [],
        },
        response: {
          status: 500,
          statusText: "Internal Server Error",
          headers: [
            { name: "content-type", value: "application/json" },
            { name: "server", value: "cloudflare" },
          ],
          content: {
            size: 180,
            mimeType: "application/json",
            text: JSON.stringify({ error: "Database timeout on event ingestion buffer" }),
          },
          bodySize: 180,
        },
        timings: { blocked: 2, dns: 0, connect: 0, ssl: 0, send: 3, wait: 625, receive: 10 },
        serverIPAddress: "172.67.182.88",
      },
      {
        startedDateTime: "2026-09-22T08:00:00.450Z",
        time: 190,
        request: {
          method: "GET",
          url: "https://devtasks.io/static/images/hero-banner.webp",
          httpVersion: "HTTP/2.0",
          headers: [{ name: "accept", value: "image/avif,image/webp,image/*" }],
          queryString: [],
          cookies: [],
        },
        response: {
          status: 200,
          statusText: "OK",
          headers: [
            { name: "content-type", value: "image/webp" },
            { name: "cache-control", value: "public, max-age=86400" },
          ],
          content: { size: 142000, mimeType: "image/webp" },
          bodySize: 142000,
        },
        timings: { blocked: 2, dns: 0, connect: 0, ssl: 0, send: 1, wait: 75, receive: 112 },
        serverIPAddress: "104.21.45.12",
      },
      {
        startedDateTime: "2026-09-22T08:00:00.620Z",
        time: 140,
        request: {
          method: "GET",
          url: "https://devtasks.io/api/missing-asset.svg",
          httpVersion: "HTTP/2.0",
          headers: [],
          queryString: [],
          cookies: [],
        },
        response: {
          status: 404,
          statusText: "Not Found",
          headers: [{ name: "content-type", value: "text/plain" }],
          content: { size: 45, mimeType: "text/plain", text: "404 Not Found: Static resource does not exist" },
          bodySize: 45,
        },
        timings: { blocked: 1, dns: 0, connect: 0, ssl: 0, send: 1, wait: 130, receive: 8 },
        serverIPAddress: "104.21.45.12",
      },
    ],
  },
};

// Helper: infer resource type
function getResourceType(entry) {
  const mime = entry.response?.content?.mimeType || "";
  const url = entry.request?.url || "";

  if (mime.includes("json") || mime.includes("xml") || url.includes("/api/") || entry.request?.method === "POST")
    return "XHR";
  if (mime.includes("javascript") || url.endsWith(".js") || url.includes(".js?")) return "JS";
  if (mime.includes("css") || url.endsWith(".css")) return "CSS";
  if (mime.startsWith("image/") || /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url)) return "IMG";
  if (mime.startsWith("font/") || /\.(woff|woff2|ttf|otf)$/i.test(url)) return "FONT";
  if (mime.includes("html") || url.endsWith(".html")) return "DOC";
  return "OTHER";
}

export default function HarAnalyzer() {
  const { dark } = useTheme();

  const [harData, setHarData] = useState(SAMPLE_HAR_DATA);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("startTime"); // startTime, duration, size, status
  const [sortOrder, setSortOrder] = useState("asc");
  const [activeTab, setActiveTab] = useState("headers"); // headers, payload, response, timings, cookies
  const [isAuditing, setIsAuditing] = useState(false);

  const fileInputRef = useRef(null);

  // Load sample data
  const loadSample = () => {
    setHarData(SAMPLE_HAR_DATA);
    setSelectedEntry(SAMPLE_HAR_DATA.log.entries[0]);
    toast.success("Loaded sample multi-request network capture!");
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        if (!parsed.log || !parsed.log.entries) {
          throw new Error("Invalid HAR format: missing 'log.entries'");
        }
        setHarData(parsed);
        setSelectedEntry(parsed.log.entries[0] || null);
        toast.success(`Parsed ${parsed.log.entries.length} network requests!`);
      } catch (err) {
        toast.error("Failed to parse HAR file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const entries = useMemo(() => harData?.log?.entries || [], [harData]);

  // Metrics computation
  const metrics = useMemo(() => {
    if (!entries.length) {
      return { total: 0, transferred: 0, uncompressed: 0, loadTime: 0, avgTtfb: 0, errors: 0 };
    }

    let transferred = 0;
    let uncompressed = 0;
    let totalWait = 0;
    let errors = 0;

    let minStart = Infinity;
    let maxEnd = 0;

    entries.forEach((e) => {
      const start = new Date(e.startedDateTime).getTime();
      const end = start + (e.time || 0);

      if (start < minStart) minStart = start;
      if (end > maxEnd) maxEnd = end;

      transferred += e.response?.bodySize > 0 ? e.response.bodySize : e.response?.content?.size || 0;
      uncompressed += e.response?.content?.size || 0;
      totalWait += e.timings?.wait || 0;

      if (e.response?.status >= 400) errors++;
    });

    return {
      total: entries.length,
      transferred,
      uncompressed,
      loadTime: Math.max(0, maxEnd - minStart),
      avgTtfb: Math.round(totalWait / entries.length),
      errors,
      minStart,
      maxEnd,
    };
  }, [entries]);

  // Security & Performance Audit items
  const auditResults = useMemo(() => {
    const issues = [];

    entries.forEach((e, idx) => {
      const url = e.request?.url || `Request #${idx + 1}`;
      const status = e.response?.status || 0;
      const headers = e.response?.headers || [];
      const content = e.response?.content || {};

      // 1. HTTP Errors
      if (status >= 400) {
        issues.push({
          type: "error",
          title: `HTTP ${status} Error`,
          url,
          detail: `Request returned status ${status} (${e.response?.statusText || "Failed"}).`,
        });
      }

      // 2. Slow TTFB
      if (e.timings?.wait > 400) {
        issues.push({
          type: "warning",
          title: "High TTFB (Time to First Byte)",
          url,
          detail: `Server took ${Math.round(e.timings.wait)}ms to respond to this request. Consider server-side caching or edge distribution.`,
        });
      }

      // 3. Uncompressed assets
      const mime = content.mimeType || "";
      const isText = mime.includes("javascript") || mime.includes("css") || mime.includes("html") || mime.includes("json");
      const hasEncoding = headers.some((h) => h.name.toLowerCase() === "content-encoding");

      if (isText && content.size > 2048 && !hasEncoding) {
        issues.push({
          type: "warning",
          title: "Missing Compression (gzip/brotli)",
          url,
          detail: `Asset of size ${formatBytes(content.size)} is transferred uncompressed. Enabling gzip or Brotli could reduce size significantly.`,
        });
      }

      // 4. Missing Security Headers on HTML documents
      if (mime.includes("html")) {
        const hasHsts = headers.some((h) => h.name.toLowerCase() === "strict-transport-security");
        const hasCsp = headers.some((h) => h.name.toLowerCase() === "content-security-policy");

        if (!hasHsts) {
          issues.push({
            type: "info",
            title: "Missing HSTS Header",
            url,
            detail: "Document does not provide Strict-Transport-Security header for enforcing HTTPS.",
          });
        }
        if (!hasCsp) {
          issues.push({
            type: "info",
            title: "Missing Content-Security-Policy",
            url,
            detail: "Document does not supply Content-Security-Policy (CSP) to mitigate XSS attacks.",
          });
        }
      }
    });

    return issues;
  }, [entries]);

  // Filter and Sort Entries
  const filteredEntries = useMemo(() => {
    return entries
      .filter((e) => {
        const url = e.request?.url || "";
        const method = e.request?.method || "";
        const status = e.response?.status || 0;
        const type = getResourceType(e);

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (!url.toLowerCase().includes(q) && !method.toLowerCase().includes(q)) {
            return false;
          }
        }

        if (selectedType !== "ALL" && type !== selectedType) return false;

        if (selectedStatus === "2xx" && (status < 200 || status >= 300)) return false;
        if (selectedStatus === "3xx" && (status < 300 || status >= 400)) return false;
        if (selectedStatus === "4xx" && (status < 400 || status >= 500)) return false;
        if (selectedStatus === "5xx" && status < 500) return false;
        if (selectedStatus === "ERRORS" && status < 400) return false;

        return true;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;

        if (sortBy === "startTime") {
          valA = new Date(a.startedDateTime).getTime();
          valB = new Date(b.startedDateTime).getTime();
        } else if (sortBy === "duration") {
          valA = a.time || 0;
          valB = b.time || 0;
        } else if (sortBy === "size") {
          valA = a.response?.bodySize > 0 ? a.response.bodySize : a.response?.content?.size || 0;
          valB = b.response?.bodySize > 0 ? b.response.bodySize : b.response?.content?.size || 0;
        } else if (sortBy === "status") {
          valA = a.response?.status || 0;
          valB = b.response?.status || 0;
        }

        return sortOrder === "asc" ? valA - valB : valB - valA;
      });
  }, [entries, searchQuery, selectedType, selectedStatus, sortBy, sortOrder]);

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        dark ? "bg-[#090A0F] text-zinc-100" : "bg-[#F8F9FA] text-zinc-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Link
              to="/devutilities"
              className={`p-2.5 rounded-xl border transition-all ${
                dark
                  ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
                  : "bg-white border-zinc-200 text-zinc-700 hover:text-black hover:border-zinc-300"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  HAR Waterfall Analyzer & Network Inspector
                </h1>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Offline & Secure
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500">
                Inspect HTTP Archive (.har) captures, diagnose network waterfalls, inspect payloads, and audit security offline without exposing sensitive tokens.
              </p>
            </div>
          </div>

          {/* Controls & Import */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadSample}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                dark
                  ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200"
                  : "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-800"
              }`}
            >
              <Layers className="w-4 h-4" />
              Load Sample HAR
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all shadow-sm"
            >
              <Upload className="w-4 h-4" />
              Open HAR File
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".har,application/json"
              className="hidden"
            />
          </div>
        </div>

        {/* Top KPI Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-6">
          <div
            className={`p-4 rounded-xl border ${
              dark ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Requests
            </span>
            <div className="text-xl font-black mt-1">{metrics.total}</div>
          </div>

          <div
            className={`p-4 rounded-xl border ${
              dark ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Transferred
            </span>
            <div className="text-xl font-black mt-1">{formatBytes(metrics.transferred)}</div>
          </div>

          <div
            className={`p-4 rounded-xl border ${
              dark ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Uncompressed
            </span>
            <div className="text-xl font-black mt-1">{formatBytes(metrics.uncompressed)}</div>
          </div>

          <div
            className={`p-4 rounded-xl border ${
              dark ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Page Load
            </span>
            <div className="text-xl font-black mt-1">{metrics.loadTime} ms</div>
          </div>

          <div
            className={`p-4 rounded-xl border ${
              dark ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Avg TTFB
            </span>
            <div className="text-xl font-black mt-1">{metrics.avgTtfb} ms</div>
          </div>

          <div
            className={`p-4 rounded-xl border ${
              metrics.errors > 0
                ? dark
                  ? "bg-red-950/20 border-red-900/50 text-red-400"
                  : "bg-red-50 border-red-200 text-red-600"
                : dark
                  ? "bg-zinc-900/40 border-zinc-800"
                  : "bg-white border-zinc-200"
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
              Errors (4xx/5xx)
            </span>
            <div className="text-xl font-black mt-1">{metrics.errors}</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div
          className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 mb-6 ${
            dark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200"
          }`}
        >
          {/* Search box */}
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by URL, path, or method..."
              className={`w-full bg-transparent text-xs font-mono outline-none ${
                dark ? "text-white placeholder-zinc-500" : "text-black placeholder-zinc-400"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Resource Types pills */}
          <div className="flex flex-wrap items-center gap-1">
            {["ALL", "XHR", "JS", "CSS", "IMG", "FONT", "DOC"].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  selectedType === t
                    ? dark
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : dark
                      ? "text-zinc-400 hover:bg-zinc-800"
                      : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-800 pl-3">
            {["ALL", "2xx", "3xx", "4xx", "5xx", "ERRORS"].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded transition-all ${
                  selectedStatus === s
                    ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Audit Toggle Button */}
          <button
            onClick={() => setIsAuditing(!isAuditing)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              isAuditing
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : dark
                  ? "bg-zinc-800/40 border-zinc-700/50 text-zinc-400 hover:text-white"
                  : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-black"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Audit ({auditResults.length})
          </button>
        </div>

        {/* Audit Panel (if open) */}
        {isAuditing && (
          <div
            className={`mb-6 p-5 rounded-2xl border ${
              dark ? "bg-zinc-900/80 border-zinc-800" : "bg-amber-50/50 border-amber-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Security & Performance Audit Recommendations
              </h3>
              <button
                onClick={() => setIsAuditing(false)}
                className="text-xs text-zinc-500 hover:text-white"
              >
                Close Audit
              </button>
            </div>

            <div className="space-y-2">
              {auditResults.length === 0 ? (
                <div className="text-xs text-emerald-400 flex items-center gap-2 py-2">
                  <CheckCircle2 className="w-4 h-4" />
                  No performance or security anomalies detected in this HAR capture!
                </div>
              ) : (
                auditResults.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${
                      issue.type === "error"
                        ? "bg-red-950/20 border-red-900/40 text-red-300"
                        : issue.type === "warning"
                          ? "bg-amber-950/20 border-amber-900/40 text-amber-300"
                          : "bg-blue-950/20 border-blue-900/40 text-blue-300"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold">{issue.title}</span>
                        <span className="text-[11px] font-mono truncate max-w-xs opacity-75">
                          {issue.url}
                        </span>
                      </div>
                      <p className="mt-1 opacity-90">{issue.detail}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main Network Table & Waterfall View */}
        <div
          className={`rounded-2xl border overflow-hidden flex-1 flex flex-col ${
            dark ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"
          }`}
        >
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr
                  className={`border-b select-none ${
                    dark ? "bg-zinc-900/90 border-zinc-800 text-zinc-400" : "bg-zinc-50 border-zinc-200 text-zinc-600"
                  }`}
                >
                  <th className="py-3 px-4 w-16 cursor-pointer" onClick={() => toggleSort("status")}>
                    <div className="flex items-center gap-1">Status</div>
                  </th>
                  <th className="py-3 px-3 w-16">Method</th>
                  <th className="py-3 px-3">Name & Path</th>
                  <th className="py-3 px-3 w-20">Type</th>
                  <th className="py-3 px-3 w-24 cursor-pointer" onClick={() => toggleSort("size")}>
                    <div className="flex items-center gap-1">Size</div>
                  </th>
                  <th className="py-3 px-3 w-24 cursor-pointer" onClick={() => toggleSort("duration")}>
                    <div className="flex items-center gap-1">Time</div>
                  </th>
                  <th className="py-3 px-4 min-w-[260px]">Waterfall Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {filteredEntries.map((entry, idx) => {
                  const urlObj = new URL(entry.request?.url || "http://unknown");
                  const pathname = urlObj.pathname + urlObj.search;
                  const status = entry.response?.status || 0;
                  const duration = Math.round(entry.time || 0);
                  const type = getResourceType(entry);
                  const size = entry.response?.bodySize > 0 ? entry.response.bodySize : entry.response?.content?.size || 0;

                  const isSelected = selectedEntry === entry;

                  // Waterfall relative position calculations
                  const reqStart = new Date(entry.startedDateTime).getTime();
                  const totalSpan = Math.max(1, metrics.maxEnd - metrics.minStart);
                  const leftPct = Math.max(0, Math.min(100, ((reqStart - metrics.minStart) / totalSpan) * 100));
                  const widthPct = Math.max(1, Math.min(100 - leftPct, (duration / totalSpan) * 100));

                  const tWait = entry.timings?.wait || 0;
                  const waitPct = duration > 0 ? (tWait / duration) * 100 : 50;

                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedEntry(entry)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? dark
                            ? "bg-zinc-800/80 text-white"
                            : "bg-zinc-100 text-black"
                          : dark
                            ? "hover:bg-zinc-800/40 text-zinc-300"
                            : "hover:bg-zinc-50 text-zinc-800"
                      }`}
                    >
                      {/* Status */}
                      <td className="py-2.5 px-4 font-bold">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] ${
                            status >= 200 && status < 300
                              ? "text-emerald-400 bg-emerald-950/40"
                              : status >= 300 && status < 400
                                ? "text-blue-400 bg-blue-950/40"
                                : status >= 400 && status < 500
                                  ? "text-amber-400 bg-amber-950/40"
                                  : "text-red-400 bg-red-950/40"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* Method */}
                      <td className="py-2.5 px-3 font-semibold text-zinc-400">
                        {entry.request?.method}
                      </td>

                      {/* Name & Domain */}
                      <td className="py-2.5 px-3 max-w-[280px] truncate">
                        <span className="font-semibold text-zinc-200 dark:text-zinc-100">
                          {pathname.split("/").pop() || "/"}
                        </span>
                        <span className="text-[10px] text-zinc-500 block truncate">
                          {urlObj.hostname}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-2.5 px-3 text-zinc-400 text-[11px]">{type}</td>

                      {/* Size */}
                      <td className="py-2.5 px-3 text-zinc-400">{formatBytes(size)}</td>

                      {/* Duration */}
                      <td className="py-2.5 px-3 text-zinc-400">{duration} ms</td>

                      {/* Waterfall Gantt Bar */}
                      <td className="py-2.5 px-4">
                        <div className="w-full bg-zinc-800/40 dark:bg-zinc-950/80 h-4 rounded overflow-hidden relative flex items-center">
                          <div
                            style={{
                              left: `${leftPct}%`,
                              width: `${widthPct}%`,
                            }}
                            className="absolute h-3 rounded flex overflow-hidden shadow-sm"
                            title={`Start: +${reqStart - metrics.minStart}ms | TTFB: ${Math.round(tWait)}ms | Total: ${duration}ms`}
                          >
                            {/* TTFB phase bar */}
                            <div
                              style={{ width: `${waitPct}%` }}
                              className="bg-amber-400/80 h-full"
                            />
                            {/* Download phase bar */}
                            <div
                              style={{ width: `${100 - waitPct}%` }}
                              className="bg-cyan-400 h-full"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Request Detail Drawer / Inspector */}
        {selectedEntry && (
          <div
            className={`mt-6 rounded-2xl border p-5 ${
              dark ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            {/* Drawer Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                    selectedEntry.response?.status < 400
                      ? "bg-emerald-950/40 text-emerald-400"
                      : "bg-red-950/40 text-red-400"
                  }`}
                >
                  {selectedEntry.request?.method} {selectedEntry.response?.status}
                </span>
                <span className="text-xs font-mono truncate max-w-xl text-zinc-300">
                  {selectedEntry.request?.url}
                </span>
              </div>

              {/* Inspector Tabs */}
              <div className="flex items-center gap-1">
                {["headers", "payload", "response", "timings", "cookies"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 text-xs font-bold capitalize rounded-lg transition-all ${
                      activeTab === tab
                        ? dark
                          ? "bg-white text-black"
                          : "bg-black text-white"
                        : dark
                          ? "text-zinc-400 hover:bg-zinc-800"
                          : "text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Contents */}
            <div className="pt-4 text-xs font-mono">
              {/* HEADERS TAB */}
              {activeTab === "headers" && (
                <div className="space-y-4">
                  {/* General info */}
                  <div>
                    <h4 className="font-bold text-zinc-400 uppercase text-[11px] mb-2">General</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                      <div>
                        <span className="text-zinc-500">Request URL: </span>
                        <span className="text-zinc-200 break-all">{selectedEntry.request?.url}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Remote Address: </span>
                        <span className="text-zinc-200">{selectedEntry.serverIPAddress || "Unknown"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">HTTP Version: </span>
                        <span className="text-zinc-200">{selectedEntry.request?.httpVersion || "HTTP/1.1"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Duration: </span>
                        <span className="text-zinc-200">{selectedEntry.time} ms</span>
                      </div>
                    </div>
                  </div>

                  {/* Response Headers */}
                  <div>
                    <h4 className="font-bold text-zinc-400 uppercase text-[11px] mb-2">
                      Response Headers ({selectedEntry.response?.headers?.length || 0})
                    </h4>
                    <div className="space-y-1 p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60 max-h-48 overflow-y-auto">
                      {selectedEntry.response?.headers?.map((h, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-zinc-400 font-bold shrink-0">{h.name}:</span>
                          <span className="text-zinc-200 break-all">{h.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Request Headers */}
                  <div>
                    <h4 className="font-bold text-zinc-400 uppercase text-[11px] mb-2">
                      Request Headers ({selectedEntry.request?.headers?.length || 0})
                    </h4>
                    <div className="space-y-1 p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60 max-h-48 overflow-y-auto">
                      {selectedEntry.request?.headers?.map((h, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-zinc-400 font-bold shrink-0">{h.name}:</span>
                          <span className="text-zinc-200 break-all">{h.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PAYLOAD / POST BODY TAB */}
              {activeTab === "payload" && (
                <div>
                  <h4 className="font-bold text-zinc-400 uppercase text-[11px] mb-2">Request Body</h4>
                  {selectedEntry.request?.postData?.text ? (
                    <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 overflow-x-auto max-h-96">
                      {selectedEntry.request.postData.text}
                    </pre>
                  ) : (
                    <div className="p-6 text-center text-zinc-500 rounded-xl border border-dashed border-zinc-800">
                      No request payload body associated with this request.
                    </div>
                  )}
                </div>
              )}

              {/* RESPONSE BODY TAB */}
              {activeTab === "response" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-zinc-400 uppercase text-[11px]">
                      Response Content ({formatBytes(selectedEntry.response?.content?.size)})
                    </h4>
                    {selectedEntry.response?.content?.text && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedEntry.response.content.text);
                          toast.success("Response copied to clipboard");
                        }}
                        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy Response
                      </button>
                    )}
                  </div>
                  {selectedEntry.response?.content?.text ? (
                    <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 overflow-x-auto max-h-96 whitespace-pre-wrap">
                      {selectedEntry.response.content.text}
                    </pre>
                  ) : (
                    <div className="p-6 text-center text-zinc-500 rounded-xl border border-dashed border-zinc-800">
                      Binary content or no response text preview available.
                    </div>
                  )}
                </div>
              )}

              {/* TIMINGS TAB */}
              {activeTab === "timings" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-zinc-400 uppercase text-[11px]">
                    Detailed Timing Breakdown
                  </h4>
                  <div className="space-y-2 p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                    {Object.entries(selectedEntry.timings || {}).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between py-1 border-b border-zinc-800/40 last:border-0">
                        <span className="capitalize text-zinc-400">{key}:</span>
                        <span className="font-bold text-zinc-200">{val >= 0 ? `${val} ms` : "-"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* COOKIES TAB */}
              {activeTab === "cookies" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-zinc-400 uppercase text-[11px]">Cookies Sent</h4>
                  {selectedEntry.request?.cookies?.length > 0 ? (
                    <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60 space-y-1">
                      {selectedEntry.request.cookies.map((c, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-zinc-400 font-bold">{c.name}:</span>
                          <span className="text-zinc-200">{c.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-zinc-500">No cookies sent with this request.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
