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
    data: ["type alias", "interface", "enum"],
  };

  return [declarationFilter, fileNameFilter, directoryFilter];
};

export const buildDirectoryFilter = (
  tree: DirectoryNode[],
  depth: number
): HTMLUListElement => {
  const list = document.createElement("ul");

  list.style.marginLeft = `${1 * depth}px`;

  for (const node of tree) {
    const { name, children } = node;

    const item = document.createElement("li");
    const text = document.createElement("p");

    const container = document.createElement("div");
    container.className = "flex gap-x-3 items-center";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    text.append(name);
    container.append(checkbox, text);
    item.append(container);
    list.append(item);

    if (children.length) {
      item.append(buildDirectoryFilter(children, depth + 1));
    }
  }

  return list;
};
