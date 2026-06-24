import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";
import {
  FaChrome,
  FaFirefox,
  FaSafari,
  FaEdge,
  FaOpera,
  FaInternetExplorer,
  FaWindows,
  FaApple,
  FaLinux,
  FaAndroid,
  FaMobileAlt,
  FaTabletAlt,
  FaLaptop,
  FaDesktop,
  FaCopy,
  FaTrash,
  FaSync,
  FaGlobe,
  FaClock,
  FaNetworkWired,
  FaMicrochip,
  FaRobot,
  FaCog,
  FaCheck,
} from "react-icons/fa";

// User Agent Parsing Logic
const parseUA = (ua) => {
  let browserName = "Unknown Browser";
  let osName = "Unknown OS";
  let device = "Desktop";
  let engineName = "Unknown Engine";

  const uaLower = ua.toLowerCase();

  // 1. Detect OS
  if (uaLower.includes("windows")) {
    osName = "Windows";
  } else if (uaLower.includes("android")) {
    osName = "Android";
  } else if (uaLower.includes("iphone") || uaLower.includes("ipad") || uaLower.includes("ipod")) {
    osName = "iOS";
  } else if (uaLower.includes("macintosh") || uaLower.includes("mac os x")) {
    osName = "macOS";
  } else if (uaLower.includes("linux")) {
    osName = "Linux";
  } else if (uaLower.includes("cros")) {
    osName = "ChromeOS";
  }

  // 2. Detect Browser
  if (uaLower.includes("samsungbrowser")) {
    browserName = "Samsung Internet";
  } else if (uaLower.includes("ucbrowser")) {
    browserName = "UC Browser";
  } else if (uaLower.includes("opera") || uaLower.includes("opr") || uaLower.includes("opios")) {
    browserName = "Opera";
  } else if (uaLower.includes("edg") || uaLower.includes("edge")) {
    browserName = "Microsoft Edge";
  } else if (uaLower.includes("chrome") || uaLower.includes("crios")) {
    browserName = "Google Chrome";
  } else if (uaLower.includes("firefox") || uaLower.includes("fxios")) {
    browserName = "Mozilla Firefox";
  } else if (uaLower.includes("safari")) {
    // Note: Chrome and Edge contain 'Safari' in their UA, so this check must be after them
    browserName = "Safari";
  } else if (uaLower.includes("msie") || uaLower.includes("trident/")) {
    browserName = "Internet Explorer";
  } else if (uaLower.includes("googlebot")) {
    browserName = "Googlebot";
  }

  // 3. Detect Device Type
  if (/googlebot/i.test(ua)) {
    device = "Bot";
  } else if (/ipad|tablet/i.test(ua)) {
    device = "Tablet";
  } else if (/mobile|phone|iphone|ipod|android/i.test(ua)) {
    if (uaLower.includes("android") && !uaLower.includes("mobile")) {
      device = "Tablet";
    } else {
      device = "Mobile";
    }
  } else {
    device = "Desktop";
  }

  // 4. Detect Engine
  if (uaLower.includes("applewebkit")) {
    engineName = "WebKit";
    if (uaLower.includes("chrome") || uaLower.includes("chromium")) {
      engineName = "Blink";
    }
  } else if (uaLower.includes("gecko") && !uaLower.includes("like gecko")) {
    engineName = "Gecko";
  } else if (uaLower.includes("trident")) {
    engineName = "Trident";
  } else if (uaLower.includes("edge/")) {
    engineName = "EdgeHTML";
  }

  return { browser: browserName, os: osName, deviceType: device, engine: engineName };
};

const UserAgentParser = () => {
  const { dark } = useTheme();

  const [userAgent, setUserAgent] = useState(() => {
    return typeof navigator !== "undefined" ? navigator.userAgent : "";
  });

  const [viewport, setViewport] = useState(() => {
    return {
      width: typeof window !== "undefined" ? window.innerWidth : 1920,
      height: typeof window !== "undefined" ? window.innerHeight : 1080,
    };
  });

  const [browser, setBrowser] = useState("Unknown");
  const [os, setOs] = useState("Unknown");
  const [deviceType, setDeviceType] = useState("Desktop");
  const [engine, setEngine] = useState("Unknown");

  const sampleUAs = {
    Googlebot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Safari iPhone": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Chrome Android": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
    "Firefox Linux": "Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0",
    "Edge Windows": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
  };

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  useEffect(() => {
    const info = parseUA(userAgent);
    setBrowser(info.browser);
    setOs(info.os);
    setDeviceType(info.deviceType);
    setEngine(info.engine);
  }, [userAgent]);

  const loadSampleUA = (ua) => {
    setUserAgent(ua);
    toast.success("Loaded sample user agent string");
  };

  const copyToClipboard = (text, message) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const getBrowserIcon = (browserName) => {
    const name = browserName.toLowerCase();
    if (name.includes("chrome")) return <FaChrome className="text-amber-500 w-4 h-4" />;
    if (name.includes("firefox")) return <FaFirefox className="text-orange-500 w-4 h-4" />;
    if (name.includes("safari")) return <FaSafari className="text-blue-500 w-4 h-4" />;
    if (name.includes("edge")) return <FaEdge className="text-blue-600 w-4 h-4" />;
    if (name.includes("opera")) return <FaOpera className="text-red-600 w-4 h-4" />;
    if (name.includes("internet explorer")) return <FaInternetExplorer className="text-blue-400 w-4 h-4" />;
    if (name.includes("googlebot")) return <FaRobot className="text-zinc-500 w-4 h-4" />;
    return <FaGlobe className="text-zinc-400 w-4 h-4" />;
  };

  const getOSIcon = (osName) => {
    const name = osName.toLowerCase();
    if (name.includes("windows")) return <FaWindows className="text-blue-500 w-4 h-4" />;
    if (name.includes("mac") || name.includes("ios")) return <FaApple className="text-zinc-600 dark:text-zinc-300 w-4 h-4" />;
    if (name.includes("linux")) return <FaLinux className="text-zinc-700 dark:text-zinc-400 w-4 h-4" />;
    if (name.includes("android")) return <FaAndroid className="text-green-500 w-4 h-4" />;
    return <FaCog className="text-zinc-400 w-4 h-4" />;
  };

  const getDeviceIcon = (deviceType) => {
    const name = deviceType.toLowerCase();
    if (name.includes("mobile")) return <FaMobileAlt className="text-indigo-500 w-4 h-4" />;
    if (name.includes("tablet")) return <FaTabletAlt className="text-purple-500 w-4 h-4" />;
    if (name.includes("bot")) return <FaRobot className="text-red-400 w-4 h-4" />;
    return <FaLaptop className="text-teal-500 w-4 h-4" />;
  };

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85 shadow-sm",
      input: "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none",
      button: "bg-zinc-900 text-white hover:bg-zinc-800 transition-all duration-200 shadow-sm",
      secondaryBtn: "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50 transition-all duration-200",
      backLink: "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350",
      badge: "bg-zinc-100 text-zinc-800 border-zinc-200",
      rowBorder: "border-zinc-100",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-500",
      card: "bg-zinc-900/50 border-zinc-800/85 backdrop-blur-md shadow-md",
      input: "bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none",
      button: "bg-white text-zinc-900 hover:bg-zinc-100 transition-all duration-200 shadow-sm",
      secondaryBtn: "bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-200",
      backLink: "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600",
      badge: "bg-zinc-800 text-zinc-300 border-zinc-700",
      rowBorder: "border-zinc-800/60",
    },
  };

  const t = dark ? theme.dark : theme.light;

  const clientInfoRows = [
    { label: "Browser", value: browser, icon: getBrowserIcon(browser) },
    { label: "OS", value: os, icon: getOSIcon(os) },
    { label: "Device Type", value: deviceType, icon: getDeviceIcon(deviceType) },
    { label: "Engine", value: engine, icon: <FaCog className="text-zinc-400 w-4 h-4" /> },
    { label: "Viewport Size", value: `${viewport.width}px × ${viewport.height}px`, icon: <FaLaptop className="text-zinc-400 w-4 h-4" /> },
    { label: "Screen Resolution", value: `${window.screen?.width || 0} × ${window.screen?.height || 0}`, icon: <FaDesktop className="text-zinc-400 w-4 h-4" /> },
    { label: "Device Pixel Ratio", value: window.devicePixelRatio || 1, icon: <FaCog className="text-zinc-400 w-4 h-4" /> },
    { label: "Language", value: navigator.language || "en-US", icon: <FaGlobe className="text-zinc-400 w-4 h-4" /> },
    { label: "Timezone", value: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown", icon: <FaClock className="text-zinc-400 w-4 h-4" /> },
    { label: "Online Status", value: navigator.onLine ? "Online" : "Offline", icon: <FaNetworkWired className="text-zinc-400 w-4 h-4" />, isBadge: true, isGreen: navigator.onLine },
    { label: "Hardware Threads", value: navigator.hardwareConcurrency || "Unknown", icon: <FaMicrochip className="text-zinc-400 w-4 h-4" /> },
    { label: "Platform", value: navigator.platform || "Unknown", icon: <FaCog className="text-zinc-400 w-4 h-4" /> },
    { label: "Cookies Enabled", value: navigator.cookieEnabled ? "Yes" : "No", icon: <FaCog className="text-zinc-400 w-4 h-4" />, isBadge: true, isGreen: navigator.cookieEnabled },
  ];

  const renderDesktopMockup = () => (
    <div className="relative border border-zinc-700/50 rounded-lg p-2 bg-zinc-900 w-full max-w-[280px] aspect-video flex flex-col shadow-lg">
      <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-800">
        <span className="w-2 h-2 rounded-full bg-red-500/80"></span>
        <span className="w-2 h-2 rounded-full bg-yellow-500/80"></span>
        <span className="w-2 h-2 rounded-full bg-green-500/80"></span>
        <div className="flex-1 bg-zinc-800 text-[8px] text-zinc-400 text-center py-0.5 rounded ml-2 truncate font-mono">
          {browser.toLowerCase().replace(/\s+/g, "") || "localhost"}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-3 text-center text-xs font-mono">
        <FaLaptop className="text-4xl text-teal-400 mb-1" />
        <span className="font-semibold text-zinc-300 text-[10px]">{os}</span>
        <span className="text-[9px] text-zinc-500">{viewport.width} × {viewport.height}</span>
      </div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-2 bg-zinc-800 rounded-b border-t border-zinc-700"></div>
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-1 bg-zinc-700 rounded-full"></div>
    </div>
  );

  const renderMobileMockup = () => (
    <div className="relative border-4 border-zinc-700 rounded-[1.5rem] p-1.5 bg-zinc-900 w-[120px] aspect-[9/16] flex flex-col shadow-lg">
      <div className="w-12 h-2.5 bg-zinc-700 rounded-full mx-auto mb-1 flex items-center justify-center">
        <span className="w-1 h-1 rounded-full bg-zinc-900"></span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-1 text-center font-mono rounded-xl bg-zinc-950">
        <FaMobileAlt className="text-2xl text-indigo-400 mb-1" />
        <span className="font-semibold text-[8px] text-zinc-300 truncate w-full">{os}</span>
        <span className="text-[8px] text-zinc-500">{viewport.width} × {viewport.height}</span>
      </div>
      <div className="w-8 h-0.5 bg-zinc-700 rounded-full mx-auto mt-1"></div>
    </div>
  );

  const renderTabletMockup = () => (
    <div className="relative border-4 border-zinc-700 rounded-[1.2rem] p-2 bg-zinc-900 w-[160px] aspect-[3/4] flex flex-col shadow-lg">
      <div className="w-1 h-1 bg-zinc-700 rounded-full mx-auto mb-1.5"></div>
      <div className="flex-1 flex flex-col items-center justify-center p-2 text-center font-mono rounded bg-zinc-950">
        <FaTabletAlt className="text-3xl text-purple-400 mb-1" />
        <span className="font-semibold text-[9px] text-zinc-300">{os}</span>
        <span className="text-[8px] text-zinc-500">{viewport.width} × {viewport.height}</span>
      </div>
    </div>
  );

  const renderBotMockup = () => (
    <div className="relative border border-zinc-700/50 rounded-2xl p-4 bg-zinc-900/60 w-[160px] aspect-square flex flex-col items-center justify-center shadow-lg text-center font-mono">
      <FaRobot className="text-4xl text-red-400 mb-2 animate-bounce" />
      <span className="text-[10px] font-semibold text-zinc-300">Bot / Crawler</span>
      <span className="text-[9px] text-red-300 font-semibold truncate max-w-full">{browser}</span>
    </div>
  );

  return (
    <div className={`min-h-screen ${t.wrapper} px-6 py-10 transition-colors duration-300`}>
      <title>User Agent Parser — DevTasks</title>
      <meta
        name="description"
        content="Parse user agent strings, view detailed browser and OS specifications, and inspect local client configuration parameters."
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${t.backLink}`}
            title="Back to Utilities"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${t.heading}`}>
              User Agent Parser & Client Info
            </h1>
            <p className={`mt-1 text-sm ${t.subtext}`}>
              Inspect client properties and analyze browser user agent strings.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Client Info */}
          <div className={`rounded-3xl border ${t.card} p-6 space-y-4`}>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
              <h2 className="text-lg font-semibold tracking-tight">Client Inspector Details</h2>
              <button
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(
                      {
                        browser,
                        os,
                        deviceType,
                        engine,
                        language: navigator.language,
                        viewport: `${viewport.width}x${viewport.height}`,
                        screenResolution: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
                        devicePixelRatio: window.devicePixelRatio,
                        platform: navigator.platform,
                      },
                      null,
                      2
                    ),
                    "Copied details JSON to clipboard!"
                  )
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${t.secondaryBtn}`}
              >
                <FaCopy /> Copy Details JSON
              </button>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {clientInfoRows.map((row) => (
                <div key={row.label} className="py-2.5 flex items-center justify-between gap-4 text-sm font-medium">
                  <div className="flex items-center gap-2.5 text-zinc-500">
                    {row.icon}
                    <span>{row.label}</span>
                  </div>
                  {row.isBadge ? (
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                        row.isGreen
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : "bg-red-500/10 text-red-600 border-red-500/20"
                      }`}
                    >
                      {row.value}
                    </span>
                  ) : (
                    <span className="font-mono text-right truncate max-w-[220px]" title={row.value?.toString()}>
                      {row.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: User Agent String Details */}
          <div className="space-y-6">
            {/* Input Card */}
            <div className={`rounded-3xl border ${t.card} p-6 space-y-4`}>
              <div className="flex items-center justify-between">
                <p className={`text-xs uppercase tracking-widest font-semibold ${t.subtext}`}>
                  User Agent String Input
                </p>
                <span className="text-xs font-mono text-zinc-500">{userAgent.length} chars</span>
              </div>

              <textarea
                className={`w-full px-4 py-3 rounded-2xl border text-sm font-mono resize-none focus:ring-1 focus:ring-zinc-400 ${t.input}`}
                rows={5}
                placeholder="Paste or enter user agent string here..."
                value={userAgent}
                onChange={(e) => setUserAgent(e.target.value)}
              />

              <div className="flex flex-wrap gap-2.5 pt-2">
                <button
                  onClick={() => copyToClipboard(userAgent, "User Agent copied to clipboard!")}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 ${t.button}`}
                >
                  <FaCopy /> Copy
                </button>

                <button
                  onClick={() => {
                    setUserAgent("");
                    toast.success("Cleared user agent string");
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 ${t.secondaryBtn}`}
                >
                  <FaTrash /> Clear
                </button>

                <button
                  onClick={() => {
                    setUserAgent(navigator.userAgent);
                    toast.success("Detected live client user agent");
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 ${t.secondaryBtn}`}
                >
                  <FaSync /> Reset to My UA
                </button>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                <p className="text-xs font-semibold text-zinc-500 mb-2.5 uppercase tracking-wider">Quick Sample Presets</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(sampleUAs).map(([label, ua]) => (
                    <button
                      key={label}
                      onClick={() => loadSampleUA(ua)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border hover:border-zinc-400 dark:hover:border-zinc-500 hover:scale-[1.02] active:scale-95 transition-all duration-150 ${
                        userAgent === ua
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent font-semibold"
                          : t.secondaryBtn
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Preview Mockup Card */}
            <div className={`rounded-3xl border ${t.card} p-6 flex flex-col justify-center items-center gap-4`}>
              <div className="w-full flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/60 self-start">
                <p className={`text-xs uppercase tracking-widest font-semibold ${t.subtext}`}>
                  Interactive Device Preview
                </p>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold border bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
                  {deviceType}
                </span>
              </div>
              <div className="w-full flex justify-center items-center py-6 min-h-[220px]">
                {deviceType === "Mobile" && renderMobileMockup()}
                {deviceType === "Tablet" && renderTabletMockup()}
                {deviceType === "Desktop" && renderDesktopMockup()}
                {deviceType === "Bot" && renderBotMockup()}
              </div>
              <p className="text-[11px] text-center text-zinc-500 font-medium max-w-xs leading-relaxed">
                Visual mockup updates dynamically based on the parsed User Agent device type and system configuration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAgentParser;