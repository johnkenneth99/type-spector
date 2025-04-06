import { MatchedTypeDetail } from "../types/create-json.js";
import { createElement } from "./create-element.js";
import { decorateTypeDefinition } from "./decorate.js";
// import "./../styles/index.css";
// import "./../styles/dashboard.css";
// import "./../styles/nav-bar.css";
// import "./../styles/type-definition.css";

const searchInputElement = document.getElementById(
  "search-bar-input"
) as HTMLElementTagNameMap["input"];

searchInputElement.addEventListener("change", async () => {
  const test = await fetch("http://localhost:8000/data.json");

  if (test.ok) {
    const types = (await test.json()) as MatchedTypeDetail[];
    console.log(types);

    console.log(searchInputElement.value.toLowerCase());
    const filteredTypes = types.filter(
      ({ typeName }) =>
        typeName
          .toLowerCase()
          .indexOf(searchInputElement.value.toLowerCase()) !== -1
    );

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

        const { substring, typeName } = type;

        const typeDeclaration = JSON.parse(
          type.declarationKind
        ) as MatchedTypeDetail["declarationKind"];

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

        cardHeader.innerHTML = `<h3><span class="type-declaration">${typeDeclaration}</span> <span class="type-name">${typeName}</span></h3>`;
        cardContent.append(preElement);

        card.append(cardHeader, cardContent);
        cardList.append(card);
      }
    }
  }
});
