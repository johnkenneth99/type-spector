import { SYMBOL } from "./constants.js";
import { DeclarationKind } from "./enums.js";

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

export const isQuote = (ch: string): boolean =>
  ch === SYMBOL.DOUBLE_QUOTE || ch === SYMBOL.SINGLE_QUOTE;

export const isBackTick = (ch: string): boolean => ch === SYMBOL.BACK_TICK;

export const isDeclarationKind = (value: string): value is DeclarationKind => {
  return (
    value === DeclarationKind.ENUM ||
    value === DeclarationKind.INTERFACE ||
    value === DeclarationKind.TYPE_ALIAS ||
    value === DeclarationKind.CONSTANT
  );
};

export const decorateTypeDefinitionPrefix = ({
  declarationKind,
  tail,
  typeName,
}: {
  declarationKind: string;
  typeName: string;
  tail: string;
}) => {
  const declarationKindParts = declarationKind.split(" ").map((declaration) => {
    return `<span class="text-${declaration}-declaration">${declaration}</span>`;
  });

  const decoratedTypeName = `<span class="text-moderate-cyan">${typeName}</span>`;

  return [...declarationKindParts, decoratedTypeName + tail].join(" ");
};
