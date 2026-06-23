import { Link, useSearchParams } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useCallback, useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { toast } from "sonner";


const CodeSandbox = () => {
  const { dark } = useTheme();
  const [ searchParams ] = useSearchParams();
  const [ activeIndex, setActiveIndex ] = useState(0); 
  const [ html, setHtml ] = useState(`<h1>Hello！</h1>
<p>Clicking the button changes its color</p>
<button id="alert-btn">click</button>
`);
  const [ css, setCss ] = useState(`body {
  font-family: sans-serif;
  text-align: center;
  padding-top: 50px;
}
h1 {
  color: #333;
}
button {
  padding: 10px 20px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}`);
  const [ js, setJs ] = useState(`const btn = document.getElementById("alert-btn");
btn.addEventListener("click", () => {
  document.body.style.backgroundColor = "#e0f7fa";
  window.alert("The button was clicked.");
});`);
  const [ srcDoc, setSrcdoc ] = useState("");

  const tabs = [
    {title: "html", language: "html", content: html, stateFunc: setHtml},
    {title: "css", language: "css", content: css, stateFunc: setCss},
    {title: "js", language: "javascript", content: js, stateFunc: setJs}
  ];

  const handleBuild = useCallback(() => {
    const buildSource = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>${js}<\/script>
      </body>
      </html>
    `;
    setSrcdoc(buildSource);
  }, [html, css, js]);

  useEffect(() => {
    const searchParamHtml = searchParams.get("html");
    const searchParamCss = searchParams.get("css");
    const searchParamJs = searchParams.get("js");

    if (searchParamHtml || searchParamCss || searchParamJs) {
      setHtml(searchParamHtml || "");
      setCss(searchParamCss || "");
      setJs(searchParamJs || "");
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleBuild()
    }, 500)
    
    return () => clearTimeout(timer);
  }, [html, css, js]);

  const handleEditorDidMount = (editor) => {
    const domNode = editor.getDomNode();
    if (!domNode) return;

    domNode.addEventListener("keydown", (event) => {
      if (event.key === "/") event.stopPropagation();
    }, true);
  };

  const handleClear = () => {
    setHtml("");
    setCss("");
    setJs("");
  };

  const handleShare = async () => {
    const queryParams = tabs.filter((tab) => tab.content && tab.content.trim())
      .map((tab) => `${tab.title}=${encodeURIComponent(tab.content)}`).join("&");

    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?${queryParams}`);
      toast.success("Share link copied");
    } catch(error) {
      console.error("Failed to copy:" + error);
      toast.error("Failed to copy");
    }
  };

  return (
    <div
      className={`min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden md:overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>Code Sandbox — DevTasks</title>
      <meta
        name="description"
        content="Instantly test raw HTML/CSS/JS with a live preview. No local environment required."
      />

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

      <div
        className={`relative z-10 w-full max-w-5xl md:w-[85%] mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div
          className={`h-2 w-full transition-colors duration-500 ${
            dark ? "bg-white" : "bg-black"
          }`}
        />

        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex items-center gap-3">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
              dark
                ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                : "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350"
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
          <h1
            className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 ${
              dark ? "text-white" : "text-black"
            }`}
          >
            Code Sandbox
          </h1>
        </div>

        <div className="w-full md:h-[464px] p-5 sm:p-8 overflow-y-auto">
          <div className="w-full h-full flex flex-col md:flex-row gap-4">

            {/* LEFT: Input Area */}
            <div
              className="group w-full flex flex-col space-y-4"
            >
              <div
                className="flex justify-between border-b border-gray-200 py-1"
              >
                <div className="flex gap-1.5">
                  {tabs.map((tab, index) => {
                    const isActive = activeIndex === index;
                    return (
                      <button
                        key={index}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveIndex(index)}
                        className={`text-[10px] sm:text-xs font-black uppercase tracking-widest px-3.5 py-2 rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer ${
                          isActive
                            ? dark
                              ? "bg-white text-black border border-white"
                              : "bg-black text-white border border-black"
                            : dark
                              ? "text-zinc-400 hover:text-white bg-zinc-900/40 hover:bg-zinc-800/40 border border-zinc-800/60"
                              : "text-neutral-500 hover:text-black bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/60"
                        }`}
                      >
                        {tab.title}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleShare}
                    className={`text-[10px] sm:text-xs font-black uppercase tracking-widest px-3.5 py-2 rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer ${
                      dark
                          ? "text-zinc-400 hover:text-white bg-zinc-900/40 hover:bg-zinc-800/40 border border-zinc-800/60"
                          : "text-neutral-500 hover:text-black bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/60"
                    }`}
                  >
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className={`text-[10px] sm:text-xs font-black uppercase tracking-widest px-3.5 py-2 rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer ${
                      dark
                          ? "text-zinc-400 hover:text-white bg-zinc-900/40 hover:bg-zinc-800/40 border border-zinc-800/60"
                          : "text-neutral-500 hover:text-black bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/60"
                    }`}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div role="tabpanel"
                className="h-full"
              >
                <Editor
                  theme={dark ? "vs-dark": "light"}
                  path={tabs[activeIndex].title}
                  language={tabs[activeIndex].language}
                  value={tabs[activeIndex].content}
                  onChange={(value) => tabs[activeIndex].stateFunc(value)}
                  onMount={handleEditorDidMount}
                />
              </div>
            </div>

            {/* RIGHT: Preview Area */}
            <div
              className="w-full flex flex-col space-y-2"
            >
              <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                    dark
                      ? "text-zinc-400 group-focus-within:text-white"
                      : "text-neutral-500 group-focus-within:text-black"
                  }`}
              >
                LIVE PREVIEW
              </label>
              <iframe
                title="Live preview"
                className={`md:h-full h-40 px-4 py-3 rounded-2xl border text-sm font-mono outline-none transition-all duration-300 resize-none ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                }`}
                srcDoc={srcDoc}
                sandbox="allow-scripts allow-modals"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeSandbox;
