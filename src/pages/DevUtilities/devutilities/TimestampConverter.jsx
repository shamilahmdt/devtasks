import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

const TimestampConverter = () => {
  const { dark } = useTheme();
  const [timestamp, setTimestamp] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [convertedDate, setConvertedDate] = useState("");
  const [convertedTimestamp, setConvertedTimestamp] = useState("");

  const handleTimestampConvert = () => {
    if (!timestamp) return;
    let ts = Number(timestamp);
    if (timestamp.length === 10) ts *= 1000;
    const date = new Date(ts);
    if (isNaN(date.getTime())) {
      setConvertedDate("Invalid Timestamp");
      return;
    }
    setConvertedDate(date.toString());
  };

  const handleDateConvert = () => {
    if (!dateInput) return;
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      setConvertedTimestamp("Invalid Date");
      return;
    }
    setConvertedTimestamp(Math.floor(date.getTime() / 1000));
  };

  const currentUnix = Math.floor(Date.now() / 1000);

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85",
      input:
        "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none",
      button: "bg-zinc-900 text-white hover:bg-zinc-700 transition-colors",
      result: "bg-zinc-50 border-zinc-200 text-zinc-700",
      backLink: "text-zinc-500 hover:text-zinc-900 transition-colors",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-500",
      card: "bg-zinc-900/50 border-zinc-800/85",
      input:
        "bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none",
      button: "bg-white text-zinc-900 hover:bg-zinc-200 transition-colors",
      result: "bg-zinc-900 border-zinc-700 text-zinc-300",
      backLink: "text-zinc-500 hover:text-zinc-100 transition-colors",
    },
  };

  const t = dark ? theme.dark : theme.light;

  return (
    <div className={`min-h-screen ${t.wrapper} px-6 py-10`}>
      <title>Timestamp Converter — Dev Utilities</title>
      <meta
        name="description"
        content="Convert Unix/Epoch timestamps into readable dates and vice versa."
      />

      <div className="max-w-2xl mx-auto">
        <Link
          to="/devutilities"
          className={`inline-flex items-center gap-1.5 text-sm mb-8 ${t.backLink}`}
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
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Workspace
        </Link>

        <div className="mb-8">
          <h1
            className={`text-2xl font-semibold tracking-tight ${t.heading}`}
          >
            Timestamp Converter
          </h1>
          <p className={`mt-1 text-sm ${t.subtext}`}>
            Convert Unix/Epoch timestamps into readable dates and vice versa.
          </p>
        </div>

        <div className="space-y-5">
          {/* Current Unix Timestamp */}
          <div className={`rounded-3xl border ${t.card} p-6`}>
            <p
              className={`text-xs uppercase tracking-widest font-medium mb-3 ${t.subtext}`}
            >
              Current Unix Timestamp
            </p>
            <p className={`text-3xl font-semibold tabular-nums ${t.heading}`}>
              {currentUnix}
            </p>
          </div>

          {/* Unix Timestamp → Date */}
          <div className={`rounded-3xl border ${t.card} p-6`}>
            <p
              className={`text-xs uppercase tracking-widest font-medium mb-5 ${t.subtext}`}
            >
              Unix Timestamp → Date
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter timestamp…"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm ${t.input}`}
              />
              <button
                onClick={handleTimestampConvert}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer ${t.button}`}
              >
                Convert to Date
              </button>
              {convertedDate && (
                <div
                  className={`px-4 py-3 rounded-xl border text-sm font-mono break-all ${t.result}`}
                >
                  {convertedDate}
                </div>
              )}
            </div>
          </div>

          {/* Date → Unix Timestamp */}
          <div className={`rounded-3xl border ${t.card} p-6`}>
            <p
              className={`text-xs uppercase tracking-widest font-medium mb-5 ${t.subtext}`}
            >
              Date → Unix Timestamp
            </p>
            <div className="space-y-3">
              <input
                type="datetime-local"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm ${t.input}`}
              />
              <button
                onClick={handleDateConvert}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer ${t.button}`}
              >
                Convert to Timestamp
              </button>
              {convertedTimestamp && (
                <div
                  className={`px-4 py-3 rounded-xl border text-sm font-mono tabular-nums ${t.result}`}
                >
                  {convertedTimestamp}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimestampConverter;
