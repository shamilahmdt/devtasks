import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  FaAlignLeft,
  FaArrowLeft,
  FaCheckCircle,
  FaCompressAlt,
  FaCopy,
  FaExclamationTriangle,
  FaRegLightbulb,
  FaTimesCircle,
  FaTrashAlt,
} from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

// --- Shared Helpers --------------------------------------------------------

const MAX_TOKENS = 200000;
const MAX_DEPTH = 300;
const MAX_TYPE_DEPTH = 50;
const MAX_LINE_WIDTH = 80;
const DEPTH_WARNING_THRESHOLD = 12;

const SDL_KEYWORDS = new Set([
  "type",
  "schema",
  "input",
  "enum",
  "interface",
  "union",
  "scalar",
  "extend",
  "directive",
]);

const PUNCTUATORS = new Set([
  "!",
  "$",
  "&",
  "(",
  ")",
  ":",
  "=",
  "@",
  "[",
  "]",
  "{",
  "}",
  "|",
]);

const ESCAPES = {
  '"': '"',
  "\\": "\\",
  "/": "/",
  b: "\b",
  f: "\f",
  n: "\n",
  r: "\r",
  t: "\t",
};

const makeDiagnostic = (severity, message, line, column, length = 1) => ({
  severity,
  message,
  line,
  column,
  length: Math.max(1, length),
});

const syntaxError = (message, line, column, length = 1) => {
  const error = new Error(message);
  error.gqlDiagnostic = makeDiagnostic("error", message, line, column, length);
  return error;
};

const isDigit = (char) => char >= "0" && char <= "9";

const isNameStart = (char) =>
  char === "_" ||
  (char >= "a" && char <= "z") ||
  (char >= "A" && char <= "Z");

const isNameContinue = (char) => isNameStart(char) || isDigit(char);

const dedentBlockString = (raw) => {
  const lines = raw.split(/\r\n|\r|\n/);
  let commonIndent = null;

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.replace(/^[ \t]+/, "");
    const indentSize = line.length - trimmed.length;

    if (trimmed.length > 0 && (commonIndent === null || indentSize < commonIndent)) {
      commonIndent = indentSize;
    }
  }

  if (commonIndent) {
    for (let i = 1; i < lines.length; i += 1) {
      lines[i] = lines[i].slice(commonIndent);
    }
  }

  while (lines.length > 0 && lines[0].trim() === "") {
    lines.shift();
  }

  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  return lines.join("\n");
};

// --- Tokenizer -------------------------------------------------------------

const tokenize = (source) => {
  const tokens = [];
  const comments = [];
  const length = source.length;

  let index = 0;
  let line = 1;
  let lineStart = 0;

  const columnAt = (position) => position - lineStart + 1;

  while (index < length) {
    if (tokens.length > MAX_TOKENS) {
      throw syntaxError(
        "This document is too large to analyze safely. Try formatting a smaller query.",
        line,
        columnAt(index)
      );
    }

    const char = source[index];

    if (char === "\n") {
      index += 1;
      line += 1;
      lineStart = index;
      continue;
    }

    if (char === "\r") {
      index += 1;
      if (source[index] === "\n") {
        index += 1;
      }
      line += 1;
      lineStart = index;
      continue;
    }

    if (char === " " || char === "\t" || char === "," || char === "﻿") {
      index += 1;
      continue;
    }

    const startLine = line;
    const startColumn = columnAt(index);
    const start = index;

    if (char === "#") {
      index += 1;
      while (index < length && source[index] !== "\n" && source[index] !== "\r") {
        index += 1;
      }
      comments.push({
        value: source.slice(start + 1, index).trim(),
        line: startLine,
        column: startColumn,
        start,
        end: index,
      });
      continue;
    }

    if (char === '"') {
      if (source.startsWith('"""', index)) {
        index += 3;
        let raw = "";
        let closed = false;

        while (index < length) {
          if (source.startsWith('\\"""', index)) {
            raw += '"""';
            index += 4;
            continue;
          }

          if (source.startsWith('"""', index)) {
            index += 3;
            closed = true;
            break;
          }

          const current = source[index];
          if (current === "\n") {
            line += 1;
            lineStart = index + 1;
          }
          raw += current;
          index += 1;
        }

        if (!closed) {
          throw syntaxError(
            'Unterminated block string. Expected a closing """.',
            startLine,
            startColumn,
            3
          );
        }

        tokens.push({
          kind: "BlockString",
          value: dedentBlockString(raw),
          start,
          end: index,
          line: startLine,
          column: startColumn,
        });
        continue;
      }

      index += 1;
      let value = "";
      let closed = false;

      while (index < length) {
        const current = source[index];

        if (current === "\n" || current === "\r") {
          break;
        }

        if (current === '"') {
          index += 1;
          closed = true;
          break;
        }

        if (current === "\\") {
          const escaped = source[index + 1];

          if (escaped === "u") {
            const hex = source.slice(index + 2, index + 6);
            if (!/^[0-9A-Fa-f]{4}$/.test(hex)) {
              throw syntaxError(
                'Invalid unicode escape sequence. Expected four hex digits after "\\u".',
                line,
                columnAt(index),
                6
              );
            }
            value += String.fromCharCode(parseInt(hex, 16));
            index += 6;
            continue;
          }

          if (Object.prototype.hasOwnProperty.call(ESCAPES, escaped)) {
            value += ESCAPES[escaped];
            index += 2;
            continue;
          }

          throw syntaxError(
            `Invalid escape sequence "\\${escaped === undefined ? "" : escaped}" inside a string.`,
            line,
            columnAt(index),
            2
          );
        }

        value += current;
        index += 1;
      }

      if (!closed) {
        throw syntaxError(
          "Unterminated string. Expected a closing double quote.",
          startLine,
          startColumn,
          1
        );
      }

      tokens.push({
        kind: "String",
        value,
        start,
        end: index,
        line: startLine,
        column: startColumn,
      });
      continue;
    }

    if (char === "-" || isDigit(char)) {
      if (source[index] === "-") {
        index += 1;
      }

      if (source[index] === "0") {
        index += 1;
        if (isDigit(source[index])) {
          throw syntaxError(
            "Invalid number. A leading zero cannot be followed by another digit.",
            startLine,
            startColumn,
            2
          );
        }
      } else {
        if (!isDigit(source[index])) {
          throw syntaxError(
            "Invalid number. Expected a digit.",
            startLine,
            startColumn,
            1
          );
        }
        while (isDigit(source[index])) {
          index += 1;
        }
      }

      let isFloat = false;

      if (source[index] === ".") {
        isFloat = true;
        index += 1;
        if (!isDigit(source[index])) {
          throw syntaxError(
            "Invalid number. Expected a digit after the decimal point.",
            line,
            columnAt(index),
            1
          );
        }
        while (isDigit(source[index])) {
          index += 1;
        }
      }

      if (source[index] === "e" || source[index] === "E") {
        isFloat = true;
        index += 1;
        if (source[index] === "+" || source[index] === "-") {
          index += 1;
        }
        if (!isDigit(source[index])) {
          throw syntaxError(
            "Invalid number. Expected a digit in the exponent.",
            line,
            columnAt(index),
            1
          );
        }
        while (isDigit(source[index])) {
          index += 1;
        }
      }

      if (isNameStart(source[index])) {
        throw syntaxError(
          `Invalid number. "${source.slice(start, index + 1)}" cannot be followed by a letter.`,
          startLine,
          startColumn,
          index - start + 1
        );
      }

      tokens.push({
        kind: isFloat ? "Float" : "Int",
        value: source.slice(start, index),
        start,
        end: index,
        line: startLine,
        column: startColumn,
      });
      continue;
    }

    if (isNameStart(char)) {
      index += 1;
      while (index < length && isNameContinue(source[index])) {
        index += 1;
      }
      tokens.push({
        kind: "Name",
        value: source.slice(start, index),
        start,
        end: index,
        line: startLine,
        column: startColumn,
      });
      continue;
    }

    if (source.startsWith("...", index)) {
      index += 3;
      tokens.push({
        kind: "Punct",
        value: "...",
        start,
        end: index,
        line: startLine,
        column: startColumn,
      });
      continue;
    }

    if (char === ".") {
      throw syntaxError(
        'Unexpected ".". Did you mean the spread operator "..."?',
        startLine,
        startColumn,
        1
      );
    }

    if (PUNCTUATORS.has(char)) {
      index += 1;
      tokens.push({
        kind: "Punct",
        value: char,
        start,
        end: index,
        line: startLine,
        column: startColumn,
      });
      continue;
    }

    throw syntaxError(
      `Unexpected character "${char}".`,
      startLine,
      startColumn,
      1
    );
  }

  tokens.push({
    kind: "EOF",
    value: "",
    start: length,
    end: length,
    line,
    column: columnAt(length),
  });

  return { tokens, comments };
};

// --- Parser ----------------------------------------------------------------

const locOf = (token) => ({
  line: token.line,
  column: token.column,
  start: token.start,
  end: token.end,
});

const tokenLength = (token) => Math.max(1, token.end - token.start);

const describeToken = (token) => {
  if (token.kind === "EOF") {
    return "the end of the document";
  }
  if (token.kind === "String" || token.kind === "BlockString") {
    return "a string value";
  }
  return `"${token.value}"`;
};

const peek = (parser) => parser.tokens[parser.index];

const advance = (parser) => {
  const token = parser.tokens[parser.index];
  if (parser.index < parser.tokens.length - 1) {
    parser.index += 1;
  }
  return token;
};

const isPunct = (token, value) => token.kind === "Punct" && token.value === value;

const isKeyword = (token, value) => token.kind === "Name" && token.value === value;

const expectPunct = (parser, value) => {
  const token = peek(parser);
  if (!isPunct(token, value)) {
    throw syntaxError(
      `Expected "${value}" but found ${describeToken(token)}.`,
      token.line,
      token.column,
      tokenLength(token)
    );
  }
  return advance(parser);
};

const parseName = (parser, what = "a name") => {
  const token = peek(parser);
  if (token.kind !== "Name") {
    throw syntaxError(
      `Expected ${what} but found ${describeToken(token)}.`,
      token.line,
      token.column,
      tokenLength(token)
    );
  }
  advance(parser);
  return { kind: "Name", value: token.value, loc: locOf(token) };
};

const parseNamedType = (parser) => {
  const token = peek(parser);
  const name = parseName(parser, "a type name");
  return { kind: "NamedType", name, loc: locOf(token) };
};

const parseType = (parser, depth = 0) => {
  if (depth > MAX_TYPE_DEPTH) {
    const token = peek(parser);
    throw syntaxError(
      "This type is nested too deeply to analyze safely.",
      token.line,
      token.column
    );
  }

  const token = peek(parser);
  let type;

  if (isPunct(token, "[")) {
    advance(parser);
    const inner = parseType(parser, depth + 1);
    expectPunct(parser, "]");
    type = { kind: "ListType", type: inner, loc: locOf(token) };
  } else {
    type = parseNamedType(parser);
  }

  if (isPunct(peek(parser), "!")) {
    advance(parser);
    type = { kind: "NonNullType", type, loc: type.loc };
  }

  return type;
};

const parseValue = (parser, isConst) => {
  const token = peek(parser);

  if (isPunct(token, "$")) {
    advance(parser);
    const name = parseName(parser, "a variable name");
    if (isConst) {
      throw syntaxError(
        `Variable "$${name.value}" is not allowed here. Default values must be constant.`,
        token.line,
        token.column,
        name.loc.end - token.start
      );
    }
    return { kind: "Variable", name, loc: locOf(token) };
  }

  if (token.kind === "Int") {
    advance(parser);
    return { kind: "IntValue", value: token.value, loc: locOf(token) };
  }

  if (token.kind === "Float") {
    advance(parser);
    return { kind: "FloatValue", value: token.value, loc: locOf(token) };
  }

  if (token.kind === "String" || token.kind === "BlockString") {
    advance(parser);
    return {
      kind: "StringValue",
      value: token.value,
      block: token.kind === "BlockString",
      loc: locOf(token),
    };
  }

  if (token.kind === "Name") {
    advance(parser);
    if (token.value === "true" || token.value === "false") {
      return {
        kind: "BooleanValue",
        value: token.value === "true",
        loc: locOf(token),
      };
    }
    if (token.value === "null") {
      return { kind: "NullValue", loc: locOf(token) };
    }
    return { kind: "EnumValue", value: token.value, loc: locOf(token) };
  }

  if (isPunct(token, "[")) {
    advance(parser);
    const values = [];
    while (!isPunct(peek(parser), "]")) {
      if (peek(parser).kind === "EOF") {
        throw syntaxError(
          `Expected "]" to close the list opened at line ${token.line}, column ${token.column}.`,
          token.line,
          token.column
        );
      }
      values.push(parseValue(parser, isConst));
    }
    advance(parser);
    return { kind: "ListValue", values, loc: locOf(token) };
  }

  if (isPunct(token, "{")) {
    advance(parser);
    const fields = [];
    const seen = new Set();

    while (!isPunct(peek(parser), "}")) {
      if (peek(parser).kind === "EOF") {
        throw syntaxError(
          `Expected "}" to close the input object opened at line ${token.line}, column ${token.column}.`,
          token.line,
          token.column
        );
      }
      const fieldToken = peek(parser);
      const name = parseName(parser, "an input field name");
      if (seen.has(name.value)) {
        throw syntaxError(
          `Input field "${name.value}" is defined more than once in the same object.`,
          fieldToken.line,
          fieldToken.column,
          tokenLength(fieldToken)
        );
      }
      seen.add(name.value);
      expectPunct(parser, ":");
      const value = parseValue(parser, isConst);
      fields.push({ kind: "ObjectField", name, value, loc: locOf(fieldToken) });
    }

    advance(parser);
    return { kind: "ObjectValue", fields, loc: locOf(token) };
  }

  throw syntaxError(
    `Expected a value but found ${describeToken(token)}.`,
    token.line,
    token.column,
    tokenLength(token)
  );
};

const parseArguments = (parser, isConst) => {
  const open = expectPunct(parser, "(");
  const args = [];

  while (!isPunct(peek(parser), ")")) {
    const token = peek(parser);

    if (token.kind === "EOF") {
      throw syntaxError(
        `Expected ")" to close the argument list opened at line ${open.line}, column ${open.column}.`,
        open.line,
        open.column
      );
    }

    if (token.kind !== "Name") {
      throw syntaxError(
        `Expected another argument name or ")" to close the argument list opened at line ${open.line}, column ${open.column}, but found ${describeToken(token)}.`,
        token.line,
        token.column,
        tokenLength(token)
      );
    }

    const name = parseName(parser, "an argument name");
    expectPunct(parser, ":");
    const value = parseValue(parser, isConst);
    args.push({ kind: "Argument", name, value, loc: locOf(token) });
  }

  advance(parser);

  if (args.length === 0) {
    throw syntaxError(
      "An argument list cannot be empty. Remove the parentheses or add an argument.",
      open.line,
      open.column,
      2
    );
  }

  return args;
};

const parseDirectives = (parser, isConst) => {
  const directives = [];

  while (isPunct(peek(parser), "@")) {
    const at = advance(parser);
    const name = parseName(parser, "a directive name");
    const args = isPunct(peek(parser), "(") ? parseArguments(parser, isConst) : [];
    directives.push({
      kind: "Directive",
      name,
      arguments: args,
      loc: locOf(at),
    });
  }

  return directives;
};

const parseVariableDefinitions = (parser) => {
  const open = expectPunct(parser, "(");
  const definitions = [];

  while (!isPunct(peek(parser), ")")) {
    const token = peek(parser);

    if (token.kind === "EOF") {
      throw syntaxError(
        `Expected ")" to close the variable definitions opened at line ${open.line}, column ${open.column}.`,
        open.line,
        open.column
      );
    }

    if (!isPunct(token, "$")) {
      throw syntaxError(
        `Expected "$" to start another variable or ")" to close the list opened at line ${open.line}, column ${open.column}, but found ${describeToken(token)}.`,
        token.line,
        token.column,
        tokenLength(token)
      );
    }

    advance(parser);
    const name = parseName(parser, "a variable name");
    expectPunct(parser, ":");
    const type = parseType(parser);

    let defaultValue = null;
    if (isPunct(peek(parser), "=")) {
      advance(parser);
      defaultValue = parseValue(parser, true);
    }

    const directives = parseDirectives(parser, true);

    definitions.push({
      kind: "VariableDefinition",
      name,
      type,
      defaultValue,
      directives,
      loc: locOf(token),
    });
  }

  advance(parser);

  if (definitions.length === 0) {
    throw syntaxError(
      "A variable list cannot be empty. Remove the parentheses or declare a variable.",
      open.line,
      open.column,
      2
    );
  }

  return definitions;
};

const parseSelectionSet = (parser, depth) => {
  if (depth > MAX_DEPTH) {
    const token = peek(parser);
    throw syntaxError(
      "This query is nested too deeply to analyze safely.",
      token.line,
      token.column
    );
  }

  const open = expectPunct(parser, "{");
  const selections = [];

  while (!isPunct(peek(parser), "}")) {
    if (peek(parser).kind === "EOF") {
      throw syntaxError(
        `Expected "}" to close the selection set opened at line ${open.line}, column ${open.column}.`,
        open.line,
        open.column,
        1
      );
    }
    selections.push(parseSelection(parser, depth));
  }

  advance(parser);

  if (selections.length === 0) {
    throw syntaxError(
      "A selection set cannot be empty. Add at least one field between the braces.",
      open.line,
      open.column,
      1
    );
  }

  return { kind: "SelectionSet", selections, loc: locOf(open) };
};

function parseSelection(parser, depth) {
  const token = peek(parser);

  if (isPunct(token, "...")) {
    advance(parser);
    const next = peek(parser);

    if (isKeyword(next, "on")) {
      advance(parser);
      const typeCondition = parseNamedType(parser);
      const directives = parseDirectives(parser, false);
      const selectionSet = parseSelectionSet(parser, depth + 1);
      return {
        kind: "InlineFragment",
        typeCondition,
        directives,
        selectionSet,
        loc: locOf(token),
      };
    }

    if (next.kind === "Name") {
      const name = parseName(parser, "a fragment name");
      const directives = parseDirectives(parser, false);
      return {
        kind: "FragmentSpread",
        name,
        directives,
        loc: locOf(token),
      };
    }

    if (isPunct(next, "@") || isPunct(next, "{")) {
      const directives = parseDirectives(parser, false);
      const selectionSet = parseSelectionSet(parser, depth + 1);
      return {
        kind: "InlineFragment",
        typeCondition: null,
        directives,
        selectionSet,
        loc: locOf(token),
      };
    }

    throw syntaxError(
      `Expected a fragment name, "on", or a selection set after "..." but found ${describeToken(next)}.`,
      next.line,
      next.column,
      tokenLength(next)
    );
  }

  if (token.kind !== "Name") {
    throw syntaxError(
      `Expected a field name but found ${describeToken(token)}.`,
      token.line,
      token.column,
      tokenLength(token)
    );
  }

  let alias = null;
  let name = parseName(parser, "a field name");

  if (isPunct(peek(parser), ":")) {
    advance(parser);
    alias = name;
    name = parseName(parser, "a field name after the alias");
  }

  const args = isPunct(peek(parser), "(") ? parseArguments(parser, false) : [];
  const directives = parseDirectives(parser, false);
  const selectionSet = isPunct(peek(parser), "{")
    ? parseSelectionSet(parser, depth + 1)
    : null;

  return {
    kind: "Field",
    alias,
    name,
    arguments: args,
    directives,
    selectionSet,
    loc: locOf(token),
  };
}

const parseOperationDefinition = (parser) => {
  const keyword = advance(parser);
  const operation = keyword.value;

  let name = null;
  if (peek(parser).kind === "Name") {
    name = parseName(parser, "an operation name");
  }

  const variableDefinitions = isPunct(peek(parser), "(")
    ? parseVariableDefinitions(parser)
    : [];
  const directives = parseDirectives(parser, false);
  const selectionSet = parseSelectionSet(parser, 0);

  return {
    kind: "OperationDefinition",
    operation,
    name,
    variableDefinitions,
    directives,
    selectionSet,
    shorthand: false,
    loc: locOf(keyword),
  };
};

const parseFragmentDefinition = (parser) => {
  const keyword = advance(parser);
  const nameToken = peek(parser);

  if (isKeyword(nameToken, "on")) {
    throw syntaxError(
      'A fragment cannot be named "on".',
      nameToken.line,
      nameToken.column,
      tokenLength(nameToken)
    );
  }

  const name = parseName(parser, "a fragment name");
  const onToken = peek(parser);

  if (!isKeyword(onToken, "on")) {
    throw syntaxError(
      `Expected "on" after the fragment name but found ${describeToken(onToken)}.`,
      onToken.line,
      onToken.column,
      tokenLength(onToken)
    );
  }

  advance(parser);
  const typeCondition = parseNamedType(parser);
  const directives = parseDirectives(parser, false);
  const selectionSet = parseSelectionSet(parser, 0);

  return {
    kind: "FragmentDefinition",
    name,
    typeCondition,
    directives,
    selectionSet,
    loc: locOf(keyword),
  };
};

const parseDefinition = (parser) => {
  const token = peek(parser);

  if (isPunct(token, "{")) {
    const selectionSet = parseSelectionSet(parser, 0);
    return {
      kind: "OperationDefinition",
      operation: "query",
      name: null,
      variableDefinitions: [],
      directives: [],
      selectionSet,
      shorthand: true,
      loc: locOf(token),
    };
  }

  if (token.kind === "Name") {
    if (
      token.value === "query" ||
      token.value === "mutation" ||
      token.value === "subscription"
    ) {
      return parseOperationDefinition(parser);
    }

    if (token.value === "fragment") {
      return parseFragmentDefinition(parser);
    }

    if (SDL_KEYWORDS.has(token.value)) {
      throw syntaxError(
        `Schema definitions are not supported. This tool validates executable documents: queries, mutations, subscriptions, and fragments.`,
        token.line,
        token.column,
        tokenLength(token)
      );
    }

    throw syntaxError(
      `Unexpected name "${token.value}". Expected "query", "mutation", "subscription", "fragment", or a selection set starting with "{".`,
      token.line,
      token.column,
      tokenLength(token)
    );
  }

  throw syntaxError(
    `Unexpected ${describeToken(token)}. A document must start with an operation or a fragment definition.`,
    token.line,
    token.column,
    tokenLength(token)
  );
};

const parseDocument = (tokens) => {
  const parser = { tokens, index: 0 };
  const definitions = [];

  while (peek(parser).kind !== "EOF") {
    definitions.push(parseDefinition(parser));
  }

  if (definitions.length === 0) {
    throw syntaxError(
      "Expected an operation or a fragment definition.",
      1,
      1
    );
  }

  return { kind: "Document", definitions };
};

// --- Validation ------------------------------------------------------------

const diagnosticFromLoc = (severity, message, loc) =>
  makeDiagnostic(
    severity,
    message,
    loc.line,
    loc.column,
    Math.max(1, (loc.end || 0) - (loc.start || 0))
  );

const walkValueNode = (value, onVariable) => {
  if (!value) {
    return;
  }

  if (value.kind === "Variable") {
    onVariable(value);
    return;
  }

  if (value.kind === "ListValue") {
    value.values.forEach((item) => walkValueNode(item, onVariable));
    return;
  }

  if (value.kind === "ObjectValue") {
    value.fields.forEach((field) => walkValueNode(field.value, onVariable));
  }
};

const walkDirectives = (directives, onVariable) => {
  directives.forEach((directive) => {
    directive.arguments.forEach((argument) =>
      walkValueNode(argument.value, onVariable)
    );
  });
};

const scanSelectionSet = (selectionSet, result) => {
  const seenKeys = new Map();

  selectionSet.selections.forEach((selection) => {
    if (selection.kind === "Field") {
      const key = selection.alias ? selection.alias.value : selection.name.value;

      if (seenKeys.has(key)) {
        result.duplicateKeys.push({ key, node: selection });
      } else {
        seenKeys.set(key, selection);
      }

      selection.arguments.forEach((argument) =>
        walkValueNode(argument.value, (variable) =>
          result.variables.push(variable)
        )
      );
      walkDirectives(selection.directives, (variable) =>
        result.variables.push(variable)
      );

      if (selection.selectionSet) {
        scanSelectionSet(selection.selectionSet, result);
      }
      return;
    }

    if (selection.kind === "FragmentSpread") {
      result.spreads.push(selection);
      walkDirectives(selection.directives, (variable) =>
        result.variables.push(variable)
      );
      return;
    }

    walkDirectives(selection.directives, (variable) =>
      result.variables.push(variable)
    );
    scanSelectionSet(selection.selectionSet, result);
  });
};

const scanDefinition = (definition) => {
  const result = { variables: [], spreads: [], duplicateKeys: [] };

  walkDirectives(definition.directives, (variable) =>
    result.variables.push(variable)
  );
  scanSelectionSet(definition.selectionSet, result);
  return result;
};

const measureDepth = (selectionSet, depth = 1) => {
  let maxDepth = depth;

  selectionSet.selections.forEach((selection) => {
    if (selection.kind === "Field" && selection.selectionSet) {
      maxDepth = Math.max(maxDepth, measureDepth(selection.selectionSet, depth + 1));
    } else if (selection.kind === "InlineFragment") {
      maxDepth = Math.max(maxDepth, measureDepth(selection.selectionSet, depth));
    }
  });

  return maxDepth;
};

const countFields = (selectionSet) => {
  let total = 0;

  selectionSet.selections.forEach((selection) => {
    if (selection.kind === "Field") {
      total += 1;
      if (selection.selectionSet) {
        total += countFields(selection.selectionSet);
      }
    } else if (selection.kind === "InlineFragment") {
      total += countFields(selection.selectionSet);
    }
  });

  return total;
};

const findFragmentCycles = (fragmentScans, diagnostics) => {
  const visiting = new Set();
  const visited = new Set();

  const visit = (name, path) => {
    if (visiting.has(name)) {
      const cycle = [...path.slice(path.indexOf(name)), name].join(" -> ");
      diagnostics.push(
        diagnosticFromLoc(
          "error",
          `Fragment "${name}" spreads itself through the cycle ${cycle}.`,
          fragmentScans.get(name).definition.name.loc
        )
      );
      return;
    }

    if (visited.has(name) || !fragmentScans.has(name)) {
      return;
    }

    visiting.add(name);
    fragmentScans.get(name).scan.spreads.forEach((spread) => {
      visit(spread.name.value, [...path, name]);
    });
    visiting.delete(name);
    visited.add(name);
  };

  fragmentScans.forEach((_entry, name) => visit(name, []));
};

const validateDocument = (ast) => {
  const diagnostics = [];
  const operations = [];
  const fragmentScans = new Map();
  const scans = new Map();

  ast.definitions.forEach((definition) => {
    const scan = scanDefinition(definition);
    scans.set(definition, scan);

    scan.duplicateKeys.forEach(({ key, node }) => {
      diagnostics.push(
        diagnosticFromLoc(
          "error",
          `Field "${key}" is selected more than once in the same selection set. Use an alias to keep both.`,
          node.loc
        )
      );
    });

    if (definition.kind === "OperationDefinition") {
      operations.push(definition);
      return;
    }

    const name = definition.name.value;
    if (fragmentScans.has(name)) {
      diagnostics.push(
        diagnosticFromLoc(
          "error",
          `Fragment "${name}" is defined more than once.`,
          definition.name.loc
        )
      );
      return;
    }
    fragmentScans.set(name, { definition, scan });
  });

  const operationNames = new Set();
  operations.forEach((operation) => {
    if (!operation.name) {
      if (operations.length > 1) {
        diagnostics.push(
          diagnosticFromLoc(
            "error",
            "This document declares more than one operation, so every operation must have a name.",
            operation.loc
          )
        );
      }
      return;
    }

    if (operationNames.has(operation.name.value)) {
      diagnostics.push(
        diagnosticFromLoc(
          "error",
          `Operation "${operation.name.value}" is defined more than once.`,
          operation.name.loc
        )
      );
      return;
    }
    operationNames.add(operation.name.value);
  });

  scans.forEach((scan) => {
    scan.spreads.forEach((spread) => {
      if (!fragmentScans.has(spread.name.value)) {
        diagnostics.push(
          diagnosticFromLoc(
            "error",
            `Fragment "${spread.name.value}" is spread here but never defined.`,
            spread.name.loc
          )
        );
      }
    });
  });

  findFragmentCycles(fragmentScans, diagnostics);

  const usedFragments = new Set();

  operations.forEach((operation) => {
    const declared = new Map();

    operation.variableDefinitions.forEach((definition) => {
      const name = definition.name.value;
      if (declared.has(name)) {
        diagnostics.push(
          diagnosticFromLoc(
            "error",
            `Variable "$${name}" is declared more than once in this operation.`,
            definition.name.loc
          )
        );
        return;
      }
      declared.set(name, definition);
    });

    const reachable = new Set();
    const queue = [scans.get(operation)];
    const usages = [];

    while (queue.length > 0) {
      const scan = queue.shift();
      if (!scan) {
        continue;
      }

      scan.variables.forEach((variable) => usages.push(variable));

      scan.spreads.forEach((spread) => {
        const name = spread.name.value;
        if (reachable.has(name) || !fragmentScans.has(name)) {
          return;
        }
        reachable.add(name);
        usedFragments.add(name);
        queue.push(fragmentScans.get(name).scan);
      });
    }

    const usedNames = new Set();
    usages.forEach((variable) => {
      const name = variable.name.value;
      usedNames.add(name);

      if (!declared.has(name)) {
        diagnostics.push(
          diagnosticFromLoc(
            "error",
            `Variable "$${name}" is used but never declared${
              operation.name ? ` in operation "${operation.name.value}"` : ""
            }.`,
            variable.loc
          )
        );
      }
    });

    declared.forEach((definition, name) => {
      if (!usedNames.has(name)) {
        diagnostics.push(
          diagnosticFromLoc(
            "warning",
            `Variable "$${name}" is declared but never used.`,
            definition.name.loc
          )
        );
      }
    });

    const depth = measureDepth(operation.selectionSet);
    if (depth > DEPTH_WARNING_THRESHOLD) {
      diagnostics.push(
        diagnosticFromLoc(
          "warning",
          `This operation nests ${depth} levels deep, which can be expensive to resolve.`,
          operation.loc
        )
      );
    }
  });

  fragmentScans.forEach(({ definition }, name) => {
    if (!usedFragments.has(name)) {
      diagnostics.push(
        diagnosticFromLoc(
          "warning",
          `Fragment "${name}" is defined but never spread by any operation.`,
          definition.name.loc
        )
      );
    }
  });

  diagnostics.sort((a, b) => a.line - b.line || a.column - b.column);
  return diagnostics;
};

const collectStats = (ast) => {
  let operations = 0;
  let fragments = 0;
  let fields = 0;
  let variables = 0;
  let maxDepth = 0;

  ast.definitions.forEach((definition) => {
    if (definition.kind === "OperationDefinition") {
      operations += 1;
      variables += definition.variableDefinitions.length;
    } else {
      fragments += 1;
    }

    fields += countFields(definition.selectionSet);
    maxDepth = Math.max(maxDepth, measureDepth(definition.selectionSet));
  });

  return { operations, fragments, fields, variables, maxDepth };
};

// --- Printer ---------------------------------------------------------------

const printBlockString = (value, pad, indentUnit) => {
  const body = value
    .split("\n")
    .map((line) => (line.length > 0 ? pad + indentUnit + line : ""))
    .join("\n");
  return `"""\n${body}\n${pad}"""`;
};

const printValue = (node, pad, opts) => {
  switch (node.kind) {
    case "Variable":
      return `$${node.name.value}`;
    case "IntValue":
    case "FloatValue":
    case "EnumValue":
      return node.value;
    case "BooleanValue":
      return node.value ? "true" : "false";
    case "NullValue":
      return "null";
    case "StringValue":
      if (node.block && !opts.minify && node.value.includes("\n")) {
        return printBlockString(node.value, pad, opts.indentUnit);
      }
      return JSON.stringify(node.value);
    case "ListValue": {
      const items = node.values.map((item) => printValue(item, pad, opts));
      return opts.minify ? `[${items.join(",")}]` : `[${items.join(", ")}]`;
    }
    case "ObjectValue": {
      if (node.fields.length === 0) {
        return "{}";
      }
      const items = node.fields.map(
        (field) =>
          `${field.name.value}${opts.minify ? ":" : ": "}${printValue(
            field.value,
            pad,
            opts
          )}`
      );
      return opts.minify ? `{${items.join(",")}}` : `{ ${items.join(", ")} }`;
    }
    default:
      return "";
  }
};

const printType = (node) => {
  if (node.kind === "NamedType") {
    return node.name.value;
  }
  if (node.kind === "ListType") {
    return `[${printType(node.type)}]`;
  }
  return `${printType(node.type)}!`;
};

const printArgument = (argument, pad, opts) =>
  `${argument.name.value}${opts.minify ? ":" : ": "}${printValue(
    argument.value,
    pad,
    opts
  )}`;

const printArgumentList = (args, pad, opts) => {
  if (args.length === 0) {
    return "";
  }
  const items = args.map((argument) => printArgument(argument, pad, opts));
  return opts.minify ? `(${items.join(",")})` : `(${items.join(", ")})`;
};

const printDirectiveList = (directives, pad, opts) => {
  if (directives.length === 0) {
    return "";
  }
  return directives
    .map(
      (directive) =>
        `${opts.minify ? "" : " "}@${directive.name.value}${printArgumentList(
          directive.arguments,
          pad,
          opts
        )}`
    )
    .join("");
};

const printVariableDefinition = (definition, pad, opts) => {
  const base = `$${definition.name.value}${opts.minify ? ":" : ": "}${printType(
    definition.type
  )}`;
  const fallback = definition.defaultValue
    ? `${opts.minify ? "=" : " = "}${printValue(definition.defaultValue, pad, opts)}`
    : "";
  return `${base}${fallback}${printDirectiveList(definition.directives, pad, opts)}`;
};

const printMinified = (ast) => {
  const opts = { minify: true, indentUnit: "" };

  const printSelectionSetCompact = (selectionSet) =>
    `{${selectionSet.selections.map(printSelectionCompact).join(" ")}}`;

  function printSelectionCompact(selection) {
    if (selection.kind === "FragmentSpread") {
      return `...${selection.name.value}${printDirectiveList(
        selection.directives,
        "",
        opts
      )}`;
    }

    if (selection.kind === "InlineFragment") {
      const condition = selection.typeCondition
        ? ` on ${selection.typeCondition.name.value}`
        : "";
      return `...${condition}${printDirectiveList(
        selection.directives,
        "",
        opts
      )}${printSelectionSetCompact(selection.selectionSet)}`;
    }

    const alias = selection.alias ? `${selection.alias.value}:` : "";
    const nested = selection.selectionSet
      ? printSelectionSetCompact(selection.selectionSet)
      : "";
    return `${alias}${selection.name.value}${printArgumentList(
      selection.arguments,
      "",
      opts
    )}${printDirectiveList(selection.directives, "", opts)}${nested}`;
  }

  return ast.definitions
    .map((definition) => {
      if (definition.kind === "FragmentDefinition") {
        return `fragment ${definition.name.value} on ${
          definition.typeCondition.name.value
        }${printDirectiveList(
          definition.directives,
          "",
          opts
        )}${printSelectionSetCompact(definition.selectionSet)}`;
      }

      if (definition.shorthand) {
        return printSelectionSetCompact(definition.selectionSet);
      }

      const name = definition.name ? ` ${definition.name.value}` : "";
      const variables =
        definition.variableDefinitions.length > 0
          ? `(${definition.variableDefinitions
              .map((variable) => printVariableDefinition(variable, "", opts))
              .join(",")})`
          : "";
      return `${definition.operation}${name}${variables}${printDirectiveList(
        definition.directives,
        "",
        opts
      )}${printSelectionSetCompact(definition.selectionSet)}`;
    })
    .join(" ");
};

const printDocument = (ast, comments, options) => {
  const indent = options.indent || 2;
  const indentUnit = " ".repeat(indent);
  const opts = { minify: false, indentUnit };
  const lines = [];

  let commentIndex = 0;

  const flushBefore = (line, pad) => {
    while (commentIndex < comments.length && comments[commentIndex].line < line) {
      const comment = comments[commentIndex];
      lines.push(comment.value ? `${pad}# ${comment.value}` : `${pad}#`);
      commentIndex += 1;
    }
  };

  const attachTrailing = (line) => {
    if (
      commentIndex < comments.length &&
      comments[commentIndex].line === line &&
      lines.length > 0
    ) {
      const comment = comments[commentIndex];
      lines[lines.length - 1] += comment.value ? ` # ${comment.value}` : " #";
      commentIndex += 1;
    }
  };

  const printSelections = (selectionSet, level) => {
    selectionSet.selections.forEach((selection) =>
      printSelection(selection, level)
    );
  };

  function printSelection(selection, level) {
    const pad = indentUnit.repeat(level);
    flushBefore(selection.loc.line, pad);

    if (selection.kind === "FragmentSpread") {
      lines.push(
        `${pad}...${selection.name.value}${printDirectiveList(
          selection.directives,
          pad,
          opts
        )}`
      );
      attachTrailing(selection.loc.line);
      return;
    }

    if (selection.kind === "InlineFragment") {
      const condition = selection.typeCondition
        ? ` on ${selection.typeCondition.name.value}`
        : "";
      lines.push(
        `${pad}...${condition}${printDirectiveList(
          selection.directives,
          pad,
          opts
        )} {`
      );
      attachTrailing(selection.loc.line);
      printSelections(selection.selectionSet, level + 1);
      lines.push(`${pad}}`);
      return;
    }

    const alias = selection.alias ? `${selection.alias.value}: ` : "";
    const head = `${pad}${alias}${selection.name.value}`;
    const directives = printDirectiveList(selection.directives, pad, opts);
    const openBrace = selection.selectionSet ? " {" : "";
    const inlineArgs = printArgumentList(selection.arguments, pad, opts);
    const singleLine = `${head}${inlineArgs}${directives}${openBrace}`;

    if (
      selection.arguments.length > 0 &&
      singleLine.length > MAX_LINE_WIDTH &&
      !inlineArgs.includes("\n")
    ) {
      lines.push(`${head}(`);
      selection.arguments.forEach((argument) => {
        lines.push(`${pad}${indentUnit}${printArgument(argument, pad + indentUnit, opts)}`);
      });
      lines.push(`${pad})${directives}${openBrace}`);
    } else {
      lines.push(singleLine);
    }

    attachTrailing(selection.loc.line);

    if (selection.selectionSet) {
      printSelections(selection.selectionSet, level + 1);
      lines.push(`${pad}}`);
    }
  }

  ast.definitions.forEach((definition, definitionIndex) => {
    if (definitionIndex > 0) {
      lines.push("");
    }

    flushBefore(definition.loc.line, "");

    if (definition.kind === "FragmentDefinition") {
      lines.push(
        `fragment ${definition.name.value} on ${
          definition.typeCondition.name.value
        }${printDirectiveList(definition.directives, "", opts)} {`
      );
      attachTrailing(definition.loc.line);
      printSelections(definition.selectionSet, 1);
      lines.push("}");
      return;
    }

    if (definition.shorthand) {
      lines.push("{");
      attachTrailing(definition.loc.line);
      printSelections(definition.selectionSet, 1);
      lines.push("}");
      return;
    }

    const name = definition.name ? ` ${definition.name.value}` : "";
    const head = `${definition.operation}${name}`;
    const directives = printDirectiveList(definition.directives, "", opts);
    const inlineVariables =
      definition.variableDefinitions.length > 0
        ? `(${definition.variableDefinitions
            .map((variable) => printVariableDefinition(variable, "", opts))
            .join(", ")})`
        : "";
    const singleLine = `${head}${inlineVariables}${directives} {`;

    if (
      definition.variableDefinitions.length > 0 &&
      singleLine.length > MAX_LINE_WIDTH
    ) {
      lines.push(`${head}(`);
      definition.variableDefinitions.forEach((variable) => {
        lines.push(
          `${indentUnit}${printVariableDefinition(variable, indentUnit, opts)}`
        );
      });
      lines.push(`)${directives} {`);
    } else {
      lines.push(singleLine);
    }

    attachTrailing(definition.loc.line);
    printSelections(definition.selectionSet, 1);
    lines.push("}");
  });

  while (commentIndex < comments.length) {
    const comment = comments[commentIndex];
    lines.push(comment.value ? `# ${comment.value}` : "#");
    commentIndex += 1;
  }

  return lines.join("\n");
};

// --- Fix Hints -------------------------------------------------------------

const FIX_HINTS = [
  // Fragments
  [
    /^Fragment "(.+?)" is spread here but never defined/,
    (m) => `Add the missing definition, for example: fragment ${m[1]} on TypeName { ... }`,
  ],
  [
    /^Fragment "(.+?)" is defined but never spread/,
    (m) => `Use it inside an operation with ...${m[1]}, or delete the fragment.`,
  ],
  [
    /^Fragment "(.+?)" is defined more than once/,
    (m) => `Rename one of them so each fragment name is unique, for example ${m[1]}2.`,
  ],
  [
    /^Fragment "(.+?)" spreads itself/,
    (m) => `Remove one spread in that chain so ${m[1]} no longer includes itself.`,
  ],
  [/^A fragment cannot be named "on"/, 'Pick another name, for example: fragment Details on TypeName { ... }'],
  [
    /^Expected "on" after the fragment name/,
    'A fragment definition reads: fragment Name on TypeName { field }',
  ],

  // Variables
  [
    /^Variable "(\$[^"]+)" is used but never declared/,
    (m) => `Declare it in the operation header, for example: query Name(${m[1]}: String!) { ... }`,
  ],
  [
    /^Variable "(\$[^"]+)" is declared but never used/,
    (m) => `Remove ${m[1]} from the header, or use it in an argument such as field(arg: ${m[1]}).`,
  ],
  [
    /^Variable "(\$[^"]+)" is declared more than once/,
    (m) => `Delete the duplicate ${m[1]} from the operation header.`,
  ],
  [
    /^Variable "(\$[^"]+)" is not allowed here/,
    (m) => `Default values must be literals. Use something like = 10, or drop the default and pass ${m[1]} at runtime.`,
  ],
  [
    /^Expected "\$" to start another variable/,
    'Variables start with a dollar sign, for example: ($id: ID!, $limit: Int)',
  ],
  [
    /^A variable list cannot be empty/,
    'Either delete the empty () after the operation name, or declare a variable such as ($id: ID!).',
  ],

  // Operations and documents
  [
    /^Operation "(.+?)" is defined more than once/,
    (m) => `Rename one of them so each operation name is unique, for example ${m[1]}2.`,
  ],
  [
    /^This document declares more than one operation/,
    'Give the operation a name, for example: query GetUser { ... }',
  ],
  [
    /^Schema definitions are not supported/,
    'Paste an executable document instead, such as query { field }. Type definitions belong in a schema file.',
  ],
  [
    /^Unexpected name "(.+?)"\. Expected "query"/,
    (m) => `Replace "${m[1]}" with query, mutation, subscription or fragment, or start the document with a bare { ... } selection.`,
  ],
  [
    /^Unexpected .+\. A document must start with an operation/,
    'Start the document with query, mutation, subscription, fragment, or a bare { ... } selection.',
  ],
  [/^Expected an operation or a fragment definition/, 'Add something to format, for example: { user { id } }'],

  // Fields and selection sets
  [
    /^Field "(.+?)" is selected more than once/,
    (m) => `Alias one of them so both survive, for example: ${m[1]}Copy: ${m[1]}`,
  ],
  [
    /^A selection set cannot be empty/,
    'Add at least one field between the braces, for example { id }, or remove the braces.',
  ],
  [
    /^Expected "}" to close the selection set opened at line (\d+), column (\d+)/,
    (m) => `Add a closing } for the block opened at line ${m[1]}, column ${m[2]}.`,
  ],
  [
    /^Expected a fragment name, "on", or a selection set after/,
    'Finish the spread, for example ...FragmentName or ... on TypeName { id }.',
  ],
  [
    /^Expected a field name(?! after)/,
    'A field name starts with a letter or underscore, for example: id, userName, _internal.',
  ],
  [/^Expected a field name after the alias/, 'An alias reads alias: realField, for example: fullName: name'],
  [
    /^This operation nests (\d+) levels deep/,
    'Split the query or move the deeper parts into fragments to keep it cheap to resolve.',
  ],
  [/^This query is nested too deeply/, 'Reduce the nesting depth, or format the query in smaller pieces.'],

  // Arguments and values
  [
    /^Expected another argument name or "\)" to close the argument list opened at line (\d+), column (\d+)/,
    (m) => `Add the closing ) for the argument list opened at line ${m[1]}, column ${m[2]}.`,
  ],
  [
    /^Expected "\)" to close the argument list opened at line (\d+), column (\d+)/,
    (m) => `Add the closing ) for the argument list opened at line ${m[1]}, column ${m[2]}.`,
  ],
  [
    /^Expected "\)" to close the variable definitions opened at line (\d+), column (\d+)/,
    (m) => `Add the closing ) for the variable list opened at line ${m[1]}, column ${m[2]}.`,
  ],
  [
    /^An argument list cannot be empty/,
    'Either delete the empty (), or pass an argument such as (id: 1).',
  ],
  [
    /^Input field "(.+?)" is defined more than once/,
    (m) => `Remove the duplicate "${m[1]}" key from that input object.`,
  ],
  [
    /^Expected "\]" to close the list opened at line (\d+), column (\d+)/,
    (m) => `Add the closing ] for the list opened at line ${m[1]}, column ${m[2]}.`,
  ],
  [
    /^Expected "}" to close the input object opened at line (\d+), column (\d+)/,
    (m) => `Add the closing } for the input object opened at line ${m[1]}, column ${m[2]}.`,
  ],
  [
    /^Expected a value but found/,
    'Put a value after the colon, for example 1, "text", true, ENUM_VALUE, or $variable.',
  ],
  [/^Expected an argument name/, 'Arguments read name: value, for example: (first: 10)'],
  [/^Expected an input field name/, 'Input object keys read name: value, for example: { field: CREATED_AT }'],
  [/^Expected a variable name/, 'A name has to follow the dollar sign, for example: $id'],
  [/^Expected a type name/, 'Name the type after the colon, for example: $id: ID!'],
  [/^Expected a directive name/, 'Name the directive after the @, for example: @include(if: $flag)'],
  [/^Expected an operation name/, 'Name the operation, for example: query GetUser { ... }'],
  [/^Expected a fragment name/, 'Name the fragment, for example: fragment Details on User { id }'],
  [/^Expected ":" but found/, 'Separate the name and the value with a colon, for example: (id: 5)'],
  [/^Expected "\)" but found/, 'Close the bracket with a ) here.'],
  [/^Expected "\]" but found/, 'Close the bracket with a ] here.'],
  [/^Expected "{" but found/, 'Open the selection set with a { here.'],
  [/^Expected "}" but found/, 'Close the block with a } here.'],
  [/^Expected "\$" to start a variable definition/, 'Variables start with a dollar sign, for example: ($id: ID!)'],

  // Lexer level problems
  [/^Unterminated string/, 'Add the missing closing double quote at the end of this text.'],
  [/^Unterminated block string/, 'Close the block string with a matching """.'],
  [
    /^Invalid unicode escape sequence/,
    'A unicode escape needs four hex digits, for example \\u00e9.',
  ],
  [
    /^Invalid escape sequence/,
    'Inside strings only \\" \\\\ \\/ \\b \\f \\n \\r \\t and \\uXXXX are valid escapes.',
  ],
  [
    /^Invalid number\. "(.+?)" cannot be followed by a letter/,
    (m) => `Quote it if it is meant to be text, for example "${m[1]}", or remove the trailing letters.`,
  ],
  [/^Invalid number\. A leading zero/, 'Drop the leading zero, for example write 123 instead of 0123.'],
  [/^Invalid number/, 'Write a complete number, for example 10, -2.5 or 1e6.'],
  [
    /^Unexpected "\."\. Did you mean/,
    'A spread needs three dots, for example: ...FragmentName',
  ],
  [
    /^Unexpected character "(.+?)"/,
    (m) => `Remove the "${m[1]}" character. GraphQL has no operator or separator like it here.`,
  ],
  [/^This type is nested too deeply/, 'Simplify the type, for example [String!]! rather than deeply nested lists.'],
  [/^This document is too large/, 'Format the document in smaller pieces.'],
  [/^This document could not be parsed/, 'Try formatting a smaller part of the document to narrow the problem down.'],

  // Generic fallbacks
  [/^Expected /, 'Check the syntax at the marked position against the surrounding brackets and colons.'],
];

const hintFor = (message) => {
  for (let index = 0; index < FIX_HINTS.length; index += 1) {
    const [pattern, build] = FIX_HINTS[index];
    const match = pattern.exec(message);
    if (match) {
      return typeof build === "function" ? build(match) : build;
    }
  }
  return "";
};

const withHints = (diagnostics) =>
  diagnostics.map((diagnostic) => ({
    ...diagnostic,
    hint: hintFor(diagnostic.message),
  }));

// --- Entry Point -----------------------------------------------------------

const emptyResult = (status, diagnostics = []) => ({
  status,
  formatted: "",
  minified: "",
  diagnostics: withHints(diagnostics),
  stats: null,
});

const analyzeGraphql = (source, options = {}) => {
  if (typeof source !== "string" || source.trim() === "") {
    return emptyResult("empty");
  }

  try {
    const { tokens, comments } = tokenize(source);
    const ast = parseDocument(tokens);
    const diagnostics = validateDocument(ast);
    const formatted = printDocument(ast, comments, options);
    const minified = printMinified(ast);
    const stats = collectStats(ast);
    const hasErrors = diagnostics.some((item) => item.severity === "error");

    return {
      status: hasErrors ? "invalid" : "valid",
      formatted,
      minified,
      diagnostics: withHints(diagnostics),
      stats,
    };
  } catch (error) {
    if (error && error.gqlDiagnostic) {
      return emptyResult("invalid", [error.gqlDiagnostic]);
    }

    console.error("GraphQL formatter failed unexpectedly", error);
    return emptyResult("invalid", [
      makeDiagnostic(
        "error",
        "This document could not be parsed. Check the console for details.",
        1,
        1
      ),
    ]);
  }
};

// --- Syntax Highlighting ---------------------------------------------------

const OPERATION_KEYWORDS = new Set(["query", "mutation", "subscription"]);
const CONSTANT_NAMES = new Set(["true", "false", "null"]);
const HIGHLIGHT_LIMIT = 20000;

const classifyTokens = (tokens) => {
  const kinds = new Array(tokens.length).fill("plain");

  let parenDepth = 0;
  let varDefsDepth = -1;
  let pendingHeader = false;
  let afterOn = false;
  let afterFragment = false;
  let afterSpread = false;
  let typePosition = false;

  tokens.forEach((token, index) => {
    const prev = index > 0 ? tokens[index - 1] : null;
    const next = tokens[index + 1] || null;
    const atDefinitionStart =
      prev === null || (prev.kind === "Punct" && prev.value === "}");

    if (token.kind === "String" || token.kind === "BlockString") {
      kinds[index] = "string";
      return;
    }

    if (token.kind === "Int" || token.kind === "Float") {
      kinds[index] = "number";
      return;
    }

    if (token.kind === "Punct") {
      kinds[index] = "punct";

      switch (token.value) {
        case "$":
          kinds[index] = "variable";
          typePosition = false;
          break;
        case "@":
          kinds[index] = "directive";
          break;
        case "(":
          parenDepth += 1;
          if (pendingHeader && varDefsDepth < 0) {
            varDefsDepth = parenDepth;
          }
          pendingHeader = false;
          break;
        case ")":
          if (varDefsDepth === parenDepth) {
            varDefsDepth = -1;
            typePosition = false;
          }
          parenDepth = Math.max(0, parenDepth - 1);
          break;
        case ":":
          if (varDefsDepth >= 0) {
            typePosition = true;
          }
          break;
        case "=":
          typePosition = false;
          break;
        case "{":
          pendingHeader = false;
          typePosition = false;
          break;
        case "...":
          afterSpread = true;
          break;
        default:
          break;
      }
      return;
    }

    if (afterFragment) {
      kinds[index] = "type";
      afterFragment = false;
      return;
    }

    if (
      token.value === "on" &&
      prev &&
      (prev.kind === "Name" || (prev.kind === "Punct" && prev.value === "..."))
    ) {
      kinds[index] = "keyword";
      afterOn = true;
      afterSpread = false;
      return;
    }

    if (afterOn) {
      kinds[index] = "type";
      afterOn = false;
      return;
    }

    if (afterSpread) {
      kinds[index] = "type";
      afterSpread = false;
      return;
    }

    if (prev && prev.kind === "Punct" && prev.value === "$") {
      kinds[index] = "variable";
      return;
    }

    if (prev && prev.kind === "Punct" && prev.value === "@") {
      kinds[index] = "directive";
      return;
    }

    if (token.value === "fragment" && atDefinitionStart) {
      kinds[index] = "keyword";
      afterFragment = true;
      return;
    }

    if (OPERATION_KEYWORDS.has(token.value) && atDefinitionStart) {
      kinds[index] = "keyword";
      pendingHeader = true;
      return;
    }

    if (pendingHeader) {
      kinds[index] = "property";
      return;
    }

    if (typePosition) {
      kinds[index] = "type";
      return;
    }

    if (CONSTANT_NAMES.has(token.value)) {
      kinds[index] = "constant";
      return;
    }

    if (next && next.kind === "Punct" && next.value === ":") {
      kinds[index] = "property";
      return;
    }

    if (prev && prev.kind === "Punct" && prev.value === ":" && parenDepth > 0) {
      kinds[index] = "enum";
      return;
    }

    kinds[index] = "field";
  });

  return kinds;
};

const highlightGraphql = (code) => {
  if (typeof code !== "string" || code === "") {
    return [];
  }

  if (code.length > HIGHLIGHT_LIMIT) {
    return [{ text: code, kind: "plain" }];
  }

  try {
    const { tokens, comments } = tokenize(code);
    const real = tokens.filter((token) => token.kind !== "EOF");
    const kinds = classifyTokens(real);

    const pieces = real
      .map((token, index) => ({
        start: token.start,
        end: token.end,
        kind: kinds[index],
      }))
      .concat(
        comments.map((comment) => ({
          start: comment.start,
          end: comment.end,
          kind: "comment",
        }))
      )
      .sort((a, b) => a.start - b.start);

    const segments = [];
    let cursor = 0;

    pieces.forEach((piece) => {
      if (piece.start > cursor) {
        segments.push({ text: code.slice(cursor, piece.start), kind: "plain" });
      }
      segments.push({ text: code.slice(piece.start, piece.end), kind: piece.kind });
      cursor = piece.end;
    });

    if (cursor < code.length) {
      segments.push({ text: code.slice(cursor), kind: "plain" });
    }

    return segments;
  } catch {
    return [{ text: code, kind: "plain" }];
  }
};

// --- Theme & UI Helpers ----------------------------------------------------

const SAMPLE_QUERY = `# Fetch a profile with its most recent posts
query GetUserProfile($id: ID!, $limit: Int = 5, $withPosts: Boolean!) {
  user(id: $id) {
    id
    fullName: name
    email
    posts(first: $limit, orderBy: { field: CREATED_AT, direction: DESC }) @include(if: $withPosts) {
      edges {
        node {
          ...PostSummary
        }
      }
    }
  }
}

fragment PostSummary on Post {
  id
  title
  tags
  publishedAt
}`;

const SYNTAX_COLORS = {
  comment: "#6A9955",
  string: "#CE9178",
  number: "#B5CEA8",
  enum: "#B5CEA8",
  keyword: "#C586C0",
  constant: "#569CD6",
  type: "#4EC9B0",
  field: "#9CDCFE",
  property: "#DCDCAA",
  variable: "#4FC1FF",
  directive: "#D7BA7D",
  punct: "#8C8C8C",
};

const THEME = {
  light: {
    wrapper: "bg-[#F8F9FA] text-zinc-900",
    heading: "text-zinc-900",
    subtext: "text-zinc-500",
    card: "bg-white border-zinc-200/85 shadow-sm",
    input:
      "bg-zinc-50 border-zinc-200 text-zinc-900 focus-within:border-zinc-400",
    gutter: "bg-zinc-100/70 text-zinc-400 border-zinc-200",
    gutterError: "text-rose-600 font-bold",
    gutterWarn: "text-amber-600 font-bold",
    hint: "text-zinc-600",
    codeBox: "bg-zinc-900 text-zinc-100 border-zinc-800",
    activeBtn: "bg-zinc-900 text-white border-zinc-900",
    secondaryBtn:
      "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50 transition-all duration-200",
    backLink:
      "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-300",
    row: "border-zinc-200/80 hover:bg-zinc-50",
    snippet: "bg-zinc-50 text-zinc-600 border-zinc-200",
    okChip: "border-emerald-600/25 bg-emerald-600/10 text-emerald-700",
    errorChip: "border-rose-600/25 bg-rose-600/10 text-rose-700",
    warnChip: "border-amber-600/25 bg-amber-600/10 text-amber-700",
  },
  dark: {
    wrapper: "bg-[#090A0F] text-zinc-100",
    heading: "text-zinc-100",
    subtext: "text-zinc-500",
    card: "bg-zinc-900/50 border-zinc-800/85 backdrop-blur-md shadow-md",
    input:
      "bg-zinc-900 border-zinc-700 text-zinc-100 focus-within:border-zinc-500",
    gutter: "bg-zinc-950/50 text-zinc-600 border-zinc-800",
    gutterError: "text-rose-400 font-bold",
    gutterWarn: "text-amber-300 font-bold",
    hint: "text-zinc-400",
    codeBox: "bg-black/40 text-zinc-100 border-zinc-800/80",
    activeBtn: "bg-white text-zinc-900 border-white",
    secondaryBtn:
      "bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-200",
    backLink:
      "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600",
    row: "border-zinc-800/70 hover:bg-zinc-800/30",
    snippet: "bg-zinc-950/60 text-zinc-400 border-zinc-800",
    okChip: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    errorChip: "border-rose-400/25 bg-rose-400/10 text-rose-300",
    warnChip: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  },
};

const GUTTER_LINE_LIMIT = 2000;

const splitLines = (text) => text.split(/\r\n|\r|\n/);

const offsetFromPosition = (text, line, column) => {
  const lines = splitLines(text);
  let offset = 0;

  for (let i = 0; i < line - 1 && i < lines.length; i += 1) {
    offset += lines[i].length + 1;
  }

  return Math.min(offset + Math.max(0, column - 1), text.length);
};

// --- Main Component --------------------------------------------------------

const GraphqlFormatter = () => {
  const { dark } = useTheme();
  const t = dark ? THEME.dark : THEME.light;

  const [source, setSource] = useState("");
  const [debouncedSource, setDebouncedSource] = useState("");
  const [indentSize, setIndentSize] = useState(2);
  const [showMinified, setShowMinified] = useState(false);
  const inputRef = useRef(null);
  const gutterRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSource(source), 250);
    return () => clearTimeout(timer);
  }, [source]);

  const analysis = useMemo(
    () => analyzeGraphql(debouncedSource, { indent: indentSize }),
    [debouncedSource, indentSize]
  );

  const sourceLines = useMemo(() => splitLines(debouncedSource), [debouncedSource]);
  const lineCount = debouncedSource === "" ? 0 : sourceLines.length;

  const diagnosticLines = useMemo(() => {
    const map = new Map();
    analysis.diagnostics.forEach((diagnostic) => {
      if (map.get(diagnostic.line) !== "error") {
        map.set(diagnostic.line, diagnostic.severity);
      }
    });
    return map;
  }, [analysis]);

  const gutterLines = useMemo(() => {
    const total = Math.max(1, splitLines(source).length);

    if (total > GUTTER_LINE_LIMIT) {
      return [];
    }

    return Array.from({ length: total }, (_, index) => ({
      number: index + 1,
      severity: diagnosticLines.get(index + 1) || null,
    }));
  }, [source, diagnosticLines]);

  const showGutter = gutterLines.length > 0;

  const syncGutterScroll = (event) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = event.currentTarget.scrollTop;
    }
  };

  useEffect(() => {
    if (gutterRef.current && inputRef.current) {
      gutterRef.current.scrollTop = inputRef.current.scrollTop;
    }
  }, [source]);

  const errorCount = analysis.diagnostics.filter(
    (item) => item.severity === "error"
  ).length;
  const warningCount = analysis.diagnostics.length - errorCount;

  const output = showMinified ? analysis.minified : analysis.formatted;
  const highlighted = useMemo(() => highlightGraphql(output), [output]);

  const applyFormatted = () => {
    if (!analysis.formatted) {
      toast.error("Nothing to format yet. Fix the errors first.");
      return;
    }

    const next = showMinified ? analysis.minified : analysis.formatted;
    setSource(next);
    setDebouncedSource(next);
    toast.success(showMinified ? "Query minified" : "Query formatted");
  };

  const copyOutput = async () => {
    if (!output) {
      toast.error("There is no output to copy yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Clipboard access was blocked by the browser.");
    }
  };

  const loadSample = () => {
    setSource(SAMPLE_QUERY);
    setDebouncedSource(SAMPLE_QUERY);
    toast.success("Sample query loaded");
  };

  const clearAll = () => {
    setSource("");
    setDebouncedSource("");
  };

  const jumpTo = (diagnostic) => {
    const textarea = inputRef.current;
    if (!textarea) {
      return;
    }

    const offset = offsetFromPosition(source, diagnostic.line, diagnostic.column);
    textarea.focus();
    textarea.setSelectionRange(offset, offset);

    window.requestAnimationFrame(() => {
      if (gutterRef.current && inputRef.current) {
        gutterRef.current.scrollTop = inputRef.current.scrollTop;
      }
    });
  };

  const statusChip = () => {
    if (analysis.status === "empty") {
      return {
        className: t.snippet,
        icon: <FaRegLightbulb className="w-3.5 h-3.5" />,
        label: "Waiting for input",
      };
    }

    if (errorCount > 0) {
      return {
        className: t.errorChip,
        icon: <FaTimesCircle className="w-3.5 h-3.5" />,
        label: `${errorCount} error${errorCount === 1 ? "" : "s"}`,
      };
    }

    if (warningCount > 0) {
      return {
        className: t.warnChip,
        icon: <FaExclamationTriangle className="w-3.5 h-3.5" />,
        label: `Valid with ${warningCount} warning${warningCount === 1 ? "" : "s"}`,
      };
    }

    return {
      className: t.okChip,
      icon: <FaCheckCircle className="w-3.5 h-3.5" />,
      label: "Valid document",
    };
  };

  const status = statusChip();

  const toolbarButton = (active, extra = "") =>
    `inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide sm:tracking-widest border active:scale-95 ${
      active ? t.activeBtn : t.secondaryBtn
    } ${extra}`;

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-300 overflow-x-hidden ${t.wrapper}`}
    >
      <title>GraphQL Formatter &amp; Validator | DevTasks</title>
      <meta
        name="description"
        content="Format, minify, and validate GraphQL queries, mutations, and fragments offline with syntax and document checks."
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${t.backLink}`}
            title="Back to Utilities"
          >
            <FaArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1
              className={`text-xl sm:text-2xl font-semibold tracking-tight ${t.heading}`}
            >
              GraphQL Formatter &amp; Validator
            </h1>
            <p className={`mt-0.5 text-xs sm:text-sm ${t.subtext}`}>
              Beautify, minify, and check GraphQL documents. Fully offline, no
              schema upload, nothing leaves your browser.
            </p>
          </div>
        </div>

        {/* Toolbar and status */}
        <div className={`rounded-3xl border ${t.card} p-4 sm:p-5 mb-6`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <button
                type="button"
                onClick={applyFormatted}
                className={toolbarButton(true, "w-full sm:w-auto")}
                title="Rewrite the input with the formatted output"
              >
                <FaAlignLeft className="w-3.5 h-3.5" /> Format Input
              </button>

              <button
                type="button"
                onClick={() => setShowMinified((value) => !value)}
                className={toolbarButton(showMinified, "w-full sm:w-auto")}
                aria-pressed={showMinified}
                title="Toggle minified output"
              >
                <FaCompressAlt className="w-3.5 h-3.5" /> Minify
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:order-last sm:flex sm:items-center">
              <button
                type="button"
                onClick={loadSample}
                className={toolbarButton(false, "w-full sm:w-auto")}
                title="Load a sample query"
              >
                <FaRegLightbulb className="w-3.5 h-3.5" /> Sample
              </button>

              <button
                type="button"
                onClick={clearAll}
                className={toolbarButton(false, "w-full sm:w-auto")}
                title="Clear the editor"
              >
                <FaTrashAlt className="w-3.5 h-3.5" /> Clear
              </button>
            </div>

            <div className="flex items-center gap-2 sm:ml-auto">
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${t.subtext}`}
              >
                Indent
              </span>
              {[2, 4].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setIndentSize(size)}
                  className={toolbarButton(
                    indentSize === size,
                    "min-w-10 disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                  aria-pressed={indentSize === size}
                  disabled={showMinified}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-dashed border-zinc-300/40 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-widest ${status.className}`}
            >
              {status.icon}
              {status.label}
            </span>

            {analysis.stats && (
              <div
                className={`flex w-full flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium sm:w-auto ${t.subtext}`}
              >
                <span>
                  {analysis.stats.operations} operation
                  {analysis.stats.operations === 1 ? "" : "s"}
                </span>
                <span>
                  {analysis.stats.fragments} fragment
                  {analysis.stats.fragments === 1 ? "" : "s"}
                </span>
                <span>
                  {analysis.stats.fields} field
                  {analysis.stats.fields === 1 ? "" : "s"}
                </span>
                <span>
                  {analysis.stats.variables} variable
                  {analysis.stats.variables === 1 ? "" : "s"}
                </span>
                <span>depth {analysis.stats.maxDepth}</span>
              </div>
            )}
          </div>
        </div>

        {/* Editor and output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className={`rounded-3xl border ${t.card} p-4 sm:p-5`}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <p
                className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}
              >
                GraphQL Input
              </p>
              <span className={`text-[11px] font-medium ${t.subtext}`}>
                {lineCount} line{lineCount === 1 ? "" : "s"}
              </span>
            </div>

            <div
              className={`flex h-[340px] lg:h-[520px] rounded-2xl border overflow-hidden resize-y ${t.input}`}
            >
              {showGutter && (
                <div
                  ref={gutterRef}
                  aria-hidden="true"
                  className={`shrink-0 select-none overflow-hidden border-r py-3 pl-3 pr-2 min-w-11 text-right font-mono text-[13px] leading-relaxed ${t.gutter}`}
                >
                  {gutterLines.map((line) => (
                    <div
                      key={line.number}
                      className={
                        line.severity === "error"
                          ? t.gutterError
                          : line.severity === "warning"
                            ? t.gutterWarn
                            : undefined
                      }
                    >
                      {line.number}
                    </div>
                  ))}
                </div>
              )}

              <div className="relative flex-1 h-full">
                <textarea
                  ref={inputRef}
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  onScroll={syncGutterScroll}
                  spellCheck={false}
                  wrap="off"
                  placeholder="Enter your GraphQL code, and we'll format and validate it for you."
                  className="absolute inset-0 w-full h-full px-3 py-3 bg-transparent border-0 outline-none font-mono text-[13px] leading-relaxed resize-none overflow-auto placeholder-transparent"
                />

                {source === "" && (
                  <span
                    className={`pointer-events-none absolute inset-0 px-3 py-3 font-mono text-[13px] leading-relaxed ${t.subtext}`}
                  >
                    Enter your GraphQL code, and we&apos;ll format and validate
                    it for you.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={`rounded-3xl border ${t.card} p-4 sm:p-5`}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <p
                className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}
              >
                {showMinified ? "Minified Output" : "Formatted Output"}
              </p>
              <button
                type="button"
                onClick={copyOutput}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest border active:scale-95 ${t.secondaryBtn}`}
                title="Copy the output"
              >
                <FaCopy className="w-3 h-3" /> Copy
              </button>
            </div>

            <pre
              className={`w-full h-[340px] lg:h-[520px] px-4 py-3 rounded-2xl border font-mono text-[13px] leading-relaxed overflow-auto whitespace-pre ${t.codeBox}`}
            >
              {output ? (
                highlighted.map((segment, index) => (
                  <span
                    key={index}
                    style={
                      segment.kind === "plain"
                        ? undefined
                        : { color: SYNTAX_COLORS[segment.kind] }
                    }
                  >
                    {segment.text}
                  </span>
                ))
              ) : (
                <span className="block whitespace-pre-wrap text-zinc-500">
                  {analysis.status === "empty"
                    ? "Your formatted GraphQL will appear here."
                    : "Fix the errors below to see formatted output."}
                </span>
              )}
            </pre>
          </div>
        </div>

        {/* Diagnostics */}
        <div className={`rounded-3xl border ${t.card} p-4 sm:p-5 mt-6`}>
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <p
              className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}
            >
              Diagnostics
            </p>
            <span className={`text-[11px] font-medium ${t.subtext}`}>
              Syntax and document checks, no schema required
            </span>
          </div>

          {analysis.diagnostics.length === 0 ? (
            <p className={`text-sm ${t.subtext}`}>
              {analysis.status === "empty"
                ? "Nothing to check yet."
                : "No problems found in this document."}
            </p>
          ) : (
            <ul className="space-y-2">
              {analysis.diagnostics.map((diagnostic, index) => {
                const isError = diagnostic.severity === "error";
                const snippet = sourceLines[diagnostic.line - 1] || "";

                return (
                  <li key={`${diagnostic.line}-${diagnostic.column}-${index}`}>
                    <button
                      type="button"
                      onClick={() => jumpTo(diagnostic)}
                      className={`w-full text-left border rounded-2xl p-3 transition-colors ${t.row}`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${
                            isError ? t.errorChip : t.warnChip
                          }`}
                        >
                          {isError ? (
                            <FaTimesCircle className="w-3 h-3" />
                          ) : (
                            <FaExclamationTriangle className="w-3 h-3" />
                          )}
                          {isError ? "Error" : "Warning"}
                        </span>
                        <span
                          className={`font-mono text-[11px] font-semibold ${t.subtext}`}
                        >
                          line {diagnostic.line}:{diagnostic.column}
                        </span>
                        <span className={`text-sm ${t.heading}`}>
                          {diagnostic.message}
                        </span>
                      </div>

                      {snippet.trim() !== "" && (
                        <pre
                          className={`mt-2 px-3 py-2 rounded-xl border font-mono text-[11px] overflow-x-auto ${t.snippet}`}
                        >
                          {snippet}
                          {"\n"}
                          {" ".repeat(Math.max(0, diagnostic.column - 1))}
                          {"^".repeat(diagnostic.length)}
                        </pre>
                      )}

                      {diagnostic.hint && (
                        <span
                          className={`mt-2 flex items-start gap-2 text-xs leading-relaxed ${t.hint}`}
                        >
                          <FaRegLightbulb className="mt-0.5 w-3 h-3 shrink-0" />
                          <span>{diagnostic.hint}</span>
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphqlFormatter;
