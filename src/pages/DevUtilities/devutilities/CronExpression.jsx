import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const CRON_TABS = [
  { key: "minute", label: "Minute" },
  { key: "hour", label: "Hour" },
  { key: "day", label: "Day" },
  { key: "month", label: "Month" },
  { key: "dayOfWeek", label: "Day of Week" },
];

const SAMPLE_SCHEDULES = [
  { label: "Every Minute", expression: "* * * * *" },
  { label: "Every 5 Minutes", expression: "*/5 * * * *" },
  { label: "Every 15 Minutes", expression: "*/15 * * * *" },
  { label: "Every Hour", expression: "0 * * * *" },
  { label: "Every 6 Hours", expression: "0 */6 * * *" },
  { label: "Daily at Midnight", expression: "0 0 * * *" },
  { label: "Daily at 9 AM", expression: "0 9 * * *" },
  { label: "Every Weekday Morning", expression: "0 8 * * 1-5" },
  { label: "Every Monday", expression: "0 0 * * 1" },
  { label: "First Day of Month", expression: "0 0 1 * *" },
  { label: "Every Sunday", expression: "0 0 * * 0" },
  { label: "Bi-Weekly (Every 2 Weeks)", expression: "0 0 * * 0/2" },
];

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

// ─── Cron Parsing & Validation ────────────────────────────────────────────────

function isValidCronExpression(expression) {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return false;

  const ranges = [
    { max: 59, name: "minute" }, // 0-59
    { max: 23, name: "hour" }, // 0-23
    { max: 31, name: "day" }, // 1-31
    { max: 12, name: "month" }, // 1-12
    { max: 6, name: "dayOfWeek" }, // 0-6
  ];

  for (let i = 0; i < 5; i++) {
    const part = parts[i];
    const range = ranges[i];

    if (part === "*") continue;

    // Handle */n
    if (part.startsWith("*/")) {
      const num = parseInt(part.substring(2));
      if (isNaN(num) || num <= 0) return false;
      continue;
    }

    // Handle n-m
    if (part.includes("-")) {
      const [start, end] = part.split("-");
      const s = parseInt(start);
      const e = parseInt(end);
      if (
        isNaN(s) ||
        isNaN(e) ||
        s < 0 ||
        e > range.max ||
        s > e
      )
        return false;
      continue;
    }

    // Handle n,m,p
    if (part.includes(",")) {
      const nums = part.split(",");
      for (const num of nums) {
        const n = parseInt(num);
        if (isNaN(n) || n < 0 || n > range.max) return false;
      }
      continue;
    }

    // Handle single number
    const num = parseInt(part);
    if (isNaN(num) || num < 0 || num > range.max) return false;
  }

  return true;
}

function parseCronExpression(expression) {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return null;

  return {
    minute: parts[0],
    hour: parts[1],
    day: parts[2],
    month: parts[3],
    dayOfWeek: parts[4],
  };
}

function buildCronExpression(fields) {
  return [
    fields.minute || "*",
    fields.hour || "*",
    fields.day || "*",
    fields.month || "*",
    fields.dayOfWeek || "*",
  ].join(" ");
}

// ─── Cron Description Helper ──────────────────────────────────────────────────

function describeCron(expression) {
  if (!isValidCronExpression(expression)) {
    return "Invalid cron expression";
  }

  const parts = expression.trim().split(/\s+/);
  const [minute, hour, day, month, dayOfWeek] = parts;

  const descriptions = [];

  // Minute
  if (minute === "*") {
    descriptions.push("every minute");
  } else if (minute.startsWith("*/")) {
    const n = minute.substring(2);
    descriptions.push(`every ${n} minute${n !== "1" ? "s" : ""}`);
  } else if (!minute.includes(",") && !minute.includes("-")) {
    descriptions.push(`at minute ${minute}`);
  } else {
    descriptions.push(`at minute(s) ${minute}`);
  }

  // Hour
  if (hour === "*") {
    descriptions.push("every hour");
  } else if (hour.startsWith("*/")) {
    const n = hour.substring(2);
    descriptions.push(`every ${n} hour${n !== "1" ? "s" : ""}`);
  } else if (!hour.includes(",") && !hour.includes("-")) {
    const h = parseInt(hour);
    descriptions.push(`at ${String(h).padStart(2, "0")}:00`);
  } else {
    descriptions.push(`at hour(s) ${hour}`);
  }

  // Day of Month
  if (day === "*") {
    descriptions.push("every day");
  } else if (day !== "*" && dayOfWeek !== "*") {
    descriptions.push(`on day ${day} or ${getWeekdayNames(dayOfWeek)}`);
  } else if (day.startsWith("*/")) {
    const n = day.substring(2);
    descriptions.push(`every ${n} day${n !== "1" ? "s" : ""}`);
  } else if (!day.includes(",") && !day.includes("-")) {
    descriptions.push(`on day ${day}`);
  } else {
    descriptions.push(`on day(s) ${day}`);
  }

  // Month
  if (month !== "*") {
    if (!month.includes(",") && !month.includes("-")) {
      const m = MONTHS.find((x) => x.value === parseInt(month));
      descriptions.push(`in ${m?.label || month}`);
    } else {
      const monthNums = month.split(",").map((x) => {
        const m = MONTHS.find((y) => y.value === parseInt(x));
        return m?.label || x;
      });
      descriptions.push(`in ${monthNums.join(", ")}`);
    }
  }

  // Day of Week
  if (dayOfWeek !== "*" && day === "*") {
    descriptions.push(`on ${getWeekdayNames(dayOfWeek)}`);
  }

  return descriptions.join(", ");
}

function getWeekdayNames(dayOfWeekString) {
  if (dayOfWeekString === "*") return "every day";

  if (dayOfWeekString.includes(",")) {
    const days = dayOfWeekString.split(",").map((d) => {
      const dow = DAYS_OF_WEEK.find((x) => x.value === parseInt(d));
      return dow?.label || d;
    });
    return days.join(", ");
  }

  if (dayOfWeekString.includes("-")) {
    const [start, end] = dayOfWeekString.split("-").map(Number);
    const days = [];
    for (let i = start; i <= end; i++) {
      const dow = DAYS_OF_WEEK.find((x) => x.value === i);
      if (dow) days.push(dow.label);
    }
    return days.join(" to ");
  }

  const dow = DAYS_OF_WEEK.find((x) => x.value === parseInt(dayOfWeekString));
  return dow?.label || dayOfWeekString;
}

// ─── Next Scheduled Runs Calculation ───────────────────────────────────────────

function getNextRuns(expression, count = 5) {
  if (!isValidCronExpression(expression)) {
    return [];
  }

  const parts = expression.trim().split(/\s+/);
  const [minuteStr, hourStr, dayStr, monthStr, dayOfWeekStr] = parts;

  const runs = [];
  let current = new Date();
  current.setSeconds(0);
  current.setMilliseconds(0);

  const maxIterations = 100000;
  let iterations = 0;

  while (runs.length < count && iterations < maxIterations) {
    iterations++;
    current.setMinutes(current.getMinutes() + 1);

    if (matchesCronField(current.getMinutes(), minuteStr) &&
        matchesCronField(current.getHours(), hourStr) &&
        (matchesCronField(current.getDate(), dayStr) ||
          matchesCronField(current.getDay(), dayOfWeekStr)) &&
        matchesCronField(current.getMonth() + 1, monthStr)) {
      runs.push(new Date(current));
    }
  }

  return runs;
}

function matchesCronField(value, field) {
  if (field === "*") return true;

  // Handle */n
  if (field.startsWith("*/")) {
    const step = parseInt(field.substring(2));
    return value % step === 0;
  }

  // Handle n-m
  if (field.includes("-")) {
    const [start, end] = field.split("-").map(Number);
    return value >= start && value <= end;
  }

  // Handle n,m,p
  if (field.includes(",")) {
    const values = field.split(",").map(Number);
    return values.includes(value);
  }

  // Handle single number
  return value === parseInt(field);
}

// ─── Component ────────────────────────────────────────────────────────────────

const CronExpressionBuilder = () => {
  const { dark } = useTheme();
  const [activeTab, setActiveTab] = useState("minute");
  const [expression, setExpression] = useState("* * * * *");
  const [fields, setFields] = useState({
    minute: "*",
    hour: "*",
    day: "*",
    month: "*",
    dayOfWeek: "*",
  });

  const description = useMemo(() => describeCron(expression), [expression]);
  const nextRuns = useMemo(() => getNextRuns(expression), [expression]);

  const handleFieldChange = (fieldKey, value) => {
    const newFields = { ...fields, [fieldKey]: value };
    setFields(newFields);
    const newExpression = buildCronExpression(newFields);
    setExpression(newExpression);
  };

  const handleExpressionChange = (value) => {
    setExpression(value);
    if (isValidCronExpression(value)) {
      const parsed = parseCronExpression(value);
      if (parsed) {
        setFields(parsed);
      }
    }
  };

  const handleSample = (sampleExpression) => {
    setExpression(sampleExpression);
    const parsed = parseCronExpression(sampleExpression);
    if (parsed) {
      setFields(parsed);
    }
    toast.success("Sample schedule loaded");
  };

  const handleClear = () => {
    const defaultExpression = "* * * * *";
    setExpression(defaultExpression);
    setFields({
      minute: "*",
      hour: "*",
      day: "*",
      month: "*",
      dayOfWeek: "*",
    });
    toast.success("Cleared to default");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(expression);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-300 overflow-x-hidden ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      <title>Cron Expression Builder | DevTasks</title>
      <meta
        name="description"
        content="Build and visualize cron expressions with an interactive UI and next scheduled run times."
      />

      <div
        className={`w-full max-w-6xl md:mx-auto rounded-3xl shadow-lg p-4 sm:p-8 border transition-colors duration-300 ${
          dark ? "bg-zinc-900 border-zinc-700" : "bg-white border-neutral-100"
        }`}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-3 w-full min-w-0">
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
              Cron Expression Builder
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Left Panel - Builder */}
          <div className="flex flex-col">
            <label
              className={`text-xs font-black uppercase tracking-widest mb-4 ${
                dark ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              Interactive Builder
            </label>

            {/* Tabs */}
            <div
              className={`flex items-center gap-1 p-1 border rounded-2xl mb-6 overflow-x-auto ${
                dark
                  ? "border-zinc-700 bg-zinc-800"
                  : "border-neutral-200 bg-neutral-50"
              }`}
            >
              {CRON_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.key
                      ? dark
                        ? "bg-white text-black"
                        : "bg-black text-white"
                      : dark
                        ? "text-neutral-400 hover:text-white"
                        : "text-neutral-400 hover:text-black"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-4 flex-1">
              {activeTab === "minute" && (
                <TabContent
                  title="Minute (0-59)"
                  value={fields.minute}
                  onChange={(val) => handleFieldChange("minute", val)}
                  examples={["*", "*/5", "0", "0,15,30,45"]}
                  dark={dark}
                />
              )}
              {activeTab === "hour" && (
                <TabContent
                  title="Hour (0-23)"
                  value={fields.hour}
                  onChange={(val) => handleFieldChange("hour", val)}
                  examples={["*", "*/6", "9", "0,12"]}
                  dark={dark}
                />
              )}
              {activeTab === "day" && (
                <TabContent
                  title="Day of Month (1-31)"
                  value={fields.day}
                  onChange={(val) => handleFieldChange("day", val)}
                  examples={["*", "1", "15", "1,15"]}
                  dark={dark}
                />
              )}
              {activeTab === "month" && (
                <MonthTabContent
                  value={fields.month}
                  onChange={(val) => handleFieldChange("month", val)}
                  dark={dark}
                />
              )}
              {activeTab === "dayOfWeek" && (
                <DayOfWeekTabContent
                  value={fields.dayOfWeek}
                  onChange={(val) => handleFieldChange("dayOfWeek", val)}
                  dark={dark}
                />
              )}
            </div>

            {/* Current Expression Display */}
            <div
              className={`mt-6 p-4 rounded-xl border ${
                dark
                  ? "bg-zinc-950 border-zinc-800"
                  : "bg-neutral-50 border-neutral-200"
              }`}
            >
              <p
                className={`text-xs font-black uppercase tracking-widest mb-2 ${
                  dark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Current Expression
              </p>
              <p
                className={`font-mono text-sm ${
                  dark ? "text-zinc-300" : "text-zinc-700"
                }`}
              >
                {expression}
              </p>
            </div>
          </div>

          {/* Right Panel - Display */}
          <div className="flex flex-col">
            <label
              className={`text-xs font-black uppercase tracking-widest mb-4 ${
                dark ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              Expression & Schedule
            </label>

            {/* Expression Input */}
            <div className="mb-4">
              <label
                className={`text-xs font-black uppercase tracking-widest mb-2 block ${
                  dark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Raw Expression (Editable)
              </label>
              <input
                type="text"
                value={expression}
                onChange={(e) => handleExpressionChange(e.target.value)}
                spellCheck={false}
                className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors font-mono text-sm ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-zinc-200"
                    : "bg-neutral-50 border-neutral-200 text-zinc-800"
                } ${
                  !isValidCronExpression(expression)
                    ? dark
                      ? "border-red-900"
                      : "border-red-300"
                    : ""
                }`}
                placeholder="e.g., 0 9 * * 1-5"
              />
              {!isValidCronExpression(expression) && (
                <p className="text-xs text-red-500 mt-1">
                  Invalid cron expression
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label
                className={`text-xs font-black uppercase tracking-widest mb-2 block ${
                  dark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Description
              </label>
              <div
                className={`p-4 rounded-xl border ${
                  dark
                    ? "bg-zinc-950 border-zinc-800"
                    : "bg-neutral-50 border-neutral-200"
                }`}
              >
                <p
                  className={`text-sm leading-relaxed ${
                    dark ? "text-zinc-300" : "text-zinc-700"
                  }`}
                >
                  {description}
                </p>
              </div>
            </div>

            {/* Next Runs Table */}
            <div className="mb-4">
              <label
                className={`text-xs font-black uppercase tracking-widest mb-2 block ${
                  dark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Next 5 Scheduled Runs
              </label>
              <div
                className={`border rounded-xl overflow-hidden ${
                  dark ? "border-zinc-800" : "border-neutral-200"
                }`}
              >
                {nextRuns.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className={`border-b ${
                          dark
                            ? "bg-zinc-950 border-zinc-800"
                            : "bg-neutral-100 border-neutral-200"
                        }`}
                      >
                        <th
                          className={`px-4 py-2 text-left font-black uppercase tracking-widest text-xs ${
                            dark ? "text-zinc-400" : "text-zinc-500"
                          }`}
                        >
                          #
                        </th>
                        <th
                          className={`px-4 py-2 text-left font-black uppercase tracking-widest text-xs ${
                            dark ? "text-zinc-400" : "text-zinc-500"
                          }`}
                        >
                          Date & Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {nextRuns.map((run, idx) => (
                        <tr
                          key={idx}
                          className={`border-b last:border-0 ${
                            dark
                              ? "bg-zinc-950 border-zinc-800 hover:bg-zinc-900"
                              : "bg-white border-neutral-200 hover:bg-neutral-50"
                          }`}
                        >
                          <td
                            className={`px-4 py-2 font-bold ${
                              dark ? "text-zinc-400" : "text-zinc-500"
                            }`}
                          >
                            {idx + 1}
                          </td>
                          <td
                            className={`px-4 py-2 font-mono text-xs ${
                              dark ? "text-zinc-300" : "text-zinc-700"
                            }`}
                          >
                            {run.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div
                    className={`p-4 text-center text-sm ${
                      dark ? "text-zinc-500" : "text-zinc-400"
                    }`}
                  >
                    Invalid expression or no upcoming runs
                  </div>
                )}
              </div>
            </div>

            {/* Sample Schedules Dropdown */}
            <div className="mb-4">
              <label
                className={`text-xs font-black uppercase tracking-widest mb-2 block ${
                  dark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Quick Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_SCHEDULES.slice(0, 4).map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSample(sample.expression)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                      dark
                        ? "bg-zinc-800 border-zinc-700 text-zinc-300 border hover:text-white hover:border-zinc-500"
                        : "bg-white border-neutral-200 text-zinc-600 border hover:text-black hover:border-neutral-400"
                    }`}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
              <details
                className={`mt-2 p-2 rounded-lg border ${
                  dark
                    ? "border-zinc-800 bg-zinc-950"
                    : "border-neutral-200 bg-neutral-50"
                }`}
              >
                <summary
                  className={`text-xs font-bold uppercase cursor-pointer ${
                    dark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  More Templates
                </summary>
                <div className="flex flex-wrap gap-2 mt-3">
                  {SAMPLE_SCHEDULES.slice(4).map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSample(sample.expression)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                        dark
                          ? "bg-zinc-800 border-zinc-700 text-zinc-300 border hover:text-white hover:border-zinc-500"
                          : "bg-white border-neutral-200 text-zinc-600 border hover:text-black hover:border-neutral-400"
                      }`}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={handleCopy}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
              dark
                ? "bg-white text-black border-white hover:bg-zinc-200"
                : "bg-black text-white border-black hover:bg-zinc-800"
            }`}
          >
            Copy Expression
          </button>
          <button
            type="button"
            onClick={handleClear}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
              dark
                ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                : "bg-white border-neutral-200 text-zinc-600 hover:text-black hover:border-neutral-400"
            }`}
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Tab Content Components ───────────────────────────────────────────────────

function TabContent({ title, value, onChange, examples, dark }) {
  return (
    <div>
      <label
        className={`text-xs font-bold uppercase tracking-widest mb-2 block ${
          dark ? "text-zinc-400" : "text-zinc-500"
        }`}
      >
        {title}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors font-mono text-sm mb-3 ${
          dark
            ? "bg-zinc-950 border-zinc-800 text-zinc-200"
            : "bg-neutral-50 border-neutral-200 text-zinc-800"
        }`}
        placeholder="e.g., *, */5, 0, 0,15,30,45"
      />
      <div>
        <p
          className={`text-xs font-bold mb-2 ${
            dark ? "text-zinc-500" : "text-zinc-400"
          }`}
        >
          Quick Examples:
        </p>
        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => onChange(ex)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                dark
                  ? "bg-zinc-800 text-zinc-300 hover:text-white"
                  : "bg-neutral-200 text-zinc-600 hover:text-black"
              }`}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthTabContent({ value, onChange, dark }) {
  const selectedMonths = value === "*" ? [] : value.split(",").map(Number);
  const toggleMonth = (monthValue) => {
    const newSelected = selectedMonths.includes(monthValue)
      ? selectedMonths.filter((m) => m !== monthValue)
      : [...selectedMonths, monthValue].sort((a, b) => a - b);

    onChange(newSelected.length === 0 ? "*" : newSelected.join(","));
  };

  return (
    <div>
      <label
        className={`text-xs font-bold uppercase tracking-widest mb-3 block ${
          dark ? "text-zinc-400" : "text-zinc-500"
        }`}
      >
        Month (1-12)
      </label>
      <div className="grid grid-cols-2 gap-2">
        {MONTHS.map((month) => (
          <button
            key={month.value}
            type="button"
            onClick={() => toggleMonth(month.value)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedMonths.includes(month.value)
                ? dark
                  ? "bg-white text-black"
                  : "bg-black text-white"
                : dark
                  ? "bg-zinc-800 text-zinc-300 hover:text-white"
                  : "bg-neutral-200 text-zinc-600 hover:text-black"
            }`}
          >
            {month.label.slice(0, 3)}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors font-mono text-sm mt-3 ${
          dark
            ? "bg-zinc-950 border-zinc-800 text-zinc-200"
            : "bg-neutral-50 border-neutral-200 text-zinc-800"
        }`}
        placeholder="*, 1, 1-6, 1,4,7,10"
      />
    </div>
  );
}

function DayOfWeekTabContent({ value, onChange, dark }) {
  const selectedDays = value === "*" ? [] : value.split(",").map(Number);
  const toggleDay = (dayValue) => {
    const newSelected = selectedDays.includes(dayValue)
      ? selectedDays.filter((d) => d !== dayValue)
      : [...selectedDays, dayValue].sort((a, b) => a - b);

    onChange(newSelected.length === 0 ? "*" : newSelected.join(","));
  };

  return (
    <div>
      <label
        className={`text-xs font-bold uppercase tracking-widest mb-3 block ${
          dark ? "text-zinc-400" : "text-zinc-500"
        }`}
      >
        Day of Week (0-6, 0=Sunday)
      </label>
      <div className="grid grid-cols-2 gap-2">
        {DAYS_OF_WEEK.map((day) => (
          <button
            key={day.value}
            type="button"
            onClick={() => toggleDay(day.value)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedDays.includes(day.value)
                ? dark
                  ? "bg-white text-black"
                  : "bg-black text-white"
                : dark
                  ? "bg-zinc-800 text-zinc-300 hover:text-white"
                  : "bg-neutral-200 text-zinc-600 hover:text-black"
            }`}
          >
            {day.label.slice(0, 3)}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors font-mono text-sm mt-3 ${
          dark
            ? "bg-zinc-950 border-zinc-800 text-zinc-200"
            : "bg-neutral-50 border-neutral-200 text-zinc-800"
        }`}
        placeholder="*, 1-5, 1,3,5"
      />
    </div>
  );
}

export default CronExpressionBuilder;