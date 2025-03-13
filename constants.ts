export const COLORS = ["text-yellow", "text-purple", "text-blue"] as const;

export const HTML_ENTITY_MAP = {
  ">": "&gt",
  "<": "&lt",
} as const;

export const SYMBOL = {
  DOUBLE_QUOTE: '"',
  SINGLE_QUOTE: "'",
  BACK_TICK: "`",
  COLON: ":",
  SEMI_COLON: ";",
  PIPE: "|",
  AMPERSAND: "&",
  EQUAL: "=",
  COMMA: ",",
  LESS_THAN: "<",
  GREATER_THAN: ">",
  CURLY_BRACE_OPENING: "{",
  CURLY_BRACE_CLOSING: "}",
  SQUARE_BRACKET_OPENING: "[",
  SQUARE_BRACKET_CLOSING: "]",
  PARENTHESIS_OPENING: "(",
  PARENTHESIS_CLOSING: ")",
} as const;
