import checkboxElement from "../components/checkbox.js";
import { DeclarationKind } from "../enums.js";
import { type MatchedTypeDetail } from "../types/create-json.js";

export type DirectoryNode = {
  name: string;
  children: DirectoryNode[];
};

export type Filter =
  | {
      name: "Filename";
      data: string[];
    }
  | {
      name: "Directory";
      data: DirectoryNode[];
    }
  | {
      name: "Declaration";
      data: string[];
    };

/** Builds the directory filter. */
export const buildTree = (tree: DirectoryNode[], paths: string[]) => {
  for (const path of paths) {
    const node = tree.find((item) => item.name === path);

    if (!node) {
      const temp: DirectoryNode = { name: path, children: [] };
      tree.push(temp);

      tree = temp.children;
    } else {
      tree = node.children;
    }
  }
};

/**
 * @param types A list types from the emitted files.
 * @returns An array of filters to be rendered.
 */
export const getFilters = (types: MatchedTypeDetail[]): Filter[] => {
  const fileNames: Set<string> = new Set();
  const tree: DirectoryNode[] = [];

  for (const type of types) {
    const { fileName, filePath } = type;

    if (!fileNames.has(fileName)) {
      fileNames.add(fileName);
    }

    if (!filePath.length) continue;

    buildTree(tree, filePath);
  }

  const fileNameFilter: Filter = {
    name: "Filename",
    data: Array.from(fileNames),
  };

  const directoryFilter: Filter = {
    name: "Directory",
    data: tree,
  };

  const declarationFilter: Filter = {
    name: "Declaration",
    data: [
      DeclarationKind.TYPE_ALIAS,
      DeclarationKind.INTERFACE,
      DeclarationKind.ENUM,
    ],
  };

  return [declarationFilter, fileNameFilter, directoryFilter];
};

/**
 *
 * @param tree Represents the shape of the directory
 * @param depth A number to modify the indentation of child directories
 * @returns A `ul`element representing the directory of the types
 */
export const buildDirectoryFilter = (
  tree: DirectoryNode[],
  depth: number
): HTMLUListElement => {
  const list = document.createElement("ul");

  list.style.marginLeft = `${5 * depth}px`;

  for (const node of tree) {
    const { name, children } = node;

    const item = document.createElement("li");
    const label = document.createElement("label");

    const container = document.createElement("div");
    container.className = "flex gap-x-2 items-center peer group p-1";

    const checkbox = checkboxElement({ id: name });
    label.className = "peer-has-checked:text-celestial-blue cursor-pointer";
    label.htmlFor = name;

    label.append(name);
    container.append(checkbox, label);
    item.append(container);
    list.append(item);

    if (children.length) {
      item.append(buildDirectoryFilter(children, depth + 1));
    }
  }

  return list;
};
