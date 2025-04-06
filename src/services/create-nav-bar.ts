import { MatchedTypeDetail } from "../types/create-json.js";
import { createElement, NewElement } from "./create-element.js";

type DirectoryNode = {
  name: string;
  children: DirectoryNode[];
};

const toggleSVG = `
          <svg class="hidden ml-auto w-7 h-7 stroke-white group-hover:stroke-cyan-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                  <rect width="24" height="24" fill="white"></rect>
                  <path d="M7 14.5L12 9.5L17 14.5" stroke="#ffffff" stroke-linecap="round"
                      stroke-linejoin="round"></path>
              </g>
          </svg>
          <svg class="ml-auto w-7 h-7 stroke-white group-hover:stroke-cyan-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                  <path d="M17 9.5L12 14.5L7 9.5" stroke-linecap="round" stroke-linejoin="round">
                  </path>
              </g>
          </svg>
`;

const cardList = document.getElementsByClassName(
  "card-list"
)[0] as HTMLElementTagNameMap["div"];

const filterList = document.getElementsByClassName(
  "filters"
)[0] as HTMLElementTagNameMap["div"];

const filterContainer = document.getElementsByClassName(
  "filter-container"
)[0] as HTMLElementTagNameMap["button"];

const filterButton = document.getElementsByClassName(
  "filter-button"
)[0] as HTMLElementTagNameMap["button"];

filterButton.addEventListener("click", () => {
  const tokens = filterButton.classList;

  if (tokens.contains("active")) {
    cardList.classList.add("col-span-12");
    cardList.classList.remove("col-span-10");
  } else {
    cardList.classList.add("col-span-10");
    cardList.classList.remove("col-span-12");
  }

  filterButton.classList.toggle("active");
  filterList.classList.toggle("hidden");
});

type Filter =
  | {
      name: "Filename";
      data: string[];
    }
  | {
      name: "Directory";
      data: DirectoryNode[];
    };

const DEFAULT_FILTERS = [
  {
    filterName: "Declaration",
    options: ["type alias", "interface", "enum"],
  },
  // {
  //   filterName: "Directory",
  //   options: ["pages", "components", "shared", "base", "test"],
  // },
] as const;

/** Builds the directory filter. */
const buildTree = (tree: DirectoryNode[], paths: string[]) => {
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

/** Returns an array of filters to be rendered. */
const getFilters = () => {};

const toggleFilter = (list: HTMLUListElement): void => {
  if (list.style.maxHeight) {
    list.style.maxHeight = "";
    // list.style.padding = "";
  } else {
    // list.style.padding = "20px";
    // + 80
    list.style.maxHeight = list.scrollHeight + "px";
  }
};

(async () => {
  const response = await fetch("http://localhost:8000/data.json");

  if (!response.ok) return;

  const types = (await response.json()) as MatchedTypeDetail[];

  const fileNames: Set<string> = new Set();
  const directories: Set<string> = new Set();

  // const tree: Test = { name: "root", children: [] };
  const tree: DirectoryNode[] = [];

  for (const type of types) {
    const { fileName, filePath } = type;

    if (!fileNames.has(fileName)) {
      fileNames.add(fileName);
    }

    /** How to know if nested? */
    if (!filePath.length) continue;

    buildTree(tree, filePath);

    // fileNameFilter.options.push(fileName);
    // directoryFilter.options.push(filePath)
  }

  const buildDirectyFilter = (
    tree: DirectoryNode[],
    depth: number
  ): HTMLUListElement => {
    const list = document.createElement("ul");

    list.style.marginLeft = `${12 * depth}px`;

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
        item.append(buildDirectyFilter(children, depth + 1));
      }
    }

    return list;
  };

  // console.log(buildDirectyFilter(tree));

  const fileNameFilter: Filter = {
    name: "Filename",
    data: Array.from(fileNames),
  };

  const directoryFilter: Filter = {
    name: "Directory",
    data: tree,
  };

  const filters: Filter[] = [fileNameFilter, directoryFilter];

  for (const filter of filters) {
    const { name, data } = filter;

    const container = document.createElement("div");
    const button = document.createElement("button");

    container.append(button);
    button.innerHTML = name + toggleSVG;
    button.className =
      "flex items-center w-full group hover:cursor-pointer hover:text-cyan-500 transition";

    switch (name) {
      case "Filename":
        {
          const list = document.createElement("ul");
          list.className = "filter-group-list";

          for (const option of data) {
            const item = document.createElement("li");
            const checkbox = document.createElement("input");

            checkbox.type = "checkbox";
            item.className = "flex gap-x-3";

            item.append(checkbox, option);
            list.append(item);
          }

          button.addEventListener("click", () => toggleFilter(list));
          container.append(list);
        }

        break;

      case "Directory":
        {
          const list = buildDirectyFilter(data, 0);
          list.className = "filter-group-list";

          button.addEventListener("click", () => toggleFilter(list));
          container.append(list);
        }
        break;
    }

    filterList.append(container);
  }
})();
