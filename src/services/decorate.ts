import {
  commentRegex,
  keywordRegex,
  optionalPropertyRegex,
  requiredPropertyRegex,
} from "../regex.js";
import { COLORS, HTML_ENTITY_MAP, SYMBOL } from "../constants.js";
import { Keyword } from "../enums.js";
import { isBackTick, isKeyOf, isQuote, isSymbol } from "../utils.js";

/** Represents the start and end index of the range respectively. */
type Range = [number, number];

type Token =
  | "string"
  | "typeKind"
  | "property"
  | "html-entity"
  | "symbol"
  | "js-doc"
  | "keyword";

export const decorateTypeDefinition = (typeDefinition: string): string => {
  let currentRange: Range = [-1, -1];
  const stringValueRanges: Range[] = [];
  const ranges: { range: Range; token: Token; className?: string }[] = [];

  let stringOpening = "";

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
      });
    } else if (ch === SYMBOL.GREATER_THAN && !stringOpening) {
      ranges.push({
        range: [i, i],
        token: "html-entity",
      });
    } else if (isSymbol(ch) && !stringOpening) {
      ranges.push({ range: [i, i], token: "symbol" });
    }
  }

  type RegexList = {
    regex: RegExp;
    token: Token;
  }[];

  const regexs: RegexList = [
    {
      regex: keywordRegex,
      token: "keyword",
    },
    {
      regex: requiredPropertyRegex,
      token: "property",
    },
    {
      regex: optionalPropertyRegex,
      token: "property",
    },
    {
      regex: commentRegex,
      token: "js-doc",
    },
  ];

  for (const entry of regexs) {
    const { regex, token } = entry;

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
        range: [startIndex, endIndex],
      });
    }
  }

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

    const [left, value, right] = partitionString({
      range,
      string: typeDefinition,
    });

    let decoratedValue = "";

    switch (true) {
      case token === "string":
        decoratedValue = createSpan({
          value,
          className: "text-desaturated-orange",
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

      case token === "keyword" && value === Keyword.Export:
        decoratedValue = createSpan({
          value,
          className: "text-export-keyword",
        });
        break;

      case token === "keyword":
        decoratedValue = createSpan({
          value,
          className: "text-moderate-blue",
        });
        break;

      case token === "js-doc":
        decoratedValue = createSpan({
          value,
          className: "text-green",
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
