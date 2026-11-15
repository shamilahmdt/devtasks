import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

function calculateAge(dateText) {
  const [year, month, day] = dateText.split("-").map(Number);
  let birthDate = new Date(year, month - 1, day);
  let currentDate = new Date();
  let years = currentDate.getFullYear() - birthDate.getFullYear();
  let months = currentDate.getMonth() - birthDate.getMonth();
  let days = currentDate.getDate() - birthDate.getDate();

  if (months < 0 || (months === 0 && days < 0)) {
    years--;
    months += 12;
  }

  if (days < 0) {
    const lastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0,
    );
    days += lastMonth.getDate();
    months--;
  }

  const age = { years, months, days };
  return age;
}

export default function DateCalculator() {
  const { dark } = useTheme();
  const [selectedDate, setSelectedDate] = useState("");
  const today = new Date().toLocaleDateString("en-CA");
  const age =
    selectedDate && selectedDate <= today ? calculateAge(selectedDate) : null;

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const t = dark
    ? {
        wrapper: "bg-[#090A0F] text-zinc-100",
        heading: "text-zinc-100",
        subtext: "text-zinc-500",
        card: "bg-zinc-900/50 border-zinc-800/85",
        input:
          "bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-zinc-500 focus:outline-none [color-scheme:dark]",
        backLink:
          "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600",
      }
    : {
        wrapper: "bg-[#F8F9FA] text-zinc-900",
        heading: "text-zinc-900",
        subtext: "text-zinc-500",
        card: "bg-white border-zinc-200/85",
        input:
          "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400 focus:outline-none",
        backLink:
          "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350",
      };

  return (
    <div className={`min-h-screen ${t.wrapper} px-6 py-10`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${t.backLink}`}
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
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${t.heading}`}>
              Date Calculator
            </h1>
            <p className={`mt-1 text-sm ${t.subtext}`}>
              Calculates the selected date.
            </p>
          </div>
        </div>

        <div className={`rounded-3xl border ${t.card} p-6 space-y-5`}>
          <input
            type="date"
            max={today}
            onChange={handleDateChange}
            className={`w-full px-4 py-3 rounded-xl border text-sm ${t.input}`}
          />
          {age && (
            <p className={`text-3xl font-semibold tabular-nums ${t.heading}`}>
              {age.years} years, {age.months} months, {age.days} days
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
