import { htmlToElement } from "../utils.js";

type CheckBoxElementProps = {
  id?: string;
  onChange?: (element: HTMLInputElement, event: Event) => void;
};

/**
 * @param props
 * @param props.id The element's unique identifier.
 * @param props.onChange A callback that will trigger when the element's value changes.
 * @returns A checkbox element.
 */
const checkboxElement = ({
  id,
  onChange,
}: CheckBoxElementProps): HTMLDivElement => {
  const container = document.createElement("div");
  const checkbox = document.createElement("input");

  container.className = "flex group peer";
  checkbox.type = "checkbox";
  checkbox.className =
    "peer appearance-none h-4 w-4 border checked:border-celestial-blue border-white cursor-pointer z-10";

  if (id) {
    checkbox.id = id;
  }

  if (typeof onChange === "function") {
    checkbox.addEventListener("change", (event) => onChange(checkbox, event));
  }

  const svgElement = htmlToElement(tickSVG);

  container.append(checkbox);
  container.append(svgElement);

  return container;
};

const tickSVG = `<svg viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 absolute stroke-white peer-checked:stroke-celestial-blue">
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M5.5 12.5L10.167 17L19.5 8"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </g>
    </svg>
`;

export default checkboxElement;
