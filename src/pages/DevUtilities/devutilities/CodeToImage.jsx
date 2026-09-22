import { useState, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";
import {
  ArrowLeft,
  Camera,
  Copy,
  Download,
  FileCode,
} from "lucide-react";

// Themes for syntax highlighting & card background
const THEMES = {
  monochromeDark: {
    id: "monochromeDark",
    name: "Monochrome Dark",
    bg: "#121215",
    border: "#27272a",
    text: "#f4f4f5",
    comment: "#71717a",
    keyword: "#ffffff",
    string: "#d4d4d8",
    number: "#e4e4e7",
    fn: "#ffffff",
    type: "#a1a1aa",
    operator: "#a1a1aa",
    highlightBg: "rgba(255, 255, 255, 0.08)",
  },
  monochromeLight: {
    id: "monochromeLight",
    name: "Monochrome Light",
    bg: "#ffffff",
    border: "#e4e4e7",
    text: "#18181b",
    comment: "#a1a1aa",
    keyword: "#09090b",
    string: "#27272a",
    number: "#3f3f46",
    fn: "#000000",
    type: "#52525b",
    operator: "#71717a",
    highlightBg: "rgba(0, 0, 0, 0.05)",
  },
  oneDark: {
    id: "oneDark",
    name: "One Dark Pro",
    bg: "#282c34",
    border: "#3e4451",
    text: "#abb2bf",
    comment: "#5c6370",
    keyword: "#c678dd",
    string: "#98c379",
    number: "#d19a66",
    fn: "#61afef",
    type: "#e5c07b",
    operator: "#56b6c2",
    highlightBg: "rgba(97, 175, 239, 0.12)",
  },
  dracula: {
    id: "dracula",
    name: "Dracula",
    bg: "#282a36",
    border: "#44475a",
    text: "#f8f8f2",
    comment: "#6272a4",
    keyword: "#ff79c6",
    string: "#f1fa8c",
    number: "#bd93f9",
    fn: "#50fa7b",
    type: "#8be9fd",
    operator: "#ff79c6",
    highlightBg: "rgba(189, 147, 249, 0.15)",
  },
  tokyoNight: {
    id: "tokyoNight",
    name: "Tokyo Night",
    bg: "#1a1b26",
    border: "#292e42",
    text: "#a9b1d6",
    comment: "#565f89",
    keyword: "#bb9af7",
    string: "#9ece6a",
    number: "#ff9e64",
    fn: "#7aa2f7",
    type: "#2ac3de",
    operator: "#89ddff",
    highlightBg: "rgba(122, 162, 247, 0.12)",
  },
  synthwave: {
    id: "synthwave",
    name: "Synthwave '84",
    bg: "#262335",
    border: "#3f3957",
    text: "#f92aad",
    comment: "#848bbd",
    keyword: "#fede5d",
    string: "#ff7edb",
    number: "#36f9f6",
    fn: "#36f9f6",
    type: "#fe4450",
    operator: "#fede5d",
    highlightBg: "rgba(254, 222, 93, 0.15)",
  },
  nord: {
    id: "nord",
    name: "Nord",
    bg: "#2e3440",
    border: "#434c5e",
    text: "#d8dee9",
    comment: "#616e88",
    keyword: "#81a1c1",
    string: "#a3be8c",
    number: "#b48ead",
    fn: "#88c0d0",
    type: "#8fbcbb",
    operator: "#81a1c1",
    highlightBg: "rgba(136, 192, 208, 0.12)",
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    bg: "#10101b",
    border: "#2c2242",
    text: "#e0e6ed",
    comment: "#5b667e",
    keyword: "#00f0ff",
    string: "#ffe600",
    number: "#ff0055",
    fn: "#05ffa1",
    type: "#b537f2",
    operator: "#00f0ff",
    highlightBg: "rgba(0, 240, 255, 0.12)",
  },
};

// Canvas background options
const BACKGROUNDS = [
  { id: "darkMesh", name: "Midnight Noir", style: "linear-gradient(135deg, #18181b 0%, #09090b 100%)" },
  { id: "cosmic", name: "Cosmic Glow", style: "linear-gradient(135deg, #4338ca 0%, #1e1b4b 50%, #090a0f 100%)" },
  { id: "hyper", name: "Hyper Blue", style: "linear-gradient(135deg, #0284c7 0%, #1e3a8a 100%)" },
  { id: "aurora", name: "Aurora Green", style: "linear-gradient(135deg, #059669 0%, #064e3b 50%, #022c22 100%)" },
  { id: "sunset", name: "Sunset Ember", style: "linear-gradient(135deg, #ea580c 0%, #991b1b 60%, #450a0a 100%)" },
  { id: "neonPurple", name: "Neon Velvet", style: "linear-gradient(135deg, #9333ea 0%, #4c1d95 60%, #1e1035 100%)" },
  { id: "cyberPink", name: "Cyberpunk Pink", style: "linear-gradient(135deg, #ec4899 0%, #831843 100%)" },
  { id: "cleanSlate", name: "Slate Minimal", style: "linear-gradient(135deg, #475569 0%, #1e293b 100%)" },
  { id: "lightStudio", name: "Studio Light", style: "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)" },
  { id: "transparent", name: "Transparent", style: "transparent" },
];

const CODE_TEMPLATES = [
  {
    name: "React Component",
    language: "typescript",
    filename: "AvatarProfile.tsx",
    code: `import { useState, useTransition } from "react";

export function AvatarProfile({ user, onUpdate }: ProfileProps) {
  const [isPending, startTransition] = useTransition();
  const [avatar, setAvatar] = useState(user.avatarUrl);

  const handleUpload = async (file: File) => {
    startTransition(async () => {
      const url = await uploadToStorage(file);
      setAvatar(url);
      onUpdate({ ...user, avatarUrl: url });
    });
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800">
      <img src={avatar} alt={user.name} className="w-12 h-12 rounded-full" />
      <div>
        <h3 className="font-bold">{user.name}</h3>
        <span className="text-xs text-zinc-500">{user.email}</span>
      </div>
    </div>
  );
}`,
  },
  {
    name: "Python FastAPI",
    language: "python",
    filename: "routes/auth.py",
    code: `from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import create_access_token, verify_password
from app.db.session import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials supplied",
        )
    
    access_token = create_access_token(subject=user.id)
    return {"access_token": access_token, "token_type": "bearer"}`,
  },
  {
    name: "Rust Microservice",
    language: "rust",
    filename: "src/worker.rs",
    code: `use tokio::sync::mpsc;
use tracing::{info, warn};

pub async fn run_event_processor(mut rx: mpsc::Receiver<TaskEvent>) {
    info!("Event processor worker initialized successfully");

    while let Some(event) = rx.recv().await {
        match event {
            TaskEvent::Execute { task_id, payload } => {
                info!("Processing task {} with payload length {}", task_id, payload.len());
                let result = process_pipeline(&payload).await;
                emit_metrics(task_id, result.is_ok());
            }
            TaskEvent::Terminate => {
                warn!("Received graceful termination signal");
                break;
            }
        }
    }
}`,
  },
  {
    name: "SQL Window Function",
    language: "sql",
    filename: "monthly_revenue.sql",
    code: `WITH monthly_summary AS (
  SELECT
    DATE_TRUNC('month', order_date) AS sales_month,
    customer_id,
    SUM(total_amount) AS revenue,
    COUNT(order_id) AS total_orders
  FROM orders
  WHERE status = 'completed' AND order_date >= '2026-01-01'
  GROUP BY 1, 2
)
SELECT
  sales_month,
  customer_id,
  revenue,
  RANK() OVER (PARTITION BY sales_month ORDER BY revenue DESC) as month_rank,
  ROUND(revenue * 100.0 / SUM(revenue) OVER (PARTITION BY sales_month), 2) as pct_of_month
FROM monthly_summary
ORDER BY sales_month DESC, month_rank ASC
LIMIT 100;`,
  },
  {
    name: "Shell Script",
    language: "bash",
    filename: "deploy.sh",
    code: `#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting automated deployment pipeline..."
DEPLOY_ENV="\${1:-production}"
TAG=$(git rev-parse --short HEAD)

docker build -t "registry.internal/api:\${TAG}" .
docker push "registry.internal/api:\${TAG}"

kubectl set image "deployment/api-server" "api=registry.internal/api:\${TAG}" -n "\${DEPLOY_ENV}"
kubectl rollout status "deployment/api-server" -n "\${DEPLOY_ENV}" --timeout=120s

echo "✅ Successfully deployed \${TAG} to \${DEPLOY_ENV}!"`,
  },
];

// Simple syntax tokenizer for universal rendering
function tokenizeLine(line) {
  if (!line) return [{ type: "text", text: "" }];

  const tokens = [];
  let remaining = line;

  const patterns = [
    { type: "comment", regex: /^(\/\/.*|#.*|--.*|\/\*.*?\*\/)/ },
    { type: "string", regex: /^("[^"]*"|'[^']*'|`[^`]*`)/ },
    { type: "keyword", regex: /^\b(const|let|var|function|return|if|else|for|while|import|from|export|default|class|interface|type|async|await|def|class|pub|fn|struct|impl|match|use|SELECT|FROM|WHERE|JOIN|GROUP|ORDER|BY|HAVING|LIMIT|WITH|AS|true|false|null|undefined|None|nil)\b/i },
    { type: "number", regex: /^\b\d+(\.\d+)?\b/ },
    { type: "fn", regex: /^\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/ },
    { type: "type", regex: /^\b([A-Z][a-zA-Z0-9_$]*)\b/ },
    { type: "operator", regex: /^(=>|===|!==|==|!=|<=|>=|&&|\|\||[+\-*/%=<>!&|^~?:])/ },
    { type: "punctuation", regex: /^([{}()[\].,;])/ },
    { type: "text", regex: /^[^\s"'`#\-/a-zA-Z0-9_{}()[\].,;+=<>!&|^~?:]+|\s+/ },
    { type: "text", regex: /^[a-zA-Z0-9_$]+/ },
  ];

  while (remaining.length > 0) {
    let matched = false;
    for (const { type, regex } of patterns) {
      const match = remaining.match(regex);
      if (match && match[0].length > 0) {
        tokens.push({ type, text: match[0] });
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ type: "text", text: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

function parseHighlightLines(str) {
  const highlighted = new Set();
  if (!str.trim()) return highlighted;

  const parts = str.split(",").map((s) => s.trim());
  for (const part of parts) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map((n) => parseInt(n.trim(), 10));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          highlighted.add(i);
        }
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num)) {
        highlighted.add(num);
      }
    }
  }
  return highlighted;
}

export default function CodeToImage() {
  const { dark } = useTheme();

  // State
  const [code, setCode] = useState(CODE_TEMPLATES[0].code);
  const [filename, setFilename] = useState(CODE_TEMPLATES[0].filename);
  const [selectedTheme, setSelectedTheme] = useState("monochromeDark");
  const [selectedBg, setSelectedBg] = useState("darkMesh");
  const [customBgColor, setCustomBgColor] = useState("#0f172a");
  const [isCustomBg, setIsCustomBg] = useState(false);
  const [windowStyle, setWindowStyle] = useState("macos"); // macos, windows, tab, none
  const [fontFamily, setFontFamily] = useState("JetBrains Mono");
  const [fontSize, setFontSize] = useState(14);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [padding, setPadding] = useState(48);
  const [borderRadius, setBorderRadius] = useState(16);
  const [shadowStyle, setShadowStyle] = useState("dramatic"); // none, soft, dramatic, glow
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [highlightLinesInput, setHighlightLinesInput] = useState("2, 6-9");
  const [watermark, setWatermark] = useState("devtasks.io");
  const [showWatermark, setShowWatermark] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const previewCardRef = useRef(null);

  const themeConfig = THEMES[selectedTheme] || THEMES.monochromeDark;
  const currentBg = isCustomBg
    ? customBgColor
    : (BACKGROUNDS.find((b) => b.id === selectedBg) || BACKGROUNDS[0]).style;

  const highlightedLines = useMemo(
    () => parseHighlightLines(highlightLinesInput),
    [highlightLinesInput]
  );

  const lines = useMemo(() => code.split("\n"), [code]);

  const loadTemplate = (tpl) => {
    setCode(tpl.code);
    setFilename(tpl.filename);
    toast.success(`Loaded template: ${tpl.name}`);
  };

  const getShadowCss = () => {
    switch (shadowStyle) {
      case "soft":
        return "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)";
      case "dramatic":
        return "0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)";
      case "glow":
        return `0 0 35px ${themeConfig.keyword}33, 0 20px 40px rgba(0, 0, 0, 0.5)`;
      default:
        return "none";
    }
  };

  const generateSvgMarkup = useCallback(() => {
    const cardEl = previewCardRef.current;
    if (!cardEl) return null;

    const width = cardEl.offsetWidth;
    const height = cardEl.offsetHeight;

    const charWidth = fontSize * 0.6;
    const lineSpacing = fontSize * lineHeight;
    const contentPadX = 24;
    const contentPadY = windowStyle === "none" ? 24 : 52;
    const lineNumWidth = showLineNumbers ? 40 : 0;

    let svgLinesHtml = "";

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const isHighlighted = highlightedLines.has(lineNum);
      const y = contentPadY + idx * lineSpacing + fontSize;

      if (isHighlighted) {
        svgLinesHtml += `<rect x="0" y="${y - fontSize + 2}" width="${width - padding * 2}" height="${lineSpacing}" fill="${themeConfig.highlightBg}" />`;
      }

      if (showLineNumbers) {
        svgLinesHtml += `<text x="${contentPadX}" y="${y}" fill="${themeConfig.comment}" font-family="${fontFamily}, monospace" font-size="${fontSize - 2}" text-anchor="start" opacity="0.6">${lineNum}</text>`;
      }

      const tokens = tokenizeLine(lineText);
      let currentX = contentPadX + lineNumWidth;

      tokens.forEach((token) => {
        let color = themeConfig.text;
        if (token.type === "keyword") color = themeConfig.keyword;
        else if (token.type === "string") color = themeConfig.string;
        else if (token.type === "number") color = themeConfig.number;
        else if (token.type === "comment") color = themeConfig.comment;
        else if (token.type === "fn") color = themeConfig.fn;
        else if (token.type === "type") color = themeConfig.type;
        else if (token.type === "operator") color = themeConfig.operator;

        const escaped = token.text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

        svgLinesHtml += `<text x="${currentX}" y="${y}" fill="${color}" font-family="${fontFamily}, monospace" font-size="${fontSize}">${escaped}</text>`;
        currentX += token.text.length * charWidth;
      });
    });

    let windowControlsSvg = "";
    if (windowStyle === "macos") {
      windowControlsSvg = `
        <circle cx="20" cy="22" r="6" fill="#ff5f56" />
        <circle cx="40" cy="22" r="6" fill="#ffbd2e" />
        <circle cx="60" cy="22" r="6" fill="#27c93f" />
        <text x="${width / 2 - padding}" y="26" fill="${themeConfig.comment}" font-family="${fontFamily}, monospace" font-size="12" text-anchor="middle">${filename}</text>
      `;
    } else if (windowStyle === "windows") {
      windowControlsSvg = `
        <text x="20" y="26" fill="${themeConfig.comment}" font-family="${fontFamily}, monospace" font-size="12">${filename}</text>
        <rect x="${width - padding * 2 - 56}" y="18" width="10" height="2" fill="${themeConfig.comment}" />
        <rect x="${width - padding * 2 - 38}" y="15" width="8" height="8" fill="none" stroke="${themeConfig.comment}" stroke-width="1.5" />
        <line x1="${width - padding * 2 - 20}" y1="15" x2="${width - padding * 2 - 12}" y2="23" stroke="${themeConfig.comment}" stroke-width="1.5" />
        <line x1="${width - padding * 2 - 12}" y1="15" x2="${width - padding * 2 - 20}" y2="23" stroke="${themeConfig.comment}" stroke-width="1.5" />
      `;
    } else if (windowStyle === "tab") {
      windowControlsSvg = `
        <rect x="0" y="0" width="${width - padding * 2}" height="38" fill="${themeConfig.bg}" opacity="0.7" />
        <rect x="12" y="6" width="140" height="32" rx="6" fill="${themeConfig.bg}" stroke="${themeConfig.border}" stroke-width="1" />
        <text x="30" y="26" fill="${themeConfig.text}" font-family="${fontFamily}, monospace" font-size="12">${filename}</text>
      `;
    }

    const cardInnerWidth = width - padding * 2;
    const cardInnerHeight = height - padding * 2;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&amp;display=swap');
            text { white-space: pre; }
          </style>
        </defs>
        <rect width="${width}" height="${height}" fill="${currentBg.startsWith("linear") ? "#090a0f" : currentBg}" />
        <g transform="translate(${padding}, ${padding})">
          <rect width="${cardInnerWidth}" height="${cardInnerHeight}" rx="${borderRadius}" fill="${themeConfig.bg}" stroke="${themeConfig.border}" stroke-width="1" />
          ${windowControlsSvg}
          ${svgLinesHtml}
          ${
            showWatermark && watermark
              ? `<text x="${cardInnerWidth - 20}" y="${cardInnerHeight - 14}" fill="${themeConfig.comment}" font-family="${fontFamily}, monospace" font-size="10" text-anchor="end" opacity="0.7">${watermark}</text>`
              : ""
          }
        </g>
      </svg>
    `;

    return svg;
  }, [
    lines,
    highlightedLines,
    padding,
    borderRadius,
    themeConfig,
    currentBg,
    fontSize,
    lineHeight,
    fontFamily,
    filename,
    showLineNumbers,
    windowStyle,
    showWatermark,
    watermark,
  ]);

  const exportPng = async (copyToClipboard = false) => {
    setIsExporting(true);
    try {
      const cardEl = previewCardRef.current;
      if (!cardEl) throw new Error("Preview element not ready");

      const width = cardEl.offsetWidth * 2;
      const height = cardEl.offsetHeight * 2;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize canvas context");

      if (currentBg.startsWith("linear")) {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, "#18181b");
        grad.addColorStop(1, "#09090b");
        ctx.fillStyle = grad;
      } else if (currentBg === "transparent") {
        ctx.clearRect(0, 0, width, height);
      } else {
        ctx.fillStyle = currentBg;
      }

      if (currentBg !== "transparent") {
        ctx.fillRect(0, 0, width, height);
      }

      const svgString = generateSvgMarkup();
      if (!svgString) throw new Error("SVG generation failed");

      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);

        canvas.toBlob(async (pngBlob) => {
          if (!pngBlob) {
            toast.error("Failed to generate PNG image");
            setIsExporting(false);
            return;
          }

          if (copyToClipboard) {
            try {
              if (navigator.clipboard && window.ClipboardItem) {
                await navigator.clipboard.write([
                  new window.ClipboardItem({ "image/png": pngBlob }),
                ]);
                toast.success("Image copied to clipboard!");
              } else {
                toast.error("Clipboard image copy not supported in this browser");
              }
            } catch (err) {
              console.error(err);
              toast.error("Clipboard copy failed");
            }
          } else {
            const downloadUrl = URL.createObjectURL(pngBlob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `${filename || "code-snippet"}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
            toast.success("Downloaded high-res PNG image!");
          }
          setIsExporting(false);
        }, "image/png");
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast.error("Error rendering graphic onto canvas");
        setIsExporting(false);
      };

      img.src = url;
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to export image");
      setIsExporting(false);
    }
  };

  const exportSvg = () => {
    try {
      const svg = generateSvgMarkup();
      if (!svg) throw new Error("Failed to compile SVG");

      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename || "code-snippet"}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Downloaded SVG vector code snippet!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export SVG");
    }
  };

  const copySvg = async () => {
    try {
      const svg = generateSvgMarkup();
      if (!svg) throw new Error("Failed to compile SVG");
      await navigator.clipboard.writeText(svg);
      toast.success("SVG markup copied to clipboard!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy SVG");
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
                  Code Snippet to Image Studio
                </h1>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Offline
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500">
                Create beautiful, customizable code screenshots for documentation, presentations, and social sharing.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportPng(true)}
              disabled={isExporting}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                dark
                  ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200"
                  : "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-800"
              }`}
            >
              <Copy className="w-4 h-4" />
              Copy Image
            </button>
            <button
              onClick={copySvg}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                dark
                  ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200"
                  : "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-800"
              }`}
            >
              <FileCode className="w-4 h-4" />
              Copy SVG
            </button>
            <button
              onClick={exportSvg}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                dark
                  ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200"
                  : "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-800"
              }`}
            >
              <Download className="w-4 h-4" />
              SVG
            </button>
            <button
              onClick={() => exportPng(false)}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all shadow-sm"
            >
              <Camera className="w-4 h-4" />
              {isExporting ? "Exporting..." : "Export PNG"}
            </button>
          </div>
        </div>

        {/* Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 flex-1 items-start">
          {/* Controls Sidebar */}
          <div
            className={`lg:col-span-4 rounded-2xl border p-5 flex flex-col gap-5 ${
              dark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            {/* Quick Templates */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                Sample Templates
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CODE_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => loadTemplate(tpl)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                      filename === tpl.filename
                        ? dark
                          ? "bg-white text-black border-white"
                          : "bg-black text-white border-black"
                        : dark
                          ? "bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800"
                          : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Window & File Details */}
            <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                Window & Header
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">Window Title</span>
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className={`w-full px-3 py-1.5 text-xs rounded-xl border font-mono outline-none ${
                      dark
                        ? "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-600"
                        : "bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-zinc-400"
                    }`}
                  />
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">Frame Style</span>
                  <select
                    value={windowStyle}
                    onChange={(e) => setWindowStyle(e.target.value)}
                    className={`w-full px-3 py-1.5 text-xs rounded-xl border outline-none ${
                      dark
                        ? "bg-zinc-950 border-zinc-800 text-zinc-200"
                        : "bg-zinc-50 border-zinc-200 text-zinc-800"
                    }`}
                  >
                    <option value="macos">macOS Traffic Lights</option>
                    <option value="windows">Windows Controls</option>
                    <option value="tab">VS Code Tab</option>
                    <option value="none">No Header</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Theme & Styling */}
            <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                Themes & Background
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">Code Theme</span>
                  <select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    className={`w-full px-3 py-1.5 text-xs rounded-xl border outline-none ${
                      dark
                        ? "bg-zinc-950 border-zinc-800 text-zinc-200"
                        : "bg-zinc-50 border-zinc-200 text-zinc-800"
                    }`}
                  >
                    {Object.values(THEMES).map((th) => (
                      <option key={th.id} value={th.id}>
                        {th.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">Drop Shadow</span>
                  <select
                    value={shadowStyle}
                    onChange={(e) => setShadowStyle(e.target.value)}
                    className={`w-full px-3 py-1.5 text-xs rounded-xl border outline-none ${
                      dark
                        ? "bg-zinc-950 border-zinc-800 text-zinc-200"
                        : "bg-zinc-50 border-zinc-200 text-zinc-800"
                    }`}
                  >
                    <option value="dramatic">Dramatic Studio</option>
                    <option value="soft">Soft Subtle</option>
                    <option value="glow">Ambient Glow</option>
                    <option value="none">No Shadow</option>
                  </select>
                </div>
              </div>

              {/* Background gradient picker */}
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1.5">Canvas Gradient</span>
                <div className="grid grid-cols-5 gap-2">
                  {BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => {
                        setSelectedBg(bg.id);
                        setIsCustomBg(false);
                      }}
                      title={bg.name}
                      style={{ background: bg.style }}
                      className={`h-8 rounded-lg border relative transition-all ${
                        selectedBg === bg.id && !isCustomBg
                          ? "ring-2 ring-white scale-105 border-transparent shadow-md"
                          : "border-zinc-700/60 opacity-80 hover:opacity-100"
                      }`}
                    >
                      {bg.id === "transparent" && (
                        <span className="text-[9px] font-bold text-zinc-400 flex items-center justify-center h-full">
                          None
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setIsCustomBg(!isCustomBg)}
                    className={`px-2 py-1 text-[11px] rounded-lg border font-medium transition-all ${
                      isCustomBg
                        ? "bg-white text-black border-white"
                        : "text-zinc-400 border-zinc-750 hover:text-white"
                    }`}
                  >
                    Custom Color
                  </button>
                  {isCustomBg && (
                    <input
                      type="color"
                      value={customBgColor}
                      onChange={(e) => setCustomBgColor(e.target.value)}
                      className="w-8 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Typography & Code Controls */}
            <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                Typography & Line Highlighting
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">Font Family</span>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className={`w-full px-3 py-1.5 text-xs rounded-xl border outline-none ${
                      dark
                        ? "bg-zinc-950 border-zinc-800 text-zinc-200"
                        : "bg-zinc-50 border-zinc-200 text-zinc-800"
                    }`}
                  >
                    <option value="JetBrains Mono">JetBrains Mono</option>
                    <option value="Fira Code">Fira Code</option>
                    <option value="Source Code Pro">Source Code Pro</option>
                    <option value="Consolas">Consolas</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">
                    Font Size ({fontSize}px)
                  </span>
                  <input
                    type="range"
                    min={11}
                    max={20}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-zinc-700 appearance-none cursor-pointer accent-white"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">
                  Line Height ({lineHeight})
                </span>
                <input
                  type="range"
                  min={1.2}
                  max={2.2}
                  step={0.1}
                  value={lineHeight}
                  onChange={(e) => setLineHeight(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-zinc-700 appearance-none cursor-pointer accent-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">
                    Padding ({padding}px)
                  </span>
                  <input
                    type="range"
                    min={16}
                    max={80}
                    step={4}
                    value={padding}
                    onChange={(e) => setPadding(Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-zinc-700 appearance-none cursor-pointer accent-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">
                    Radius ({borderRadius}px)
                  </span>
                  <input
                    type="range"
                    min={4}
                    max={28}
                    step={2}
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-zinc-700 appearance-none cursor-pointer accent-white"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">
                  Highlight Lines (e.g. 2, 4-6)
                </span>
                <input
                  type="text"
                  value={highlightLinesInput}
                  onChange={(e) => setHighlightLinesInput(e.target.value)}
                  placeholder="e.g. 2, 4-6"
                  className={`w-full px-3 py-1.5 text-xs rounded-xl border font-mono outline-none ${
                    dark
                      ? "bg-zinc-950 border-zinc-800 text-zinc-200"
                      : "bg-zinc-50 border-zinc-200 text-zinc-800"
                  }`}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs cursor-pointer text-zinc-400 hover:text-white">
                  <input
                    type="checkbox"
                    checked={showLineNumbers}
                    onChange={(e) => setShowLineNumbers(e.target.checked)}
                    className="rounded border-zinc-700 text-white accent-white"
                  />
                  Line Numbers
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer text-zinc-400 hover:text-white">
                  <input
                    type="checkbox"
                    checked={showWatermark}
                    onChange={(e) => setShowWatermark(e.target.checked)}
                    className="rounded border-zinc-700 text-white accent-white"
                  />
                  Author Tag
                </label>
              </div>

              {showWatermark && (
                <input
                  type="text"
                  value={watermark}
                  onChange={(e) => setWatermark(e.target.value)}
                  placeholder="@yourhandle or domain"
                  className={`w-full px-3 py-1.5 text-xs rounded-xl border outline-none ${
                    dark
                      ? "bg-zinc-950 border-zinc-800 text-zinc-200"
                      : "bg-zinc-50 border-zinc-200 text-zinc-800"
                  }`}
                />
              )}
            </div>
          </div>

          {/* Right Area: Code Editor + Live Visual Preview */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Live Visual Preview Canvas */}
            <div
              className={`rounded-2xl border p-4 sm:p-8 flex items-center justify-center overflow-x-auto min-h-[420px] ${
                dark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-100 border-zinc-200"
              }`}
            >
              <div
                ref={previewCardRef}
                style={{
                  background: currentBg,
                  padding: `${padding}px`,
                }}
                className="transition-all duration-200 w-full max-w-2xl flex items-center justify-center"
              >
                {/* Code Card */}
                <div
                  style={{
                    backgroundColor: themeConfig.bg,
                    borderColor: themeConfig.border,
                    borderRadius: `${borderRadius}px`,
                    boxShadow: getShadowCss(),
                    fontFamily: `${fontFamily}, monospace`,
                  }}
                  className="w-full border overflow-hidden relative transition-all"
                >
                  {/* Window Chrome Header */}
                  {windowStyle !== "none" && (
                    <div
                      style={{ borderColor: themeConfig.border }}
                      className="px-4 py-3 border-b flex items-center justify-between select-none"
                    >
                      {windowStyle === "macos" && (
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-sm" />
                          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-sm" />
                          <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-sm" />
                        </div>
                      )}

                      {windowStyle === "windows" && (
                        <span
                          style={{ color: themeConfig.comment }}
                          className="text-xs font-mono font-medium"
                        >
                          {filename}
                        </span>
                      )}

                      {windowStyle === "tab" && (
                        <div
                          style={{
                            backgroundColor: themeConfig.bg,
                            borderColor: themeConfig.border,
                            color: themeConfig.text,
                          }}
                          className="px-3 py-1 text-xs font-mono font-medium rounded-t-lg border-t border-x -mb-3"
                        >
                          {filename}
                        </div>
                      )}

                      {windowStyle === "macos" && (
                        <span
                          style={{ color: themeConfig.comment }}
                          className="text-xs font-mono font-medium"
                        >
                          {filename}
                        </span>
                      )}

                      {windowStyle === "windows" && (
                        <div className="flex items-center gap-3 text-zinc-500 text-xs">
                          <span>—</span>
                          <span>▢</span>
                          <span>✕</span>
                        </div>
                      )}

                      {windowStyle === "macos" && <div className="w-12" />}
                      {windowStyle === "tab" && <div className="w-8" />}
                    </div>
                  )}

                  {/* Code Lines Body */}
                  <div
                    style={{
                      fontSize: `${fontSize}px`,
                      lineHeight: lineHeight,
                    }}
                    className="p-5 font-mono overflow-x-auto text-left"
                  >
                    {lines.map((lineText, idx) => {
                      const lineNum = idx + 1;
                      const isHighlighted = highlightedLines.has(lineNum);
                      const tokens = tokenizeLine(lineText);

                      return (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: isHighlighted
                              ? themeConfig.highlightBg
                              : "transparent",
                          }}
                          className={`flex items-start rounded px-1.5 -mx-1.5 transition-colors ${
                            isHighlighted ? "relative" : ""
                          }`}
                        >
                          {showLineNumbers && (
                            <span
                              style={{ color: themeConfig.comment }}
                              className="w-8 select-none text-right pr-4 opacity-40 shrink-0 text-xs mt-0.5"
                            >
                              {lineNum}
                            </span>
                          )}
                          <span className="flex-1 whitespace-pre">
                            {tokens.map((token, tIdx) => {
                              let color = themeConfig.text;
                              if (token.type === "keyword") color = themeConfig.keyword;
                              else if (token.type === "string") color = themeConfig.string;
                              else if (token.type === "number") color = themeConfig.number;
                              else if (token.type === "comment") color = themeConfig.comment;
                              else if (token.type === "fn") color = themeConfig.fn;
                              else if (token.type === "type") color = themeConfig.type;
                              else if (token.type === "operator") color = themeConfig.operator;

                              return (
                                <span
                                  key={tIdx}
                                  style={{ color }}
                                  className={
                                    token.type === "keyword"
                                      ? "font-semibold"
                                      : token.type === "comment"
                                        ? "italic"
                                        : ""
                                  }
                                >
                                  {token.text}
                                </span>
                              );
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Watermark Tag */}
                  {showWatermark && watermark && (
                    <div className="px-4 pb-2.5 pt-1 text-right select-none">
                      <span
                        style={{ color: themeConfig.comment }}
                        className="text-[10px] font-mono opacity-60"
                      >
                        {watermark}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Live Code Input Editor */}
            <div
              className={`rounded-2xl border p-5 ${
                dark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Snippet Editor (Type or Paste Code)
                </label>
                <button
                  onClick={() => setCode("")}
                  className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                >
                  Clear Code
                </button>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={10}
                spellCheck={false}
                placeholder="Paste or write code here..."
                className={`w-full p-4 rounded-xl border font-mono text-xs outline-none resize-y transition-all ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-500"
                    : "bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-zinc-400"
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
