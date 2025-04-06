type CreateElement<
  T extends keyof HTMLElementTagNameMap,
  K extends "string" | "element"
> = {
  tag: T;
  value?: string;
  className?: string;
  type: K;
};

type CreateElementReturn<T extends string, K> = K extends "element"
  ? T extends keyof HTMLElementTagNameMap
    ? HTMLElementTagNameMap[T]
    : never
  : string;

export const createElement = <
  T extends keyof HTMLElementTagNameMap,
  K extends "string" | "element"
>(
  props: CreateElement<T, K>
): CreateElementReturn<T, K> => {
  const { tag, value, className, type } = props;
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (value) {
    if (Array.isArray(value)) {
      for (const elem of value) {
        element.append(elem);
      }
    } else {
      element.innerHTML = value;
    }
  }

  return type === "element"
    ? (element as CreateElementReturn<T, K>)
    : (element.outerHTML as CreateElementReturn<T, K>);
};

export class NewElement<T extends keyof HTMLElementTagNameMap> {
  private value: HTMLElementTagNameMap[T];

  constructor(value: T) {
    this.value = document.createElement(value);
  }

  add(cb: (value: HTMLElementTagNameMap[T]) => void): HTMLElementTagNameMap[T] {
    cb(this.value);
    return this.value;
  }
}
