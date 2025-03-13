import { SYMBOL } from "./constants";

export const isKeyOf = <T extends Record<keyof any, unknown>>(
  obj: T,
  key: keyof any
): key is keyof T => Object.hasOwn(obj, key);

export const isSymbol = (ch: string): boolean => {
  for (const symbol of Object.values(SYMBOL)) {
    if (symbol === ch) return true;
  }

  return false;
};

export const isQuote = (ch: string) =>
  ch === SYMBOL.DOUBLE_QUOTE || ch === SYMBOL.SINGLE_QUOTE;

export const isBackTick = (ch: string) => ch === SYMBOL.BACK_TICK;
