import { DeclarationKind } from "../enums.js";
import { MatchedTypeDetail } from "../types/create-json.js";
import { createElement } from "./create-element.js";
import { decorateTypeDefinition } from "./decorate.js";
import { buildDirectoryFilter, getFilters } from "./filter.js";

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

type State = {
  filename: Record<string, boolean>;
  directory: Record<string, string>;
  declaration: Record<string, string>;
};

const state: State = {
  filename: {},
  directory: {},
  declaration: {},
};

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

const toggleFilter = (list: HTMLUListElement): void => {
  if (list.style.maxHeight) {
    list.style.maxHeight = "";
  } else {
    list.style.maxHeight = list.scrollHeight + "px";
  }
};

(async () => {
  const response = await fetch("http://localhost:8000/data.json");

  if (!response.ok) return;

  const types = (await response.json()) as MatchedTypeDetail[];

  const filters = getFilters(types);

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
      case "Declaration":
        {
          const list = document.createElement("ul");
          list.className = "filter-group-list";

          for (const option of data) {
            const item = document.createElement("li");
            const checkbox = document.createElement("input");

            checkbox.type = "checkbox";
            item.className = "flex gap-x-3";

            checkbox.addEventListener("change", (event) => {
              event.stopPropagation();
              const key = name.toLowerCase() as keyof State;

              if (checkbox.checked) {
                state[key][option] = checkbox.checked;
              } else {
                delete state[key][option];
              }
              console.log(state);
            });

            item.append(checkbox, option);
            list.append(item);
          }

          button.addEventListener("click", () => toggleFilter(list));
          container.append(list);
        }

        break;

      case "Directory":
        {
          const list = buildDirectoryFilter(data, 0);
          list.className = "filter-group-list";

          button.addEventListener("click", () => toggleFilter(list));
          container.append(list);
        }
        break;
    }

    filterList.append(container);
  }
})();

const searchInputElement = document.getElementById(
  "search-bar-input"
) as HTMLElementTagNameMap["input"];

searchInputElement.addEventListener("change", async () => {
  const test = await fetch("http://localhost:8000/data.json");

  if (test.ok) {
    const types = (await test.json()) as MatchedTypeDetail[];

    const { filename, declaration } = state;

    const filteredTypes = types.filter((item) => {
      const { typeName, fileName, declarationKind } = item;

      const filenames = Object.keys(filename);
      const declarations = Object.keys(declaration);

      const hasFilenameSet = !!filenames.length;
      const hasDeclarationSet = !!declarations.length;

      const isTypeNameMatch =
        typeName
          .toLowerCase()
          .indexOf(searchInputElement.value.toLowerCase()) !== -1;

      const isFileNameMatch = hasFilenameSet
        ? filenames.includes(fileName)
        : true;

      const isDeclarationMatch = hasDeclarationSet
        ? declarations.includes(declarationKind)
        : true;

      return isTypeNameMatch && isFileNameMatch && isDeclarationMatch;
    });

    const cardList = document.getElementsByClassName("card-list")[0];

    if (!filteredTypes.length) {
      cardList.innerHTML = "Type not found.";
    } else {
      cardList.innerHTML = "";

      for (const type of filteredTypes) {
        const card = document.createElement("div");
        const cardContent = document.createElement("div");
        const cardHeader = document.createElement("div");

        card.className = "type-card";
        cardContent.className = "type-card-content";
        cardHeader.className = "type-card-header";

        cardHeader.addEventListener("click", () => {
          cardHeader.classList.toggle("type-card-header--active");

          if (cardContent.style.maxHeight) {
            cardContent.style.maxHeight = "";
            cardContent.style.padding = "";
          } else {
            cardContent.style.padding = "20px";
            cardContent.style.maxHeight = cardContent.scrollHeight + 80 + "px";
          }
        });

        const { substring, typeName, filePath, fileName, declarationKind } =
          type;

        cardHeader.innerHTML = `<h3><span class="type-declaration">${declarationKind}</span> <span class="type-name">${typeName}</span></h3>`;

        const typeDefinition: string = JSON.parse(type.typeDefinition ?? "");

        const fullTypeDefinition = decorateTypeDefinition(
          substring + typeDefinition
        );

        const preElement = createElement({
          value: fullTypeDefinition,
          tag: "pre",
          type: "element",
          className: "type-definition",
        });

        /** Ex. PATH: "/src/services" */
        const filePathElement = document.createElement("p");
        filePathElement.className = "text-[0.9rem] mt-10";

        /** Label element */
        const pathSpan = document.createElement("span");
        pathSpan.innerHTML = "Path";
        pathSpan.className = "text-celestial-blue uppercase";

        /** File path of the type. */
        const filePathSpan = document.createElement("span");
        filePathSpan.append(`"/${filePath.join("/")}"`);
        filePathSpan.className = "text-copper";

        filePathElement.append(pathSpan, ": ", filePathSpan);

        /** Ex. FILENAME: "constants.ts" */
        const fileNameElement = document.createElement("p");
        fileNameElement.className = "text-[0.9rem] mt-1";

        /** Label element */
        const filenameSpan = document.createElement("span");
        filenameSpan.innerHTML = "Filename";
        filenameSpan.className = "text-celestial-blue uppercase";

        /** Filename of the type. */
        const fileNameSpan = document.createElement("span");
        fileNameSpan.append(`"${fileName}"`);
        fileNameSpan.className = "text-copper";

        fileNameElement.append(filenameSpan, ": ", fileNameSpan);

        cardContent.append(preElement, filePathElement, fileNameElement);

        card.append(cardHeader, cardContent);
        cardList.append(card);
      }
    }
  }
});
