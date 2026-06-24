import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

type PermissionType = "read" | "write" | "execute";
type EntityType = "owner" | "group" | "others";

type PermissionSet = {
  read: boolean;
  write: boolean;
  execute: boolean;
};

type Permissions = {
  owner: PermissionSet;
  group: PermissionSet;
  others: PermissionSet;
};

const PRESETS = {
  "755": {
    owner: { read: true, write: true, execute: true },
    group: { read: true, write: false, execute: true },
    others: { read: true, write: false, execute: true },
  },
  "644": {
    owner: { read: true, write: true, execute: false },
    group: { read: true, write: false, execute: false },
    others: { read: true, write: false, execute: false },
  },
  "700": {
    owner: { read: true, write: true, execute: true },
    group: { read: false, write: false, execute: false },
    others: { read: false, write: false, execute: false },
  },
  "600": {
    owner: { read: true, write: true, execute: false },
    group: { read: false, write: false, execute: false },
    others: { read: false, write: false, execute: false },
  },
} as const;

type PresetKey = keyof typeof PRESETS;

const ENTITIES: EntityType[] = [
  "owner",
  "group",
  "others",
];

const PERMISSIONS: {
  key: PermissionType;
  label: string;
}[] = [
  { key: "read", label: "Read (4)" },
  { key: "write", label: "Write (2)" },
  { key: "execute", label: "Execute (1)" },
];

const DEFAULT_PERMISSIONS = PRESETS["755"];

const ChmodCalculator = () => {
  const { dark } = useTheme();

  const [filename, setFilename] = useState("file.txt");
  const [permissions, setPermissions] = useState<Permissions>(DEFAULT_PERMISSIONS);

  const togglePermission = (
    entity: EntityType,
    permission: PermissionType
    ) => {
    setPermissions((prev) => ({
        ...prev,
        [entity]: {
        ...prev[entity],
        [permission]: !prev[entity][permission],
        },
    }));
    };

    const getOctalDigit = (perm: any) => {
        return (
            (perm.read ? 4 : 0) +
            (perm.write ? 2 : 0) +
            (perm.execute ? 1 : 0)
        );
  };

  const getSymbolicPart = (perm: any) => {
    return [
      perm.read ? "r" : "-",
      perm.write ? "w" : "-",
      perm.execute ? "x" : "-",
    ].join("");
  };

  const octal = useMemo(() => {
    return `${getOctalDigit(permissions.owner)}${getOctalDigit(
      permissions.group,
    )}${getOctalDigit(permissions.others)}`;
  }, [permissions]);

  const symbolic = useMemo(() => {
    return (
      "-" +
      getSymbolicPart(permissions.owner) +
      getSymbolicPart(permissions.group) +
      getSymbolicPart(permissions.others)
    );
  }, [permissions]);

  const command = `chmod ${octal} ${filename || "file.txt"}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      toast.success("Command copied to clipboard");
    } catch {
      toast.error("Failed to copy command");
    }
  };

  const loadPreset = (preset: PresetKey) => {
  setPermissions(PRESETS[preset]);
  toast.success(`Loaded preset ${preset}`);
};

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-300 overflow-x-hidden ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      <title>Chmod Calculator | DevTasks</title>

      <div
        className={`w-full max-w-6xl mx-4 sm:mx-6 md:mx-auto rounded-3xl sm:rounded-4xl shadow-lg p-4 sm:p-8 border transition-colors duration-300 ${
          dark ? "bg-zinc-900 border-zinc-700" : "bg-white border-neutral-100"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 ${
              dark
                ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                : "bg-white border-neutral-200 text-neutral-600 hover:text-black"
            }`}
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
            className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
              dark ? "text-white" : "text-black"
            }`}
          >
            Chmod Calculator
          </h1>
        </div>

        {/* Presets */}
        <div className="mb-8">
          <p
            className={`text-xs font-black uppercase tracking-widest mb-3 ${
              dark ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            Quick Presets
          </p>

          <div className="flex flex-wrap gap-3">
            {([
              ["755", "Public Executable"],
              ["644", "Public Read-Only"],
              ["700", "Private Executable"],
              ["600", "Private Read-Write"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => loadPreset(value)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all duration-200 hover:scale-105 ${
                  dark
                    ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                    : "bg-white border-neutral-200 text-zinc-600 hover:text-black"
                }`}
              >
                {value} · {label}
              </button>
            ))}
          </div>
        </div>

        {/* Permission Grid */}
        <div
          className={`rounded-2xl border overflow-hidden mb-8 ${
            dark ? "border-zinc-800" : "border-neutral-200"
          }`}
        >
          <table className="w-full">
            <thead>
              <tr
                className={
                  dark ? "bg-zinc-800/50" : "bg-neutral-100"
                }
              >
                <th className="p-4 text-left">Permission</th>
                <th className="p-4 text-center">Owner</th>
                <th className="p-4 text-center">Group</th>
                <th className="p-4 text-center">Others</th>
              </tr>
            </thead>

            <tbody>
              {PERMISSIONS.map(({ key, label }) => (
                <tr key={key}>
                    <td>{label}</td>

                    {ENTITIES.map((entity) => (
                    <td key={entity}>
                        <button
                            type="button"
                            onClick={() => togglePermission(entity, key)}
                            className={`w-4 h-4 my-2 rounded-xl border flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                                permissions[entity][key]
                                ? dark
                                    ? "bg-white text-black border-white"
                                    : "bg-black text-white border-black"
                                : dark
                                    ? "bg-zinc-900 border-zinc-700 text-zinc-600 hover:border-zinc-500"
                                    : "bg-white border-neutral-200 text-neutral-400 hover:border-neutral-400"
                            }`}
                            >
                            {permissions[entity][key] && (
                                <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                                >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                                </svg>
                            )}
                            </button>
                    </td>
                    ))}
                </tr>
               ))}
            </tbody>
          </table>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div
            className={`p-5 rounded-2xl border ${
              dark
                ? "bg-zinc-950 border-zinc-800"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <p className="text-xs font-black uppercase tracking-widest mb-2">
              Octal Notation
            </p>

            <p className="text-3xl font-black">
              {octal}
            </p>
          </div>

          <div
            className={`p-5 rounded-2xl border ${
              dark
                ? "bg-zinc-950 border-zinc-800"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <p className="text-xs font-black uppercase tracking-widest mb-2">
              Symbolic Notation
            </p>

            <p className="font-mono text-lg break-all">
              {symbolic}
            </p>
          </div>

          <div
            className={`p-5 rounded-2xl border ${
              dark
                ? "bg-zinc-950 border-zinc-800"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <p className="text-xs font-black uppercase tracking-widest mb-2">
              Filename
            </p>

            <input
              value={filename}
              onChange={(e) =>
                setFilename(e.target.value)
              }
              className={`w-full px-3 py-2 rounded-xl border outline-none ${
                dark
                  ? "bg-zinc-900 border-zinc-700 text-white"
                  : "bg-white border-neutral-200"
              }`}
            />
          </div>
        </div>

        {/* Command Generator */}
        <div
          className={`p-5 rounded-2xl border mb-8 ${
            dark
              ? "bg-zinc-950 border-zinc-800"
              : "bg-neutral-50 border-neutral-200"
          }`}
        >
          <p className="text-xs font-black uppercase tracking-widest mb-3">
            Generated Command
          </p>

          <div className="flex flex-col lg:flex-row gap-4">
            <code
              className={`flex-1 p-4 rounded-xl break-all ${
                dark
                  ? "bg-zinc-900 text-zinc-200"
                  : "bg-white text-zinc-800"
              }`}
            >
              {command}
            </code>

            <button
              onClick={handleCopy}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
                dark
                  ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                  : "bg-white border-neutral-200 text-zinc-600 hover:text-black"
              }`}
            >
              Copy Command
            </button>
          </div>
        </div>

        {/* Explainer */}
        <div
          className={`p-6 rounded-2xl border ${
            dark
              ? "bg-zinc-950 border-zinc-800"
              : "bg-neutral-50 border-neutral-200"
          }`}
        >
          <h2 className="font-black uppercase tracking-widest mb-4">
            Understanding Permissions
          </h2>

          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              <strong>Owner (u):</strong> The user who owns
              the file.
            </p>

            <p>
              <strong>Group (g):</strong> Users belonging to
              the file's group.
            </p>

            <p>
              <strong>Others (o):</strong> Everyone else on
              the system.
            </p>

            <p>
              Permission values:
              <strong> Read = 4</strong>,
              <strong> Write = 2</strong>,
              <strong> Execute = 1</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChmodCalculator;

