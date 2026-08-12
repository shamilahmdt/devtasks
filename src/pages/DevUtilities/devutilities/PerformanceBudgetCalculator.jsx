import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

const PerformanceBudgetCalculator = () => {
  const { dark } = useTheme();
  const [inputData, setInputData] = useState({
    html_size: null,
    css_size: null,
    jav_size: null,
    jav_type: ".zip",
    images_size: null,
    fonts_size: null,
    others_size: null,
    connection_preset: "dialup",
    target_budget: null,
  });

  const [inputDataErros, setInputDataErrors] = useState({
    html_size: null,
    css_size: null,
    jav_size: null,
    images_size: null,
    fonts_size: null,
    others_size: null,
    target_budget: null,
  });

  const [metrics, setMetrics] = useState({
    fcpTime: "0.00",
    ttiTime: "0.00",
    totalWeight: 0,
    budgetPercentage: 0,
    isOverBudget: false,
    jsWarning: false,
  });

  const handleInput = (e) => {
    setInputData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculatePerformance = (e) => {
    const newErrors = {};
    let hasError = false;

    // 1. Validăm câmpul critic: Target Budget (dacă vrei să fie obligatoriu)
    const budgetValue = inputData.target_budget;
    if (
      budgetValue === "" ||
      budgetValue === null ||
      isNaN(Number(budgetValue)) ||
      Number(budgetValue) <= 0
    ) {
      newErrors.target_budget = "Please set a valid target budget (> 0)";
      hasError = true;
    } else {
      newErrors.target_budget = null;
    }

    // 2. Pentru restul resurselor: nu sunt mandatory, dar dacă se introduce ceva, trebuie să fie un număr valid
    const resourceFields = [
      "html_size",
      "css_size",
      "jav_size",
      "images_size",
      "fonts_size",
      "others_size",
    ];

    resourceFields.forEach((field) => {
      const value = inputData[field];

      if (value !== "" && value !== null && isNaN(Number(value))) {
        newErrors[field] = "This value must be a number";
        hasError = true;
      } else {
        newErrors[field] = null;
      }
    });
    setInputDataErrors(newErrors);
    if (hasError) {
      return;
    }
    calculateMetrics();
  };

  const calculateMetrics = () => {
    const networkProfiles = {
      dialup: { latency: 800, throughput: 56 },
      slow3g: { latency: 400, throughput: 400 },
      fast3g: { latency: 150, throughput: 1600 },
      fourg: { latency: 50, throughput: 15000 },
      fiber: { latency: 10, throughput: 100000 },
    };

    const currentNetwork =
      networkProfiles[inputData.connection_preset] || networkProfiles.dialup;

    const totalWeight =
      Number(inputData.html_size || 0) +
      Number(inputData.css_size || 0) +
      Number(inputData.jav_size || 0) +
      Number(inputData.images_size || 0) +
      Number(inputData.fonts_size || 0) +
      Number(inputData.others_size || 0);

    const targetBudget = Number(inputData.target_budget) || 500;

    const budgetPercentage = Math.min(
      Math.round((totalWeight / targetBudget) * 100),
      100,
    );

    const isOverBudget = totalWeight > targetBudget;

    const throughputKBps = currentNetwork.throughput / 8;

    const latencySeconds = currentNetwork.latency / 1000;

    const fcpSize =
      Number(inputData.html_size || 0) + Number(inputData.css_size || 0);

    const fcpTime = (latencySeconds + fcpSize / throughputKBps).toFixed(2);

    const ttiTime = (latencySeconds + totalWeight / throughputKBps).toFixed(2);

    const jsWarning = Number(inputData.jav_size || 0) > 150;

    setMetrics({
      fcpTime,
      ttiTime,
      totalWeight,
      budgetPercentage,
      isOverBudget,
      jsWarning,
    });
  };

  return (
    <div
      className={`px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden md:overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>Web Vitals & Performance Budget Calculator</title>
      <meta
        name="description"
        content="Calculate budget based on website metrics"
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
        className={`relative z-10 w-full max-w-5xl md:mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full  overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div
          className={`h-2 w-full transition-colors duration-500 ${
            dark ? "bg-white" : "bg-black"
          }`}
        />

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex items-center gap-3 w-full min-w-0">
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
            className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 min-w-0 flex-1 ${
              dark ? "text-white" : "text-black"
            }`}
          >
            Web vitals and performance calculator
          </h1>
        </div>

        <div className="w-full p-5 sm:p-8 overflow-y-auto">
          <div className="w-full h-full flex flex-col lg:flex-row gap-8">
            <div className="w-full flex flex-col space-y-4">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col gap-1 group/field">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-4">
                    <label
                      className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 w-full sm:w-32 shrink-0 ${
                        dark
                          ? "text-zinc-400 group-focus-within/field:text-white"
                          : "text-neutral-500 group-focus-within/field:text-black"
                      }`}
                    >
                      HTML:
                    </label>
                    <input
                      type="number"
                      name="html_size"
                      min="0"
                      value={inputData.html_size || ""}
                      onChange={handleInput}
                      placeholder="0 KB"
                      className={`w-full h-12 px-4 py-2 rounded-2xl border text-sm outline-none transition-all duration-300 ${
                        inputDataErros.html_size ? "border-red-500" : ""
                      } ${
                        dark
                          ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                          : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                      }`}
                    />
                  </div>
                  {inputDataErros.html_size && (
                    <span className="text-red-500 text-xs font-semibold pl-1 sm:ml-36">
                      {inputDataErros.html_size}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 group/field">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-4">
                    <label
                      className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 w-full sm:w-32 shrink-0 ${
                        dark
                          ? "text-zinc-400 group-focus-within/field:text-white"
                          : "text-neutral-500 group-focus-within/field:text-black"
                      }`}
                    >
                      CSS size:
                    </label>
                    <input
                      type="number"
                      name="css_size"
                      min="0"
                      value={inputData.css_size || ""}
                      onChange={handleInput}
                      placeholder="0 KB"
                      className={`w-full h-12 px-4 py-2 rounded-2xl border text-sm outline-none transition-all duration-300 ${
                        inputDataErros.css_size ? "border-red-500" : ""
                      } ${
                        dark
                          ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                          : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                      }`}
                    />
                  </div>
                  {inputDataErros.css_size && (
                    <span className="text-red-500 text-xs font-semibold pl-1 sm:ml-36">
                      {inputDataErros.css_size}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 group/field">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-4">
                    <label
                      className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 w-full sm:w-32 shrink-0 ${
                        dark
                          ? "text-zinc-400 group-focus-within/field:text-white"
                          : "text-neutral-500 group-focus-within/field:text-black"
                      }`}
                    >
                      JavaScript:
                    </label>
                    <div className="flex w-full gap-2 items-stretch">
                      <select
                        name="jav_type"
                        value={inputData.jav_type}
                        onChange={handleInput}
                        className={`w-24 px-3 py-2 rounded-2xl border text-sm outline-none cursor-pointer transition-all duration-300 shrink-0 ${
                          dark
                            ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-1 focus:ring-white"
                            : "bg-neutral-50 border-neutral-300 text-black focus:border-black focus:ring-1 focus:ring-black"
                        }`}
                      >
                        <option
                          value="zip"
                          className={dark ? "bg-zinc-950" : "bg-white"}
                        >
                          .zip
                        </option>
                        <option
                          value="gzip"
                          className={dark ? "bg-zinc-950" : "bg-white"}
                        >
                          .gzip
                        </option>
                      </select>
                      <input
                        type="number"
                        name="jav_size"
                        min="0"
                        value={inputData.jav_size || ""}
                        onChange={handleInput}
                        placeholder="0 KB"
                        className={`flex-1 h-12 px-4 py-2 rounded-2xl border text-sm outline-none transition-all duration-300 ${
                          inputDataErros.jav_size ? "border-red-500" : ""
                        } ${
                          dark
                            ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                            : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                        }`}
                      />
                    </div>
                  </div>
                  {inputDataErros.jav_size && (
                    <span className="text-red-500 text-xs font-semibold pl-1 sm:ml-36">
                      {inputDataErros.jav_size}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 group/field">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-4">
                    <label
                      className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 w-full sm:w-32 shrink-0 ${
                        dark
                          ? "text-zinc-400 group-focus-within/field:text-white"
                          : "text-neutral-500 group-focus-within/field:text-black"
                      }`}
                    >
                      Images size:
                    </label>
                    <input
                      type="number"
                      name="images_size"
                      min="0"
                      value={inputData.images_size || ""}
                      onChange={handleInput}
                      placeholder="0 KB"
                      className={`w-full h-12 px-4 py-2 rounded-2xl border text-sm outline-none transition-all duration-300 ${
                        inputDataErros.images_size ? "border-red-500" : ""
                      } ${
                        dark
                          ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                          : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                      }`}
                    />
                  </div>
                  {inputDataErros.images_size && (
                    <span className="text-red-500 text-xs font-semibold pl-1 sm:ml-36">
                      {inputDataErros.images_size}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 group/field">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-4">
                    <label
                      className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 w-full sm:w-32 shrink-0 ${
                        dark
                          ? "text-zinc-400 group-focus-within/field:text-white"
                          : "text-neutral-500 group-focus-within/field:text-black"
                      }`}
                    >
                      Fonts size:
                    </label>
                    <input
                      type="number"
                      name="fonts_size"
                      min="0"
                      value={inputData.fonts_size || ""}
                      onChange={handleInput}
                      placeholder="0 KB"
                      className={`w-full h-12 px-4 py-2 rounded-2xl border text-sm outline-none transition-all duration-300 ${
                        inputDataErros.fonts_size ? "border-red-500" : ""
                      } ${
                        dark
                          ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                          : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                      }`}
                    />
                  </div>
                  {inputDataErros.fonts_size && (
                    <span className="text-red-500 text-xs font-semibold pl-1 sm:ml-36">
                      {inputDataErros.fonts_size}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 group/field">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-4">
                    <label
                      className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 w-full sm:w-32 shrink-0 ${
                        dark
                          ? "text-zinc-400 group-focus-within/field:text-white"
                          : "text-neutral-500 group-focus-within/field:text-black"
                      }`}
                    >
                      Others:
                    </label>
                    <input
                      type="number"
                      name="others_size"
                      min="0"
                      value={inputData.others_size || ""}
                      onChange={handleInput}
                      placeholder="0 KB"
                      className={`w-full h-12 px-4 py-2 rounded-2xl border text-sm outline-none transition-all duration-300 ${
                        inputDataErros.others_size ? "border-red-500" : ""
                      } ${
                        dark
                          ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                          : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                      }`}
                    />
                  </div>
                  {inputDataErros.others_size && (
                    <span className="text-red-500 text-xs font-semibold pl-1 sm:ml-36">
                      {inputDataErros.others_size}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 group/field">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-4">
                    <label
                      className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 w-full sm:w-32 shrink-0 ${
                        dark
                          ? "text-zinc-400 group-focus-within/field:text-white"
                          : "text-neutral-500 group-focus-within/field:text-black"
                      }`}
                    >
                      Target budget:
                    </label>
                    <input
                      type="number"
                      name="target_budget"
                      min="0"
                      value={inputData.target_budget || ""}
                      onChange={handleInput}
                      placeholder="500 KB"
                      className={`w-full h-12 px-4 py-2 rounded-2xl border text-sm outline-none transition-all duration-300 ${
                        inputDataErros.target_budget ? "border-red-500" : ""
                      } ${
                        dark
                          ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                          : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                      }`}
                    />
                  </div>
                  {inputDataErros.target_budget && (
                    <span className="text-red-500 text-xs font-semibold pl-1 sm:ml-36">
                      {inputDataErros.target_budget}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 group/field">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                    dark
                      ? "text-zinc-400 group-focus-within/field:text-white"
                      : "text-neutral-500 group-focus-within/field:text-black"
                  }`}
                >
                  Connection Speed Preset
                </label>
                <select
                  name="connection_preset"
                  value={inputData.connection_preset}
                  onChange={handleInput}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none cursor-pointer transition-all duration-300 ${
                    dark
                      ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-1 focus:ring-white"
                      : "bg-neutral-50 border-neutral-300 text-black focus:border-black focus:ring-1 focus:ring-black"
                  }`}
                >
                  <option value="dialup">Dial-up (56 Kbps)</option>
                  <option value="slow3g">
                    Slow 3G (Latency: 400ms, 400 Kbps)
                  </option>
                  <option value="fast3g">
                    Fast 3G (Latency: 150ms, 1.6 Mbps)
                  </option>
                  <option value="fourg">4G LTE (Latency: 50ms, 15 Mbps)</option>
                  <option value="fiber">
                    Broadband Fiber (Latency: 10ms, 100 Mbps)
                  </option>
                </select>
              </div>

              <button
                onClick={calculatePerformance}
                className={`w-full mt-4 py-3 rounded-2xl font-bold transition-all duration-300 ${
                  dark
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "bg-black text-white hover:bg-neutral-800"
                }`}
              >
                Calculate performance
              </button>
            </div>

            <div className="w-full lg:w-[400px] xl:w-[500px] shrink-0 flex flex-col space-y-6">
              <div className="flex items-center h-8">
                <label
                  className={`text-xs font-black uppercase tracking-widest ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  Estimated Performance Readout
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                <div
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 min-h-[110px] ${
                    dark
                      ? "border-zinc-800 bg-zinc-900/30"
                      : "border-neutral-200 bg-neutral-50"
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${dark ? "text-zinc-500" : "text-neutral-400"}`}
                  >
                    Est. FCP
                  </span>
                  <span className="text-2xl font-black mt-2 font-mono whitespace-nowrap">
                    {metrics.fcpTime}s
                  </span>
                  <span
                    className={`text-[10px] mt-1 ${dark ? "text-zinc-600" : "text-neutral-400"}`}
                  >
                    First Contentful Paint
                  </span>
                </div>

                <div
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 min-h-[110px] ${
                    dark
                      ? "border-zinc-800 bg-zinc-900/30"
                      : "border-neutral-200 bg-neutral-50"
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${dark ? "text-zinc-500" : "text-neutral-400"}`}
                  >
                    Est. TTI
                  </span>
                  <span className="text-2xl font-black mt-2 font-mono whitespace-nowrap">
                    {metrics.ttiTime}s
                  </span>
                  <span
                    className={`text-[10px] mt-1 ${dark ? "text-zinc-600" : "text-neutral-400"}`}
                  >
                    Time to Interactive
                  </span>
                </div>

                <div
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 min-h-[110px] ${
                    metrics.isOverBudget
                      ? "border-red-500/50 bg-red-500/10 text-red-500"
                      : dark
                        ? "border-zinc-800 bg-zinc-900/30"
                        : "border-neutral-200 bg-neutral-50"
                  }`}
                >
                  <span className="text-xs font-bold opacity-80">
                    Page Weight
                  </span>
                  <span className="text-2xl font-black mt-2 font-mono whitespace-nowrap">
                    {metrics.totalWeight} KB
                  </span>
                  <span className="text-[10px] opacity-70 mt-1">
                    {metrics.isOverBudget
                      ? "⚠️ Budget breached!"
                      : `Target: ${inputData.target_budget || 500} KB`}
                  </span>
                </div>
              </div>

              {metrics.jsWarning && (
                <div className="p-3 text-xs font-medium rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-500 transition-all duration-300">
                  ⚠️ JavaScript bundle structure exceeds 150KB. This may
                  negatively impact mobile SEO performance.
                </div>
              )}

              <div
                className={`p-5 border rounded-2xl flex flex-col space-y-4 transition-all duration-300 ${
                  dark
                    ? "border-zinc-800 bg-zinc-900/10"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <span
                  className={`text-xs font-black uppercase tracking-wider ${dark ? "text-zinc-400" : "text-neutral-500"}`}
                >
                  Byte Distribution
                </span>

                <div className="w-full h-4 bg-neutral-200 dark:bg-zinc-800 rounded-full flex overflow-hidden">
                  <div
                    style={{
                      width: `${(Number(inputData.html_size || 0) / (metrics.totalWeight || 1)) * 100}%`,
                    }}
                    className="bg-orange-500 transition-all duration-500"
                    title="HTML"
                  />
                  <div
                    style={{
                      width: `${(Number(inputData.css_size || 0) / (metrics.totalWeight || 1)) * 100}%`,
                    }}
                    className="bg-blue-500 transition-all duration-500"
                    title="CSS"
                  />
                  <div
                    style={{
                      width: `${(Number(inputData.jav_size || 0) / (metrics.totalWeight || 1)) * 100}%`,
                    }}
                    className="bg-yellow-500 transition-all duration-500"
                    title="JavaScript"
                  />
                  <div
                    style={{
                      width: `${(Number(inputData.images_size || 0) / (metrics.totalWeight || 1)) * 100}%`,
                    }}
                    className="bg-green-500 transition-all duration-500"
                    title="Images"
                  />
                  <div
                    style={{
                      width: `${(Number(inputData.fonts_size || 0) / (metrics.totalWeight || 1)) * 100}%`,
                    }}
                    className="bg-purple-500 transition-all duration-500"
                    title="Fonts"
                  />
                  <div
                    style={{
                      width: `${(Number(inputData.others_size || 0) / (metrics.totalWeight || 1)) * 100}%`,
                    }}
                    className="bg-pink-500 transition-all duration-500"
                    title="Others"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 text-[11px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-orange-500" />{" "}
                    <span
                      className={dark ? "text-zinc-400" : "text-neutral-600"}
                    >
                      HTML ({inputData.html_size || 0} KB)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />{" "}
                    <span
                      className={dark ? "text-zinc-400" : "text-neutral-600"}
                    >
                      CSS ({inputData.css_size || 0} KB)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500" />{" "}
                    <span
                      className={dark ? "text-zinc-400" : "text-neutral-600"}
                    >
                      JS ({inputData.jav_size || 0} KB)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-green-500" />{" "}
                    <span
                      className={dark ? "text-zinc-400" : "text-neutral-600"}
                    >
                      Images ({inputData.images_size || 0} KB)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />{" "}
                    <span
                      className={dark ? "text-zinc-400" : "text-neutral-600"}
                    >
                      Fonts ({inputData.fonts_size || 0} KB)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-pink-500" />{" "}
                    <span
                      className={dark ? "text-zinc-400" : "text-neutral-600"}
                    >
                      Others ({inputData.others_size || 0} KB)
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div
                  className={`flex flex-col items-center justify-center p-6 border border-dashed rounded-2xl transition-all duration-300 ${
                    dark
                      ? "border-zinc-800 bg-zinc-950/20"
                      : "border-neutral-300 bg-neutral-50/50"
                  }`}
                >
                  <span
                    className={`text-xs font-black uppercase tracking-wider mb-4 ${dark ? "text-zinc-500" : "text-neutral-400"}`}
                  >
                    Budget Usage
                  </span>
                  <div className="relative w-32 h-32">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <path
                        className={`${dark ? "stroke-zinc-800" : "stroke-neutral-200"}`}
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`transition-all duration-500 ease-out ${
                          metrics.isOverBudget
                            ? "stroke-red-500"
                            : dark
                              ? "stroke-white"
                              : "stroke-black"
                        }`}
                        strokeWidth="3"
                        strokeDasharray={`${metrics.budgetPercentage}, 100`}
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-black font-mono">
                        {metrics.isOverBudget
                          ? "OVER"
                          : `${metrics.budgetPercentage}%`}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-5 border rounded-2xl flex flex-col justify-between space-y-3 transition-all duration-300 ${
                    dark
                      ? "border-zinc-800 bg-zinc-900/10"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${dark ? "text-zinc-400" : "text-neutral-500"}`}
                  >
                    Export Config & Report
                  </span>
                  <p
                    className={`text-[11px] leading-relaxed ${dark ? "text-zinc-500" : "text-neutral-400"}`}
                  >
                    Save your performance setup or copy a cleanly formatted
                    markdown summary table directly to your clipboard.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => {
                        const dataStr =
                          "data:text/json;charset=utf-8," +
                          encodeURIComponent(
                            JSON.stringify({ inputData, metrics }, null, 2),
                          );
                        const downloadAnchor = document.createElement("a");
                        downloadAnchor.setAttribute("href", dataStr);
                        downloadAnchor.setAttribute(
                          "download",
                          "performance-budget-config.json",
                        );
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        downloadAnchor.remove();
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 border text-center ${
                        dark
                          ? "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"
                          : "bg-white border-neutral-200 text-black hover:bg-neutral-50"
                      }`}
                    >
                      📥 Download JSON
                    </button>

                    <button
                      onClick={() => {
                        const markdownTable = `| Resource | Size (KB) |\n| :--- | :--- |\n| HTML | ${inputData.html_size || 0} KB |\n| CSS | ${inputData.css_size || 0} KB |\n| JavaScript | ${inputData.jav_size || 0} KB (${inputData.jav_type || "zip"}) |\n| Images | ${inputData.images_size || 0} KB |\n| Fonts | ${inputData.fonts_size || 0} KB |\n| Others | ${inputData.others_size || 0} KB |\n| **Total Weight** | **${metrics.totalWeight} KB** |\n| **Target Budget** | **${inputData.target_budget || 500} KB** |\n\n*Generated via Dev Tasks Performance Tool*`;
                        navigator.clipboard.writeText(markdownTable);
                        alert("Markdown report copied to clipboard!");
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 text-center ${
                        dark
                          ? "bg-white text-black hover:bg-zinc-200"
                          : "bg-black text-white hover:bg-neutral-800"
                      }`}
                    >
                      📋 Copy Markdown
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceBudgetCalculator;
