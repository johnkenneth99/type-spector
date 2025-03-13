export const typeAliasRegex = /(\btype\b|\bexport type\b)\s(\S+)(\s=\s)/g;

export const interfaceRegex =
  /(\bexport\sinterface\b|\binterface\b)\s(\S+)(\s)/g;

export const enumRegex =
  /(\bexport\sdeclare\senum\b|\bdeclare\senum\b)\s(\S+)(\s)/g;

/** Break this into function type and assignment. */
export const declareRegex =
  /(\bexport\sdeclare\sconst\b|\bdeclare\sconst\b)\s(\S+)/g;

export const defaultExportRegex = /(\bexport\sdefault\b)\s(\S+)/g;

export const objectPropertyRegex = /(\S+):/g;

export const keyofRegex = /(\bkeyof\b)/g;

export const regexDictionary = {
  typeAliasRegex,
  declareRegex,
  defaultExportRegex,
  interfaceRegex,
  enumRegex,
};
