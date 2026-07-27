import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

const COMMON_TIMEZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Moscow",
  "Africa/Cairo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const getSupportedTimezones = () => {
  if (typeof Intl.supportedValuesOf === "function") {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return COMMON_TIMEZONES;
    }
  }
  return COMMON_TIMEZONES;
};

const formatInZone = (date, timeZone) => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(date);

    const offsetPart = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    })
      .formatToParts(date)
      .find((p) => p.type === "timeZoneName");

    return {
      formatted: parts,
      offset: offsetPart ? offsetPart.value : "",
    };
  } catch {
    return { formatted: "Invalid timezone", offset: "" };
  }
};

const localToUtcIso = (dateTimeLocal, timeZone) => {
  // Interpret the given "wall clock" date/time as if it were observed in `timeZone`,
  // then resolve to the equivalent UTC instant using an offset-correction loop.
  const [datePart, timePart] = dateTimeLocal.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  let guess = Date.UTC(year, month - 1, day, hour, minute);

  for (let i = 0; i < 2; i += 1) {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts = dtf.formatToParts(new Date(guess));
    const map = {};
    parts.forEach((p) => {
      map[p.type] = p.value;
    });
    const asUtc = Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      Number(map.hour === "24" ? 0 : map.hour),
      Number(map.minute),
      Number(map.second)
    );
    const diff = Date.UTC(year, month - 1, day, hour, minute) - asUtc;
    guess += diff;
  }

  return new Date(guess);
};

const getLocalHour = (date, timeZone) => {
  try {
    const hour = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      hour: "2-digit",
    }).formatToParts(date).find((p) => p.type === "hour").value;
    return Number(hour) % 24;
  } catch {
    return null;
  }
};

// Collapses a set of individually-true hour indices (0-23) into contiguous
// "start-end" ranges so overlap results read as e.g. "14:00-17:00" instead
// of a list of 24 booleans.
const collapseHourRanges = (hours) => {
  const sorted = [...hours].sort((a, b) => a - b);
  const ranges = [];
  let rangeStart = null;
  let prev = null;

  sorted.forEach((hour) => {
    if (rangeStart === null) {
      rangeStart = hour;
    } else if (hour !== prev + 1) {
      ranges.push([rangeStart, prev]);
      rangeStart = hour;
    }
    prev = hour;
  });
  if (rangeStart !== null) ranges.push([rangeStart, prev]);

  return ranges.map(
    ([start, end]) =>
      `${String(start).padStart(2, "0")}:00–${String((end + 1) % 24).padStart(2, "0")}:00`
  );
};

const TimezoneConverter = () => {
  const { dark } = useTheme();
  const [now, setNow] = useState(() => new Date());
  const [sourceZone, setSourceZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [pinnedZones, setPinnedZones] = useState([
    "UTC",
    "America/New_York",
    "Europe/London",
    "Asia/Kolkata",
    "Asia/Tokyo",
  ]);
  const [zonePicker, setZonePicker] = useState("");
  const [workStart, setWorkStart] = useState(9);
  const [workEnd, setWorkEnd] = useState(18);

  const allZones = useMemo(() => getSupportedTimezones(), []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const referenceDate = dateTimeInput
    ? localToUtcIso(dateTimeInput, sourceZone)
    : now;

  // Build a 24-hour grid (UTC hours of the reference date) and, for each
  // pinned zone, whether that hour falls inside the configured working
  // window in the zone's own local time. Hours where every pinned zone is
  // "in office hours" are the meeting overlap slots.
  const overlapGrid = useMemo(() => {
    const dayStartUtc = Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate()
    );

    const hours = Array.from({ length: 24 }, (_, h) => {
      const hourDate = new Date(dayStartUtc + h * 3600000);
      const zoneHours = pinnedZones.map((zone) => {
        const localHour = getLocalHour(hourDate, zone);
        const inRange =
          localHour !== null && localHour >= workStart && localHour < workEnd;
        return { zone, localHour, inRange };
      });
      const allInRange =
        zoneHours.length > 0 && zoneHours.every((z) => z.inRange);
      return { utcHour: h, zoneHours, allInRange };
    });

    const overlapRanges = collapseHourRanges(
      hours.filter((h) => h.allInRange).map((h) => h.utcHour)
    );

    return { hours, overlapRanges };
  }, [referenceDate, pinnedZones, workStart, workEnd]);

  const handleUseNow = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: sourceZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);
    const map = {};
    parts.forEach((p) => {
      map[p.type] = p.value;
    });
    setDateTimeInput(`${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`);
  };

  const addZone = () => {
    if (!zonePicker || pinnedZones.includes(zonePicker)) return;
    setPinnedZones([...pinnedZones, zonePicker]);
    setZonePicker("");
  };

  const removeZone = (zone) => {
    setPinnedZones(pinnedZones.filter((z) => z !== zone));
  };

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85",
      input:
        "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none",
      select:
        "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400 focus:outline-none",
      button: "bg-zinc-900 text-white hover:bg-zinc-700 transition-colors",
      result: "bg-zinc-50 border-zinc-200 text-zinc-700",
      backLink: "text-zinc-500 hover:text-zinc-900 transition-colors",
      remove: "text-zinc-400 hover:text-red-500 transition-colors",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-500",
      card: "bg-zinc-900/50 border-zinc-800/85",
      input:
        "bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none",
      select:
        "bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-zinc-500 focus:outline-none",
      button: "bg-white text-zinc-900 hover:bg-zinc-200 transition-colors",
      result: "bg-zinc-900 border-zinc-700 text-zinc-300",
      backLink: "text-zinc-500 hover:text-zinc-100 transition-colors",
      remove: "text-zinc-600 hover:text-red-400 transition-colors",
    },
  };

  const t = dark ? theme.dark : theme.light;

  return (
    <div className={`min-h-screen ${t.wrapper} px-6 py-10`}>
      <title>Timezone Converter — DevTasks</title>
      <meta
        name="description"
        content="Convert date and time across timezones and view a live multi-timezone world clock, fully offline."
      />

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
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
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${t.heading}`}>
              Timezone Converter
            </h1>
            <p className={`mt-1 text-sm ${t.subtext}`}>
              Convert a date/time across timezones and track a live world clock.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Source date/time */}
          <div className={`rounded-3xl border ${t.card} p-6`}>
            <div className="flex items-center justify-between mb-5">
              <p
                className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}
              >
                Source Date & Time
              </p>
              <button
                type="button"
                onClick={handleUseNow}
                className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${
                  dark
                    ? "bg-white text-black border-white hover:bg-zinc-200"
                    : "bg-black text-white border-black hover:bg-zinc-800"
                }`}
              >
                Use Now
              </button>
            </div>
            <div className="space-y-3">
              <select
                value={sourceZone}
                onChange={(e) => setSourceZone(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm ${t.select}`}
              >
                {allZones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={dateTimeInput}
                onChange={(e) => setDateTimeInput(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm ${t.input}`}
              />
              <p className={`text-xs ${t.subtext}`}>
                Leave blank to use the live current time.
              </p>
            </div>
          </div>

          {/* World clock */}
          <div className={`rounded-3xl border ${t.card} p-6`}>
            <div className="flex items-center justify-between mb-5">
              <p
                className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}
              >
                World Clock
              </p>
            </div>

            <div className="flex gap-3 mb-5">
              <select
                value={zonePicker}
                onChange={(e) => setZonePicker(e.target.value)}
                className={`flex-1 px-4 py-3 rounded-xl border text-sm ${t.select}`}
              >
                <option value="">Add a timezone…</option>
                {allZones
                  .filter((zone) => !pinnedZones.includes(zone))
                  .map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
              </select>
              <button
                onClick={addZone}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer ${t.button}`}
              >
                Add
              </button>
            </div>

            <div className="space-y-3">
              {pinnedZones.map((zone) => {
                const { formatted, offset } = formatInZone(referenceDate, zone);
                return (
                  <div
                    key={zone}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm ${t.result}`}
                  >
                    <div>
                      <p className={`font-medium ${t.heading}`}>{zone}</p>
                      <p className={`font-mono text-xs mt-0.5 ${t.subtext}`}>
                        {offset}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-mono">{formatted}</p>
                      <button
                        type="button"
                        onClick={() => removeZone(zone)}
                        className={`p-1 ${t.remove}`}
                        title="Remove"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
              {pinnedZones.length === 0 && (
                <p className={`text-sm ${t.subtext}`}>
                  No timezones pinned yet. Add one above.
                </p>
              )}
            </div>
          </div>

          {/* Meeting overlap finder */}
          <div className={`rounded-3xl border ${t.card} p-6`}>
            <p
              className={`text-xs uppercase tracking-widest font-medium mb-5 ${t.subtext}`}
            >
              Meeting Overlap Finder
            </p>

            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <label className={`text-sm ${t.subtext}`}>Working hours</label>
              <select
                value={workStart}
                onChange={(e) => setWorkStart(Number(e.target.value))}
                className={`px-3 py-2 rounded-xl border text-sm ${t.select}`}
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
              <span className={`text-sm ${t.subtext}`}>to</span>
              <select
                value={workEnd}
                onChange={(e) => setWorkEnd(Number(e.target.value))}
                className={`px-3 py-2 rounded-xl border text-sm ${t.select}`}
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h + 1}>
                    {String((h + 1) % 24).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
              <span className={`text-sm ${t.subtext}`}>in each zone's local time</span>
            </div>

            {pinnedZones.length === 0 ? (
              <p className={`text-sm ${t.subtext}`}>
                Pin at least one timezone above to find overlapping hours.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <div className="min-w-[720px] space-y-1.5">
                    {pinnedZones.map((zone) => (
                      <div key={zone} className="flex items-center gap-2">
                        <p
                          className={`w-36 shrink-0 text-xs truncate ${t.subtext}`}
                          title={zone}
                        >
                          {zone}
                        </p>
                        <div className="flex gap-0.5 flex-1">
                          {overlapGrid.hours.map((hourEntry) => {
                            const zoneHour = hourEntry.zoneHours.find(
                              (z) => z.zone === zone
                            );
                            return (
                              <div
                                key={hourEntry.utcHour}
                                title={`${zone}: ${String(zoneHour.localHour).padStart(2, "0")}:00`}
                                className={`flex-1 h-6 rounded-sm flex items-center justify-center text-[9px] font-mono ${
                                  zoneHour.inRange
                                    ? dark
                                      ? "bg-emerald-500/70 text-emerald-50"
                                      : "bg-emerald-500 text-white"
                                    : dark
                                      ? "bg-zinc-800 text-zinc-600"
                                      : "bg-zinc-100 text-zinc-400"
                                }`}
                              >
                                {zoneHour.localHour}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center gap-2 pt-1">
                      <p className={`w-36 shrink-0 text-xs font-medium ${t.heading}`}>
                        All zones (UTC)
                      </p>
                      <div className="flex gap-0.5 flex-1">
                        {overlapGrid.hours.map((hourEntry) => (
                          <div
                            key={hourEntry.utcHour}
                            title={`${String(hourEntry.utcHour).padStart(2, "0")}:00 UTC`}
                            className={`flex-1 h-6 rounded-sm flex items-center justify-center text-[9px] font-mono border-2 ${
                              hourEntry.allInRange
                                ? "border-emerald-500 bg-emerald-500/20"
                                : "border-transparent"
                            } ${t.subtext}`}
                          >
                            {String(hourEntry.utcHour).padStart(2, "0")}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`mt-5 px-4 py-3 rounded-xl border text-sm ${t.result}`}>
                  {overlapGrid.overlapRanges.length > 0 ? (
                    <>
                      <span className={`font-medium ${t.heading}`}>
                        Overlap (UTC):{" "}
                      </span>
                      {overlapGrid.overlapRanges.join(", ")}
                    </>
                  ) : (
                    "No hour of the day falls within working hours for every pinned zone."
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimezoneConverter;
