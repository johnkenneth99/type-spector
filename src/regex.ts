export const typeAliasRegex = /(\btype\b|\bexport type\b)\s(.+)(\s=\s)/g;

export const interfaceRegex =
  /(\bexport\sinterface\b|\binterface\b)\s(\S+)(\s)/g;

export const enumRegex =
  /(\bexport\sdeclare\senum\b|\bdeclare\senum\b)\s(\S+)(\s)/g;

/** Break this into function type and assignment. */
export const declareRegex =
  /(\bexport\sdeclare\sconst\b|\bdeclare\sconst\b)\s(\S+)/g;

export const defaultExportRegex = /(\bexport\sdefault\b)\s(\S+)/g;

/** Get the name of the property in capture group 1. Ignore the : in the syntax as it'll be decorated differently. */
export const requiredPropertyRegex = /([\w$]+):/g;

/** Get the name of the optional property in capture group 1. Ignore the ?: in the syntax as it'll be decorated differently. */
export const optionalPropertyRegex = /(\w+)\?:/g;

export const keywordRegex =
  /(\bkeyof\b|\breadonly\b|\bexport\b|\btype\b|\binterface\b|\bdeclare\b|\benum\b|\bconst\b)/g;

export const commentRegex = /(\/\*\*[\w\W]+?\*\/)/g;

export const regexDictionary = {
  typeAliasRegex,
  declareRegex,
  defaultExportRegex,
  interfaceRegex,
  enumRegex,
};
