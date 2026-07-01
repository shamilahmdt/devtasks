import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";

const SCENARIOS = [
  // Commits
  {
    id: "undo_commit",
    category: "Commits",
    name: "Undo Last Commit",
    inputs: [
      { id: "mode", type: "select", label: "Mode", options: ["Soft (Keep changes)", "Hard (Discard changes)"], default: "Soft (Keep changes)" }
    ],
    generate: (inputs) => {
      const isHard = inputs.mode === "Hard (Discard changes)";
      return [
        { cmd: `git reset ${isHard ? '--hard' : '--soft'} HEAD~1`, desc: `Undo the last commit${isHard ? ' and discard all changes' : ' and keep changes in the working directory'}.` }
      ];
    }
  },
  {
    id: "amend_commit",
    category: "Commits",
    name: "Amend Commit Message",
    inputs: [
      { id: "message", type: "text", label: "New Message", default: "Updated commit message" }
    ],
    generate: (inputs) => [
      { cmd: `git commit --amend -m "${inputs.message}"`, desc: "Modify the most recent commit message." }
    ]
  },
  {
    id: "revert_commit",
    category: "Commits",
    name: "Revert Specific Commit",
    inputs: [
      { id: "hash", type: "text", label: "Commit Hash", default: "a1b2c3d" }
    ],
    generate: (inputs) => [
      { cmd: `git revert ${inputs.hash}`, desc: "Create a new commit that undoes the changes from the specified commit." }
    ]
  },
  {
    id: "cherry_pick",
    category: "Commits",
    name: "Cherry-Pick",
    inputs: [
      { id: "hash", type: "text", label: "Commit Hash", default: "a1b2c3d" }
    ],
    generate: (inputs) => [
      { cmd: `git cherry-pick ${inputs.hash}`, desc: "Apply the changes introduced by the given commit." }
    ]
  },
  
  // Branches
  {
    id: "rename_branch",
    category: "Branches",
    name: "Rename Branch",
    inputs: [
      { id: "oldName", type: "text", label: "Old Branch Name", default: "feature-old" },
      { id: "newName", type: "text", label: "New Branch Name", default: "feature-new" }
    ],
    generate: (inputs) => [
      { cmd: `git branch -m ${inputs.oldName} ${inputs.newName}`, desc: "Rename the local branch." },
      { cmd: `git push origin -d ${inputs.oldName}`, desc: "Delete the old branch from the remote." },
      { cmd: `git push origin -u ${inputs.newName}`, desc: "Push the new branch and set up tracking." }
    ]
  },
  {
    id: "delete_branch",
    category: "Branches",
    name: "Delete Branch (Local & Remote)",
    inputs: [
      { id: "branch", type: "text", label: "Branch Name", default: "feature-branch" }
    ],
    generate: (inputs) => [
      { cmd: `git branch -d ${inputs.branch}`, desc: "Delete the branch locally (use -D to force delete)." },
      { cmd: `git push origin -d ${inputs.branch}`, desc: "Delete the branch from the remote repository." }
    ]
  },
  {
    id: "track_remote",
    category: "Branches",
    name: "Track Remote Branch",
    inputs: [
      { id: "remote", type: "text", label: "Remote Name", default: "origin" },
      { id: "branch", type: "text", label: "Branch Name", default: "main" }
    ],
    generate: (inputs) => [
      { cmd: `git checkout --track ${inputs.remote}/${inputs.branch}`, desc: "Create a local branch tracking the remote branch." }
    ]
  },
  {
    id: "clean_untracked",
    category: "Branches",
    name: "Clean Untracked Files",
    inputs: [],
    generate: () => [
      { cmd: `git clean -fd`, desc: "Remove untracked files (-f) and directories (-d)." }
    ]
  },

  // Stashing
  {
    id: "stash_message",
    category: "Stashing",
    name: "Stash Changes with Message",
    inputs: [
      { id: "message", type: "text", label: "Stash Message", default: "WIP feature" }
    ],
    generate: (inputs) => [
      { cmd: `git stash push -m "${inputs.message}"`, desc: "Save local changes to a new stash with a specific message." }
    ]
  },
  {
    id: "list_stashes",
    category: "Stashing",
    name: "List Stashes",
    inputs: [],
    generate: () => [
      { cmd: `git stash list`, desc: "Show all stashed changes." }
    ]
  },
  {
    id: "apply_stash",
    category: "Stashing",
    name: "Apply or Pop Stash",
    inputs: [
      { id: "action", type: "select", label: "Action", options: ["Pop (Apply and remove)", "Apply (Apply and keep)"], default: "Pop (Apply and remove)" }
    ],
    generate: (inputs) => {
      const isPop = inputs.action === "Pop (Apply and remove)";
      return [
        { cmd: `git stash ${isPop ? 'pop' : 'apply'}`, desc: `${isPop ? 'Apply the most recent stash and remove it from the stash list.' : 'Apply the most recent stash but keep it in the list.'}` }
      ];
    }
  },
  {
    id: "clear_stashes",
    category: "Stashing",
    name: "Clear Stashes",
    inputs: [],
    generate: () => [
      { cmd: `git stash clear`, desc: "Remove all stashed entries." }
    ]
  },

  // Undoing/Resetting
  {
    id: "discard_all",
    category: "Undoing/Resetting",
    name: "Discard All Local Changes",
    inputs: [],
    generate: () => [
      { cmd: `git restore .`, desc: "Discard changes in the working directory." },
      { cmd: `git clean -fd`, desc: "Remove untracked files and directories." }
    ]
  },
  {
    id: "discard_file",
    category: "Undoing/Resetting",
    name: "Discard Changes in Specific File",
    inputs: [
      { id: "filepath", type: "text", label: "File Path", default: "src/App.jsx" }
    ],
    generate: (inputs) => [
      { cmd: `git restore --source=HEAD --staged --worktree -- ${inputs.filepath}`, desc: "Restore the file to its state in the last commit (HEAD), discarding both staged and unstaged changes." }
    ]
  },
  {
    id: "reset_commit",
    category: "Undoing/Resetting",
    name: "Reset to a Specific Commit",
    inputs: [
      { id: "hash", type: "text", label: "Commit Hash", default: "a1b2c3d" },
      { id: "mode", type: "select", label: "Reset Mode", options: ["Hard (Discard all changes)", "Soft (Keep changes staged)", "Mixed (Keep changes unstaged)"], default: "Hard (Discard all changes)" }
    ],
    generate: (inputs) => {
      const mode = inputs.mode.split(' ')[0].toLowerCase();
      return [
        { cmd: `git reset --${mode} ${inputs.hash}`, desc: `Reset the current branch to the specified commit (${mode}).` }
      ];
    }
  },

  // Syncing
  {
    id: "add_remote",
    category: "Syncing",
    name: "Add a Remote",
    inputs: [
      { id: "remote", type: "text", label: "Remote Name", default: "origin" },
      { id: "url", type: "text", label: "Remote URL", default: "https://github.com/user/repo.git" }
    ],
    generate: (inputs) => [
      { cmd: `git remote add ${inputs.remote} ${inputs.url}`, desc: "Add a new remote repository connection." }
    ]
  },
  {
    id: "push_upstream",
    category: "Syncing",
    name: "Push New Branch with Upstream",
    inputs: [
      { id: "remote", type: "text", label: "Remote Name", default: "origin" },
      { id: "branch", type: "text", label: "Branch Name", default: "feature-branch" }
    ],
    generate: (inputs) => [
      { cmd: `git push -u ${inputs.remote} ${inputs.branch}`, desc: "Push the branch and set it to track the remote branch." }
    ]
  },
  {
    id: "force_push",
    category: "Syncing",
    name: "Force Push Safely",
    inputs: [],
    generate: () => [
      { cmd: `git push --force-with-lease`, desc: "Force push, but refuse to overwrite if someone else has updated the remote branch." }
    ]
  }
];

const GitCommandBuilder = () => {
  const { dark } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScenarioId, setSelectedScenarioId] = useState(SCENARIOS[0].id);
  
  const selectedScenario = SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[0];
  
  // Initialize input state for the selected scenario
  const initialInputs = useMemo(() => {
    const defaultInputs = {};
    selectedScenario.inputs.forEach(input => {
      defaultInputs[input.id] = input.default;
    });
    return defaultInputs;
  }, [selectedScenarioId, selectedScenario.inputs]);

  const [inputs, setInputs] = useState(initialInputs);

  // Update state when selection changes
  const handleScenarioChange = (id) => {
    setSelectedScenarioId(id);
    const newScenario = SCENARIOS.find(s => s.id === id);
    const newInputs = {};
    newScenario.inputs.forEach(input => {
      newInputs[input.id] = input.default;
    });
    setInputs(newInputs);
  };

  const handleInputChange = (id, value) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const generatedCommands = selectedScenario.generate(inputs);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Command copied to clipboard");
    } catch {
      toast.error("Failed to copy command to clipboard");
    }
  };

  const copyAll = async () => {
    const fullCommand = generatedCommands.map((c) => c.cmd).join(" && \\\n");
    try {
      await navigator.clipboard.writeText(fullCommand);
      toast.success("All commands copied to clipboard");
    } catch {
      toast.error("Failed to copy commands to clipboard");
    }
  };

  // Group scenarios by category
  const filteredScenarios = SCENARIOS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(filteredScenarios.map(s => s.category))];

  return (
    <div
      className={`min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden md:overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>Git Command Builder — DevTasks</title>
      <meta
        name="description"
        content="Interactive scenario-based Git command builder."
      />
      
      {/* Decorative background circles */}
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
        className={`relative z-10 w-full max-w-5xl md:mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full md:max-h-[85vh] overflow-hidden transition-all duration-300 ${
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1
            className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 min-w-0 flex-1 ${
              dark ? "text-white" : "text-black"
            }`}
          >
            Git Command Builder
          </h1>
        </div>

        {/* Content Wrapper */}
        <div className="w-full flex-1 min-h-0 pt-2 pb-5 sm:pb-8 px-5 sm:px-8 flex flex-col">
          {/* Scrollable Area */}
          <div className="overflow-y-auto flex-1 min-h-0 pr-1 sm:pr-2 custom-scrollbar">
            <div className="flex flex-col md:flex-row gap-6 h-full pb-2">
            
            {/* Left Panel: Scenarios and Inputs */}
            <div className="w-full md:w-[40%] flex flex-col gap-6">
              
              {/* Scenario Search & Selection */}
              <div className="flex flex-col gap-3">
                <label className={`text-xs font-black uppercase tracking-widest ${dark ? "text-zinc-400" : "text-neutral-500"}`}>
                  Scenario
                </label>
                <div className="relative">
                  <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? "text-zinc-500" : "text-neutral-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search scenarios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-300 ${
                      dark
                        ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus:border-white focus:ring-1 focus:ring-white"
                        : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                    }`}
                  />
                </div>
                
                <div className={`mt-2 border rounded-xl overflow-y-auto max-h-[250px] custom-scrollbar ${dark ? "border-zinc-800 bg-zinc-950" : "border-neutral-200 bg-neutral-50"}`}>
                  {categories.length > 0 ? categories.map(category => (
                    <div key={category}>
                      <div className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider sticky top-0 ${dark ? "bg-zinc-900 text-zinc-500" : "bg-neutral-200 text-neutral-600"}`}>
                        {category}
                      </div>
                      {filteredScenarios.filter(s => s.category === category).map(scenario => (
                        <button
                          key={scenario.id}
                          onClick={() => handleScenarioChange(scenario.id)}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-200 flex items-center justify-between ${
                            selectedScenarioId === scenario.id
                              ? (dark ? "bg-zinc-800 text-white" : "bg-neutral-200 text-black font-semibold")
                              : (dark ? "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200" : "text-neutral-600 hover:bg-neutral-100")
                          }`}
                        >
                          <span>{scenario.name}</span>
                          {selectedScenarioId === scenario.id && (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )) : (
                    <div className={`p-4 text-center text-sm ${dark ? "text-zinc-500" : "text-neutral-500"}`}>No scenarios found.</div>
                  )}
                </div>
              </div>

              {/* Dynamic Inputs */}
              {selectedScenario.inputs.length > 0 && (
                <div className="flex flex-col gap-4 mt-2">
                  <label className={`text-xs font-black uppercase tracking-widest ${dark ? "text-zinc-400" : "text-neutral-500"}`}>
                    Parameters
                  </label>
                  {selectedScenario.inputs.map(input => (
                    <div key={input.id} className="flex flex-col gap-2">
                      <label className={`text-xs font-semibold ${dark ? "text-zinc-300" : "text-neutral-700"}`}>
                        {input.label}
                      </label>
                      {input.type === "select" ? (
                        <select
                          value={inputs[input.id] || ""}
                          onChange={(e) => handleInputChange(input.id, e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-300 ${
                            dark
                              ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-1 focus:ring-white"
                              : "bg-white border-neutral-300 text-black focus:border-black focus:ring-1 focus:ring-black"
                          }`}
                        >
                          {input.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={inputs[input.id] || ""}
                          onChange={(e) => handleInputChange(input.id, e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-300 ${
                            dark
                              ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus:border-white focus:ring-1 focus:ring-white"
                              : "bg-white border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Panel: Interactive Terminal */}
            <div className="w-full md:w-[60%] flex flex-col h-full">
              <label className={`text-xs font-black uppercase tracking-widest mb-3 ${dark ? "text-zinc-400" : "text-neutral-500"}`}>
                Output
              </label>
              <div className="relative flex-1 flex flex-col rounded-2xl overflow-hidden border bg-[#0D1117] border-zinc-800 shadow-inner min-h-[300px]">
                {/* Terminal Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#161B22] border-b border-zinc-800">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  {generatedCommands.length > 1 && (
                    <button
                      onClick={copyAll}
                      className="text-xs font-semibold px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                    >
                      Copy All Steps
                    </button>
                  )}
                </div>
                
                {/* Terminal Body */}
                <div className="flex-1 p-5 overflow-y-auto font-mono text-sm">
                  {generatedCommands.map((cmdItem, index) => (
                    <div key={index} className="mb-6 last:mb-0 group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 break-all">
                          <span className="text-emerald-400 font-bold select-none">$ </span>
                          <span className="text-zinc-100">{cmdItem.cmd}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(cmdItem.cmd)}
                          aria-label="Copy command"
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-white transition-all shrink-0"
                          title="Copy Command"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-2 text-zinc-500 text-xs flex items-start gap-2">
                        <span className="select-none text-zinc-600">↳</span>
                        <span className="italic">{cmdItem.desc}</span>
                      </div>
                    </div>
                  ))}
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

export default GitCommandBuilder;
