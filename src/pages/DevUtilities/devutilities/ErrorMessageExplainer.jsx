import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const LANGUAGE_OPTIONS = ["JavaScript", "Python", "Java", "C++"];

const ERROR_PATTERNS = [
  {
    language: "JavaScript",
    test: /cannot read propert(?:y|ies).*undefined|cannot read propert(?:y|ies).*null|cannot access .* of undefined|cannot access .* of null/i,
    title: "Cannot read a property of undefined or null",
    meaning: "Your code is trying to read a property from a value that is currently undefined or null.",
    causes: ["The value has not been initialized.", "An object or nested property is missing.", "Data has not loaded when this code runs."],
    fix: "Check the value before accessing its properties, and confirm that data is available at this point in your code.",
    example: "if (user) {\n  console.log(user.name);\n}",
  },
  {
    language: "JavaScript",
    test: /is not a function|not callable/i,
    title: "Value is not a function",
    meaning: "Your code is trying to call a value as a function, but that value is not callable.",
    causes: ["The function name is misspelled.", "A variable was assigned a non-function value.", "An imported function is missing or used incorrectly."],
    fix: "Check the variable's value and spelling, and verify that the function is imported or defined correctly.",
    example: "console.log(typeof myFunction);\n// Check that myFunction is actually a function before calling it.",
  },
  {
    language: "JavaScript",
    test: /unexpected token|unexpected end of input|missing\s*\)/i,
    title: "JavaScript syntax error",
    meaning: "The JavaScript parser found code that does not follow the language's syntax rules.",
    causes: ["A bracket, parenthesis, or quote is missing.", "There is an extra comma or operator.", "A statement was left incomplete."],
    fix: "Read the line mentioned in the error and the line immediately before it. Match all brackets, parentheses, and quotes.",
    example: "const user = { name: \"Sam\" };\nconsole.log(user.name);",
  },
  {
    language: "JavaScript",
    test: /referenceerror:.*is not defined|is not defined/i,
    title: "Variable or name is not defined",
    meaning: "The code refers to a variable or function name that is not available in the current scope.",
    causes: ["The name is misspelled.", "The variable was never declared.", "The variable is outside the current scope."],
    fix: "Check spelling and capitalization, then confirm the variable is declared in a scope where this code can access it.",
    example: "const total = 10;\nconsole.log(total);",
  },
  {
    language: "Python",
    test: /nameerror:.*not defined/i,
    title: "NameError: name is not defined",
    meaning: "Python cannot find the variable or function name used in this statement.",
    causes: ["The name is misspelled or has different capitalization.", "The variable has not been assigned yet.", "The name is outside the current scope."],
    fix: "Define the variable before using it and make sure its spelling and capitalization match.",
    example: "total = 10\nprint(total)",
  },
  {
    language: "Python",
    test: /typeerror:.*(unsupported operand|not subscriptable|object is not callable|argument)/i,
    title: "TypeError: incompatible operation or value type",
    meaning: "An operation or function received a value of a type it does not support.",
    causes: ["Values have incompatible types, such as text and a number.", "A value is being indexed or called incorrectly.", "A function received an unexpected argument."],
    fix: "Check the types and function signature. Convert values when needed and pass arguments in the expected format.",
    example: "age = int(\"18\")\nprint(age + 1)",
  },
  {
    language: "Python",
    test: /indexerror: list index out of range/i,
    title: "IndexError: list index out of range",
    meaning: "The code is trying to access a list position that does not exist.",
    causes: ["The index is larger than the last valid position.", "The list is empty.", "A loop runs one iteration too many."],
    fix: "Check the list length before indexing. Remember that Python list indexes start at 0.",
    example: "items = [\"a\", \"b\"]\nif items:\n    print(items[0])",
  },
  {
    language: "Python",
    test: /syntaxerror/i,
    title: "SyntaxError: invalid Python syntax",
    meaning: "Python cannot parse the statement because it does not follow Python syntax rules.",
    causes: ["A colon is missing after a function, loop, or condition.", "Quotes or parentheses are unmatched.", "An operator or keyword is used incorrectly."],
    fix: "Inspect the reported line and the line before it, then check indentation, colons, quotes, and parentheses.",
    example: "if score >= 50:\n    print(\"Passed\")",
  },
  {
    language: "Java",
    test: /cannot find symbol/i,
    title: "Cannot find symbol",
    meaning: "The Java compiler cannot find the variable, method, or class name referenced in your code.",
    causes: ["The name is misspelled or capitalized differently.", "The variable or method is not declared in scope.", "A required import may be missing."],
    fix: "Check the exact spelling and capitalization, declaration scope, and imports. Java identifiers are case-sensitive.",
    example: "int total = 10;\nSystem.out.println(total);",
  },
  {
    language: "Java",
    test: /nullpointerexception/i,
    title: "NullPointerException",
    meaning: "Your code tried to use an object reference that currently points to null.",
    causes: ["An object was declared but not initialized.", "A method returned null unexpectedly.", "A lookup did not find an object."],
    fix: "Find the expression on the reported line and verify the reference is not null before using it.",
    example: "if (user != null) {\n    System.out.println(user.getName());\n}",
  },
  {
    language: "Java",
    test: /incompatible types/i,
    title: "Incompatible types",
    meaning: "A value of one type is being used where Java expects a different type.",
    causes: ["A value is assigned to a variable with a different type.", "A method returns a type different from what the caller expects.", "A conversion is needed."],
    fix: "Compare the expected and actual types in the compiler message. Use a suitable conversion or correct the declaration.",
    example: "int count = Integer.parseInt(\"12\");",
  },
  {
    language: "C++",
    test: /was not declared in this scope|undeclared identifier/i,
    title: "Name was not declared in this scope",
    meaning: "The compiler cannot find the variable or function name at the place where it is used.",
    causes: ["The name is misspelled.", "The variable is declared after it is used.", "The name is outside the current scope."],
    fix: "Check spelling and scope, and make sure the declaration appears before the use when required.",
    example: "int total = 10;\nstd::cout << total;",
  },
  {
    language: "C++",
    test: /expected ['`]?;|expected primary-expression|expected\s*;/i,
    title: "C++ syntax error",
    meaning: "The compiler expected a valid C++ expression or punctuation but found something else.",
    causes: ["A semicolon is missing.", "Parentheses or braces are unmatched.", "An expression or declaration is incomplete."],
    fix: "Inspect the reported line and the line before it. Check semicolons, parentheses, braces, and operators.",
    example: "int total = 10;\nstd::cout << total << std::endl;",
  },
  {
    language: "C++",
    test: /segmentation fault|access violation/i,
    title: "Invalid memory access",
    meaning: "The program tried to access memory it was not allowed to use. This runtime message alone does not identify the exact cause.",
    causes: ["A pointer is null or invalid.", "An array is accessed outside its valid range.", "An object has already gone out of scope or been released."],
    fix: "Review pointer values and array bounds near the failing line. A debugger or sanitizer can help identify the exact access.",
    example: "int values[2] = {10, 20};\nstd::cout << values[0]; // Use a valid index",
  },
];

const SAMPLE_ERRORS = {
  JavaScript: "TypeError: Cannot read properties of undefined (reading 'name')",
  Python: "NameError: name 'total' is not defined",
  Java: "java.lang.NullPointerException",
  "C++": "main.cpp: error: 'total' was not declared in this scope",
};

export default function ErrorMessageExplainer() {
  const { dark } = useTheme();
  const [language, setLanguage] = useState("JavaScript");
  const [errorText, setErrorText] = useState(SAMPLE_ERRORS.JavaScript);
  const [submittedError, setSubmittedError] = useState(SAMPLE_ERRORS.JavaScript);

  const explanation = useMemo(() => {
    if (!submittedError.trim()) return null;
    return ERROR_PATTERNS.find(
      (item) => item.language === language && item.test.test(submittedError),
    );
  }, [language, submittedError]);

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Clipboard access is unavailable. Please copy the text manually.");
    }
  };

  const analyze = () => {
    if (!errorText.trim()) {
      toast.error("Paste an error message first");
      return;
    }
    setSubmittedError(errorText.trim());
  };

  const loadSample = (nextLanguage = language) => {
    setLanguage(nextLanguage);
    setErrorText(SAMPLE_ERRORS[nextLanguage]);
    setSubmittedError(SAMPLE_ERRORS[nextLanguage]);
  };

  const panel = `rounded-xl border p-5 ${dark ? "border-zinc-700 bg-zinc-900" : "border-zinc-200 bg-white"}`;
  const muted = dark ? "text-zinc-400" : "text-zinc-600";
  const field = `w-full rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${dark ? "border-zinc-700 bg-zinc-950 text-zinc-100" : "border-zinc-300 bg-white text-zinc-900"}`;

  return (
    <main className={`min-h-full px-4 py-6 sm:px-6 lg:px-8 ${dark ? "text-zinc-100" : "text-zinc-900"}`}>
      <div className="mx-auto max-w-5xl">
        <Link to="/devutilities" className={`mb-5 inline-flex items-center gap-2 text-sm hover:underline ${muted}`}>
          ← Back to Dev Utilities
        </Link>
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-500">Developer helper</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Error Message Explainer</h1>
          <p className={`mt-3 max-w-3xl text-base leading-7 ${muted}`}>
            Turn common programming errors into plain-language explanations, likely causes, and practical debugging steps. Runs entirely in your browser — no API key or upload needed.
          </p>
        </div>

        <section className={`${panel} mb-6`}>
          <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
            <label className="block text-sm font-medium">
              Programming language
              <select value={language} onChange={(event) => loadSample(event.target.value)} className={`${field} mt-2`}>
                {LANGUAGE_OPTIONS.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <div className="flex items-end justify-start gap-2 sm:justify-end">
              <button type="button" onClick={() => loadSample()} className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:opacity-80 ${dark ? "border-zinc-700" : "border-zinc-300"}`}>
                Load sample
              </button>
              <button type="button" onClick={() => { setErrorText(""); setSubmittedError(""); }} className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:opacity-80 ${dark ? "border-zinc-700" : "border-zinc-300"}`}>
                Clear
              </button>
            </div>
          </div>
          <label className="mt-5 block text-sm font-medium">
            Paste the error message
            <textarea value={errorText} onChange={(event) => setErrorText(event.target.value)} rows={5} placeholder="Paste the full error message here…" className={`${field} mt-2 resize-y font-mono text-sm`} />
          </label>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={analyze} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
              Explain error
            </button>
            <span className={`text-xs ${muted}`}>Recognizes common patterns; explanations are suggestions, not a full diagnosis.</span>
          </div>
        </section>

        {submittedError.trim() && (
          explanation ? (
            <section className="space-y-4" aria-live="polite">
              <div className={panel}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-500">Recognized error</p>
                    <h2 className="text-xl font-bold">{explanation.title}</h2>
                  </div>
                  <button type="button" onClick={() => copyText(`${explanation.title}\n\nWhat it means:\n${explanation.meaning}\n\nPossible causes:\n${explanation.causes.map((cause, index) => `${index + 1}. ${cause}`).join("\n")}\n\nHow to debug:\n${explanation.fix}\n\nExample:\n${explanation.example}`)} className={`rounded-lg border px-3 py-2 text-sm font-medium hover:opacity-80 ${dark ? "border-zinc-700" : "border-zinc-300"}`}>
                    Copy explanation
                  </button>
                </div>
                <p className={`mt-4 leading-7 ${muted}`}>{explanation.meaning}</p>
              </div>
              <div className={panel}>
                <h3 className="text-lg font-semibold">Possible causes</h3>
                <ul className={`mt-3 list-disc space-y-2 pl-5 leading-6 ${muted}`}>
                  {explanation.causes.map((cause) => <li key={cause}>{cause}</li>)}
                </ul>
              </div>
              <div className={panel}>
                <h3 className="text-lg font-semibold">How to debug</h3>
                <p className={`mt-3 leading-7 ${muted}`}>{explanation.fix}</p>
              </div>
              <div className={panel}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">Example</h3>
                  <button type="button" onClick={() => copyText(explanation.example)} className={`text-sm font-medium text-blue-500 hover:underline`}>Copy code</button>
                </div>
                <pre className={`overflow-x-auto rounded-lg p-4 text-sm leading-6 ${dark ? "bg-zinc-950 text-zinc-200" : "bg-zinc-100 text-zinc-800"}`}><code>{explanation.example}</code></pre>
              </div>
              <p className={`text-sm ${muted}`}>The exact cause depends on the surrounding code. Use the error location and your program context to confirm the fix.</p>
            </section>
          ) : (
            <section className={`${panel} border-amber-500/50`} aria-live="polite">
              <h2 className="text-lg font-semibold">No matching pattern found</h2>
              <p className={`mt-2 leading-7 ${muted}`}>This message is not in the current offline reference set for {language}. Check the line number and surrounding code, search the exact error text in the language's official documentation, or try including the complete error message.</p>
              <button type="button" onClick={() => copyText(submittedError)} className={`mt-4 rounded-lg border px-3 py-2 text-sm font-medium hover:opacity-80 ${dark ? "border-zinc-700" : "border-zinc-300"}`}>Copy original error</button>
            </section>
          )
        )}

        <p className={`mt-6 text-xs leading-5 ${muted}`}>Privacy note: the error text is processed locally in your browser and is not sent to a server.</p>
      </div>
    </main>
  );
}
