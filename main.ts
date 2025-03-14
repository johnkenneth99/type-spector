import { readFile, readFileSync } from "fs";
import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { COLORS, HTML_ENTITY_MAP, SYMBOL } from "./constants";
import { DeclarationKind } from "./enums";
import { keyofRegex, objectPropertyRegex, regexDictionary } from "./regex";
import { isBackTick, isKeyOf, isQuote, isSymbol } from "./utils";

/** TODO: Create unit tests for keywords and types being decoarted as object keys. Ex. { keyof: string, string: "Hi" }*/
/** TODO: Create unit tests for symbols,types and keywords not being decorated inside a string literal type. Ex. type MyType = " A <span> tag; number string keyof " */
/** TODO: Create unit tests for matching brackets and braces decorated with the same color. Ex: type Nested = {one: {two: {three: []}}}*/
/** TODO: Execute prettier command after declaration files has been emitted.*/
/** TODO: Read all files in declaration directory.*/
/** TODO: Decorate enum definition seperately.*/
/** FIXME: Optional `?` operater should be colored white. { name?: "Bob" }*/
type TestKind = "type" | "interface";

type TypeKind =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array"
  | "union"
  | "intersection"
  | "invalid";

type Type = {
  name: string;
  typeDefinition: string;
  typeKind: TypeKind;
  declarationKind: TestKind;
};

/** Represents the start and end index of the range respectively. */
type Range = [number, number];

/** All types are valid since we're using the tsc to emit the declaration files. */
const handleRequest = (request: IncomingMessage, response: ServerResponse) => {
  if (request.url === "/") {
    response.writeHead(200, { "Content-Type": "text/html" });
    /** Read emit declaration output directory. */
    readFile("./declaration/test.d.ts", { encoding: "utf-8" }, (err, data) => {
      const types: Type[] = [];

      const count = {
        typeAlias: 0,
        interface: 0,
        total: 0,
      };

      const matchedTypes: {
        tail: string;
        declarationKind: string;
        startIndex: number;
        typeName: string;
        substring: string;
        typeDefinition?: string;
      }[] = [];

      const types2: {
        tail: string;
        declarationKind: string;
        startIndex: number;
        typeName: string;
        substring: string;
        typeDefinition?: string;
      }[] = [];

      for (const key in regexDictionary) {
        const regex = regexDictionary[key as keyof typeof regexDictionary];

        const matches = data.matchAll(regex);

        for (const item of matches) {
          /** All regex will have 3 capture groups (1-3). */
          const [substring, declarationKind, typeName, tail] = item;
          matchedTypes.push({
            tail,
            declarationKind,
            typeName,
            substring,
            startIndex: item.index,
          });
        }
      }

      matchedTypes.sort((a, b) => a.startIndex - b.startIndex);

      for (let i = 0; i < matchedTypes.length; i++) {
        const { declarationKind, startIndex, substring, typeName } =
          matchedTypes[i];

        if (i < matchedTypes.length - 1) {
          matchedTypes[i].typeDefinition = data.slice(
            startIndex + substring.length,
            matchedTypes[i + 1].startIndex
          );
        } else {
          matchedTypes[i].typeDefinition = data.slice(
            startIndex + substring.length
          );
        }

        const de = declarationKind.split(" ");

        if (
          de.includes(DeclarationKind.ENUM) ||
          de.includes(DeclarationKind.INTERFACE) ||
          de.includes(DeclarationKind.TYPE_ALIAS)
        ) {
          types2.push(matchedTypes[i]);
        }
      }

      if (err) {
        response.end(err);
      }

      /** Decorate declaration. */
      const decorateTypeDefinitionPrefix = ({
        declarationKind,
        tail,
        typeName,
      }: {
        declarationKind: string;
        typeName: string;
        tail: string;
      }) => {
        const declarationKindParts = declarationKind
          .split(" ")
          .map((declaration) => {
            return `<span class="text-${declaration}-declaration">${declaration}</span>`;
          });

        const decoratedTypeName = `<span class="text-moderate-cyan">${typeName}</span>`;

        return [...declarationKindParts, decoratedTypeName + tail].join(" ");
      };

      let html2 = `
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <link rel="stylesheet" href="index.css">
        </head>
        <body>
        <main class="container">
        ${types2
          .map(
            (item) =>
              `<div class="type-container"><pre class="type-definition">${decorateTypeDefinitionPrefix(
                item
              )}${decorateTypeDefinition(item.typeDefinition!)}</pre></div>`
          )
          .join("")
          .trim()}
        </main>
        </body>
        </html>
      `;

      response.end(html2);
    });
    // const html = readFileSync("./index.html");
  } else {
    response.writeHead(200, { "Content-Type": "text/css" });
    const cssFile = readFileSync("./index.css");
    response.end(cssFile);
  }
};

const server = createServer(handleRequest);

server.listen({ port: 8000, host: "localhost" }, () => {
  console.info("Listening");
});

const decorateTypeDefinition = (typeDefinition: string): string => {
  let currentRange: Range = [-1, -1];
  const stringValueRanges: Range[] = [];
  const ranges: { range: Range; token: string; className?: string }[] = [];

  let stringOpening = "";
  /** Create unit test for this. */
  /** Don't forget to parse special characters first. */

  for (let i = 0; i < typeDefinition.length; i++) {
    const ch = typeDefinition[i];

    if (currentRange[0] === -1 && (isQuote(ch) || isBackTick(ch))) {
      currentRange[0] = i;
      stringOpening = ch;
    } else if (
      currentRange[0] !== -1 &&
      currentRange[1] === -1 &&
      stringOpening === ch
    ) {
      currentRange[1] = i;

      stringValueRanges.push(currentRange);
      currentRange = [-1, -1];
      stringOpening = "";
    } else if (ch === SYMBOL.LESS_THAN && !stringOpening) {
      ranges.push({
        range: [i, i],
        token: "html-entity",
        className: "text-lt-gt",
      });
    } else if (ch === SYMBOL.GREATER_THAN && !stringOpening) {
      ranges.push({
        range: [i, i],
        token: "html-entity",
        className: "text-lt-gt",
      });
    } else if (isSymbol(ch) && !stringOpening) {
      ranges.push({ range: [i, i], token: "symbol" });
    }
  }

  const regexs = [
    {
      regex: keyofRegex,
      token: "keyword",
      className: "text-moderate-blue",
    },
    {
      regex: objectPropertyRegex,
      token: "property",
      className: "text-soft-blue",
    },
  ];

  for (const entry of regexs) {
    const { className, regex, token } = entry;

    const matches = typeDefinition.matchAll(regex);

    matchIteration: for (const match of matches) {
      const [_, captureGroup] = match;
      const startIndex = match.index;
      const endIndex = match.index + captureGroup.length - 1;

      if (stringValueRanges) {
        /** Check if the matched string is inside a string literal type. */
        for (const range of stringValueRanges) {
          if (startIndex >= range[0] && startIndex <= range[1]) {
            continue matchIteration;
          }
        }
      }

      /** Check if `keyword` is an object property. */
      if (
        token === "keyword" &&
        typeDefinition[endIndex + 1] === SYMBOL.COLON
      ) {
        continue;
      }

      ranges.push({
        token,
        className,
        range: [startIndex, endIndex],
      });
    }
  }

  let whole = typeDefinition;

  /** Move this somewhere else? */
  for (const range of stringValueRanges) {
    ranges.push({ range, token: "string" });
  }

  /** Sort as we're gonna build a new string backwards. */
  ranges.sort((a, b) => a.range[0] - b.range[0]);

  type TSymbol = typeof SYMBOL;

  const curlyStack: (
    | TSymbol["CURLY_BRACE_CLOSING"]
    | TSymbol["CURLY_BRACE_OPENING"]
  )[] = [];

  const bracketStack: (
    | TSymbol["SQUARE_BRACKET_CLOSING"]
    | TSymbol["SQUARE_BRACKET_OPENING"]
  )[] = [];

  /** Actual decorating. */
  for (let i = ranges.length - 1; i >= 0; i--) {
    const { range, token, className } = ranges[i];

    type Token = "string" | "typeKind" | "property";

    const [left, value, right] = partitionString({
      range,
      string: typeDefinition,
    });

    let decoratedValue = "";

    /** TODO: Create token type. */
    switch (true) {
      case token === "string":
        decoratedValue = createSpan({
          value,
          className: "text-desaturated-orange",
        });
        break;

      case token === "typeKind":
        decoratedValue = createSpan({
          value,
          className: "text-moderate-cyan",
        });
        break;

      case token === "property":
        decoratedValue = createSpan({
          value,
          className: "text-soft-blue",
        });
        break;

      case token === "html-entity" && isKeyOf(HTML_ENTITY_MAP, value):
        decoratedValue = createSpan({
          value: HTML_ENTITY_MAP[value],
          className: "text-moderate-blue",
        });
        break;

      case token === "symbol" && value === SYMBOL.CURLY_BRACE_OPENING:
      case token === "symbol" && value === SYMBOL.CURLY_BRACE_CLOSING:
        {
          let className = "";

          if (value === SYMBOL.CURLY_BRACE_CLOSING) {
            curlyStack.push(value);
            className = COLORS[(curlyStack.length - 1) % COLORS.length];
          } else {
            className = COLORS[(curlyStack.length - 1) % COLORS.length];
            curlyStack.pop();
          }

          decoratedValue = createSpan({
            value,
            className,
          });
        }
        break;

      case token === "symbol" && value === SYMBOL.SQUARE_BRACKET_CLOSING:
      case token === "symbol" && value === SYMBOL.SQUARE_BRACKET_OPENING:
        {
          let className = "";

          if (value === SYMBOL.SQUARE_BRACKET_CLOSING) {
            bracketStack.push(value);
            className = COLORS[(bracketStack.length - 1) % COLORS.length];
          } else {
            className = COLORS[(bracketStack.length - 1) % COLORS.length];
            bracketStack.pop();
          }

          decoratedValue = createSpan({
            value,
            className,
          });
        }
        break;

      case token === "symbol" && value === SYMBOL.PARENTHESIS_CLOSING:
      case token === "symbol" && value === SYMBOL.PARENTHESIS_OPENING:
        decoratedValue = createSpan({
          value,
          className: "text-yellow",
        });
        break;

      case token === "symbol":
        decoratedValue = createSpan({
          value,
          className: "text-white",
        });
        break;

      case token === "keyword":
        decoratedValue = createSpan({
          value,
          className: "text-moderate-blue",
        });
        break;
    }

    typeDefinition = left + decoratedValue + right;
  }

  return typeDefinition;
};

type CreateSpanProps = {
  value: unknown;
  className: string;
};

const createSpan = ({ value, className }: CreateSpanProps): string => {
  return `<span class=${className}>${value}</span>`;
};

type PartitionStringProps = {
  range: Range;
  string: string;
};

const partitionString = ({
  range,
  string,
}: PartitionStringProps): [string, string, string] => {
  const [startIndex, endIndex]: Range = range;

  const value = string.slice(startIndex, endIndex + 1);
  const leftPartition = string.slice(0, startIndex);
  const rightPartition = string.slice(endIndex + 1);

  return [leftPartition, value, rightPartition];
};
