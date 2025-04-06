export enum Keyword {
  Export = "export",
  Import = "import",
  Default = "default",
  Declare = "declare",
}

export enum DeclarationKind {
  TYPE_ALIAS = "type",
  INTERFACE = "interface",
  ENUM = "enum",
  CONSTANT = "const",
}

export enum TypeKind {
  Number = "number",
  String = "string",
  Boolean = "Boolean",
  Object = "object",
}

export enum StatusCode {
  Success = 200,
}

export enum Encoding {
  Utf8 = "utf8",
}

export enum ContentType {
  Html = "text/html",
  Css = "text/css",
  Javascript = "text/javascript",
  FontWoff = "font/woff",
  Json = "application/json",
}
