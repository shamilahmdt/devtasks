import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const SAMPLE_SCHEDULES = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every 5 minutes", cron: "*/5 * * * *" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Daily at midnight", cron: "0 0 * * *" },
  { label: "Daily at 9 AM", cron: "0 9 * * *" },
  { label: "Every Monday at 9 AM", cron: "0 9 * * 1" },
  { label: "Weekdays at 9 AM", cron: "0 9 * * 1-5" },
  { label: "First of month", cron: "0 0 1 * *" },
];

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Parse cron to human-readable description
const describeCron = (cronStr) => {
  const parts = cronStr.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid cron expression (expected 5 fields)";
  
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  
  let desc = "Runs ";
  
  // Minute
  if (minute === "*") desc += "every minute";
  else if (minute.startsWith("*/")) desc += `every ${minute.slice(2)} minutes`;
  else if (minute === "0") desc += "at minute 0";
  else desc += `at minute ${minute}`;
  
  // Hour  
  if (hour === "*") desc += " of every hour";
  else if (hour.startsWith("*/")) desc += `, every ${hour.slice(2)} hours`;
  else if (hour !== "*") desc += `, at ${hour}:00`;
  
  // Day of month
  if (dayOfMonth !== "*") {
    if (dayOfMonth.startsWith("*/")) desc += `, every ${dayOfMonth.slice(2)} days`;
    else desc += `, on day ${dayOfMonth}`;
  }
  
  // Month
  if (month !== "*") {
    if (month.includes("-")) {
      const [start, end] = month.split("-").map(Number);
      desc += `, ${MONTHS[start - 1]} through ${MONTHS[end - 1]}`;
    } else if (month.includes(",")) {
      const monthNames = month.split(",").map(m => MONTHS[parseInt(m) - 1]).join(", ");
      desc += `, in ${monthNames}`;
    } else {
      desc += `, in ${MONTHS[parseInt(month) - 1]}`;
    }
  }
  
  // Day of week
  if (dayOfWeek !== "*") {
    if (dayOfWeek === "1-5") desc += ", Monday through Friday";
    else if (dayOfWeek === "0,6") desc += ", on weekends";
    else if (dayOfWeek.includes("-")) {
      const [start, end] = dayOfWeek.split("-").map(Number);
      desc += `, ${DAYS_OF_WEEK[start]} through ${DAYS_OF_WEEK[end]}`;
    } else if (dayOfWeek.includes(",")) {
      const dayNames = dayOfWeek.split(",").map(d => DAYS_OF_WEEK[parseInt(d)]).join(", ");
      desc += `, on ${dayNames}`;
    } else {
      desc += `, on ${DAYS_OF_WEEK[parseInt(dayOfWeek)]}`;
    }
  }
  
  return desc;
};

// Calculate next N runs
const getNextRuns = (cronStr, count = 5) => {
  const parts = cronStr.trim().split(/\s+/);
  if (parts.length !== 5) return [];
  
  const [minuteExpr, hourExpr, dayOfMonthExpr, monthExpr, dayOfWeekExpr] = parts;
  const runs = [];
  let current = new Date();
  current.setSeconds(0);
  current.setMilliseconds(0);
  
  const matchesField = (value, expr, max) => {
    if (expr === "*") return true;
    if (expr.startsWith("*/")) {
      const step = parseInt(expr.slice(2));
      return value % step === 0;
    }
    if (expr.includes("-")) {
      const [start, end] = expr.split("-").map(Number);
      return value >= start && value <= end;
    }
    if (expr.includes(",")) {
      return expr.split(",").map(Number).includes(value);
    }
    return parseInt(expr) === value;
  };
  
  for (let i = 0; i < 10000 && runs.length < count; i++) {
    current = new Date(current.getTime() + 60000);
    
    const minute = current.getMinutes();
    const hour = current.getHours();
    const dayOfMonth = current.getDate();
    const month = current.getMonth() + 1;
    const dayOfWeek = current.getDay();
    
    if (
      matchesField(minute, minuteExpr) &&
      matchesField(hour, hourExpr) &&
      matchesField(dayOfMonth, dayOfMonthExpr) &&
      matchesField(month, monthExpr) &&
      matchesField(dayOfWeek, dayOfWeekExpr)
    ) {
      runs.push(new Date(current));
    }
  }
  
  return runs;
};

const CronExpressionBuilder = () => {
  const { dark } = useTheme();
  const [cronExpression, setCronExpression] = useState("* * * * *");
  const [description, setDescription] = useState("");
  const [nextRuns, setNextRuns] = useState([]);
  
  // Builder state
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");
  
  // Update cron from builder fields
  useEffect(() => {
    const newCron = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
    setCronExpression(newCron);
    setDescription(describeCron(newCron));
    setNextRuns(getNextRuns(newCron, 5));
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);
  
  // Parse cron string back to fields
  const parseCronInput = (cron) => {
    const parts = cron.trim().split(/\s+/);
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDayOfMonth(parts[2]);
      setMonth(parts[3]);
      setDayOfWeek(parts[4]);
    }
  };
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cronExpression);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };
  
  const handleClear = () => {
    setMinute("*");
    setHour("*");
    setDayOfMonth("*");
    setMonth("*");
    setDayOfWeek("*");
  };
  
  const handleSample = (cron) => {
    parseCronInput(cron);
  };
  
  const inputClass = `w-full p-3 rounded-lg border ${
    dark
      ? "bg-neutral-800 border-neutral-700 text-white"
      : "bg-white border-gray-300 text-gray-900"
  } focus:outline-none focus:ring-2 focus:ring-blue-500`;
  
  const selectClass = `p-2 rounded-lg border ${
    dark
      ? "bg-neutral-800 border-neutral-700 text-white"
      : "bg-white border-gray-300 text-gray-900"
  } focus:outline-none focus:ring-2 focus:ring-blue-500`;
  
  return (
    <div className={`min-h-screen p-6 ${dark ? "bg-neutral-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/devutilities"
            className={`p-2 rounded-lg ${dark ? "hover:bg-neutral-800" : "hover:bg-gray-200"}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">Cron Expression Builder</h1>
        </div>
        
        {/* Sample Schedules */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2 opacity-70">Quick Templates</h3>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SCHEDULES.map((s) => (
              <button
                key={s.cron}
                onClick={() => handleSample(s.cron)}
                className={`px-3 py-1 text-sm rounded-full ${
                  dark
                    ? "bg-neutral-800 hover:bg-neutral-700"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Builder Panel */}
          <div className={`p-6 rounded-xl ${dark ? "bg-neutral-800" : "bg-white shadow-lg"}`}>
            <h2 className="text-lg font-semibold mb-4">Expression Builder</h2>
            
            <div className="space-y-4">
              {/* Minute */}
              <div>
                <label className="block text-sm font-medium mb-1">Minute</label>
                <input
                  type="text"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  placeholder="* or 0-59 or */5"
                  className={inputClass}
                />
                <p className="text-xs opacity-60 mt-1">Examples: * (every), 0 (at :00), */5 (every 5 min), 0,30 (at :00 and :30)</p>
              </div>
              
              {/* Hour */}
              <div>
                <label className="block text-sm font-medium mb-1">Hour</label>
                <input
                  type="text"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  placeholder="* or 0-23"
                  className={inputClass}
                />
                <p className="text-xs opacity-60 mt-1">Examples: * (every), 9 (at 9 AM), 9-17 (9 AM - 5 PM)</p>
              </div>
              
              {/* Day of Month */}
              <div>
                <label className="block text-sm font-medium mb-1">Day of Month</label>
                <input
                  type="text"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  placeholder="* or 1-31"
                  className={inputClass}
                />
                <p className="text-xs opacity-60 mt-1">Examples: * (every), 1 (1st), 15 (15th)</p>
              </div>
              
              {/* Month */}
              <div>
                <label className="block text-sm font-medium mb-1">Month</label>
                <input
                  type="text"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="* or 1-12"
                  className={inputClass}
                />
                <p className="text-xs opacity-60 mt-1">Examples: * (every), 1 (Jan), 6-8 (Jun-Aug)</p>
              </div>
              
              {/* Day of Week */}
              <div>
                <label className="block text-sm font-medium mb-1">Day of Week</label>
                <input
                  type="text"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  placeholder="* or 0-6 (Sun=0)"
                  className={inputClass}
                />
                <p className="text-xs opacity-60 mt-1">Examples: * (every), 1-5 (Mon-Fri), 0,6 (weekends)</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Copy
              </button>
              <button
                onClick={handleClear}
                className={`px-4 py-2 rounded-lg ${
                  dark ? "bg-neutral-700 hover:bg-neutral-600" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Clear
              </button>
            </div>
          </div>
          
          {/* Output Panel */}
          <div className={`p-6 rounded-xl ${dark ? "bg-neutral-800" : "bg-white shadow-lg"}`}>
            <h2 className="text-lg font-semibold mb-4">Expression & Schedule</h2>
            
            {/* Cron Expression Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Cron Expression</label>
              <input
                type="text"
                value={cronExpression}
                onChange={(e) => {
                  setCronExpression(e.target.value);
                  parseCronInput(e.target.value);
                }}
                className={`${inputClass} font-mono text-lg`}
              />
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Description</label>
              <div className={`p-4 rounded-lg ${dark ? "bg-neutral-700" : "bg-blue-50"}`}>
                <p className="text-lg">{description}</p>
              </div>
            </div>
            
            {/* Next Runs */}
            <div>
              <label className="block text-sm font-medium mb-2">Next 5 Scheduled Runs</label>
              <div className={`rounded-lg overflow-hidden ${dark ? "bg-neutral-700" : "bg-gray-100"}`}>
                {nextRuns.length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {nextRuns.map((run, i) => (
                        <tr key={i} className={i % 2 === 0 ? "" : dark ? "bg-neutral-600" : "bg-gray-200"}>
                          <td className="px-4 py-2 font-mono">{i + 1}</td>
                          <td className="px-4 py-2">
                            {run.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </td>
                          <td className="px-4 py-2 font-mono">
                            {run.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="p-4 text-center opacity-60">Unable to calculate next runs</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Cron Reference */}
        <div className={`mt-6 p-6 rounded-xl ${dark ? "bg-neutral-800" : "bg-white shadow-lg"}`}>
          <h2 className="text-lg font-semibold mb-3">Cron Expression Reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={dark ? "border-b border-neutral-700" : "border-b border-gray-200"}>
                  <th className="text-left py-2 px-3">Field</th>
                  <th className="text-left py-2 px-3">Allowed Values</th>
                  <th className="text-left py-2 px-3">Special Characters</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr><td className="py-2 px-3">Minute</td><td className="py-2 px-3">0-59</td><td className="py-2 px-3">* , - /</td></tr>
                <tr><td className="py-2 px-3">Hour</td><td className="py-2 px-3">0-23</td><td className="py-2 px-3">* , - /</td></tr>
                <tr><td className="py-2 px-3">Day of Month</td><td className="py-2 px-3">1-31</td><td className="py-2 px-3">* , - /</td></tr>
                <tr><td className="py-2 px-3">Month</td><td className="py-2 px-3">1-12</td><td className="py-2 px-3">* , - /</td></tr>
                <tr><td className="py-2 px-3">Day of Week</td><td className="py-2 px-3">0-6 (Sun=0)</td><td className="py-2 px-3">* , - /</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CronExpressionBuilder;
