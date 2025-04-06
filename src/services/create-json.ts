import { writeFile } from "fs";
import { readdir, readFile, stat } from "fs/promises";
import { DeclarationKind, Encoding } from "../enums.js";
import { regexDictionary } from "../regex.js";
import { isDeclarationKind } from "../utils.js";
import { MatchedTypeDetail } from "../types/create-json.js";

const BASE_PATH = ".\\type-spector-emit\\declaration-files";

const createJSON = async (): Promise<void> => {
  const files = await readdir(BASE_PATH, {
    recursive: true,
  });

  let currentDirectory = "root";

  /** Will contain all the types found in the project. */
  const result: MatchedTypeDetail[] = [];

  const readFilePromises: Promise<void>[] = [];

  for (const file of files) {
    const filePath = `${BASE_PATH}\\${file}`;

    try {
      const fileStat = await stat(filePath);

      if (!fileStat.isDirectory()) {
        const readFilePromise = readFile(filePath, {
          encoding: Encoding.Utf8,
        }).then((value) => handleReadFile(value, filePath, result));

        readFilePromises.push(readFilePromise);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  }

  /** NOTE: Handle error if a promise fails. */
  await Promise.all(readFilePromises);

  const jsonData = result.map((item) => ({
    ...item,
    typeDefinition: JSON.stringify(item.typeDefinition),
    declarationKind: JSON.stringify(item.declarationKind),
    // tail: JSON.stringify(item.tail),
  }));

  writeFile("data.json", JSON.stringify(jsonData, null, 2), (err) =>
    console.error(err)
  );
};

export default createJSON;

createJSON();

/** Returns the path and name of the file. */
const getFileDetails = (file: string): [string[], string] => {
  const match = file!.match(/(.+\\)(.+)/i);
  const [_, filePath, fileName] = match!;

  const name = getFileName(fileName);

  /** Do not include the base path of the emitted files. */
  const path = filePath
    .split("\\")
    .slice(BASE_PATH.split("\\").length)
    .filter((path) => path);

  return [path, name] as const;
};

const getFileName = (fileName: string): string => {
  const [name, _, extension] = fileName.split(".");
  return `${name}.${extension}`;
};

const handleReadFile = (
  data: string,
  file: string,
  result: MatchedTypeDetail[]
): void => {
  const [filePath, fileName] = getFileDetails(file);

  const count = {
    typeAlias: 0,
    interface: 0,
    total: 0,
  };

  const matchedTypes: MatchedTypeDetail[] = [];

  /**
   * Each entry in regexDictionary will have 3 capture groups (1-3).
   * Example exact match of a type: "export type MyType = "
   *
   * Capture group 1 - The full type declaration e.g. "export type MyType".
   * Capture group 2 - The type name e.g. "MyType".
   * Capture group 3 - The remaining string after the type name e.g. " = ".
   */

  for (const key in regexDictionary) {
    const regex = regexDictionary[key as keyof typeof regexDictionary];

    const matches = data.matchAll(regex);

    for (const item of matches) {
      const [substring, fullDeclaration, typeName, tail] = item;

      fullDeclaration.split(" ").forEach((word) => {
        /** Get specific type declaration. */
        if (isDeclarationKind(word)) {
          /** Get the rest of type declaration. */
          const detail: MatchedTypeDetail = {
            tail,
            typeName,
            substring,
            fullDeclaration,
            declarationKind: word,
            startIndex: item.index,
            fileName,
            filePath,
          };

          matchedTypes.push(detail);
        }
      });
    }
  }

  matchedTypes.sort((a, b) => a.startIndex - b.startIndex);

  const filteredMatchedTypes: MatchedTypeDetail[] = [];
  /** Get type definition. */
  for (let i = 0; i < matchedTypes.length; i++) {
    const { declarationKind, startIndex, substring } = matchedTypes[i];

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

    /** Removed this soon. */
    const de = declarationKind.split(" ");

    /** NOTE: Maybe turn this into a config file? */
    if (
      de.includes(DeclarationKind.ENUM) ||
      de.includes(DeclarationKind.INTERFACE) ||
      de.includes(DeclarationKind.TYPE_ALIAS)
    ) {
      filteredMatchedTypes.push(matchedTypes[i]);
    }
  }

  result.push(...filteredMatchedTypes);
};
