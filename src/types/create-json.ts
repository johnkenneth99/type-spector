import { DeclarationKind } from "../enums.js";

export type MatchedTypeDetail = {
  /** Remaining portion of the string after the type name. */
  tail: string;
  /** The name of the type. */
  typeName: string;
  /** The exact match of the regex. */
  substring: string;
  /** FIXME: The comment is picked up as `type` by the regex. */
  /** E.g. export type / export declare enum / export interface */
  fullDeclaration: string;
  declarationKind: DeclarationKind;
  startIndex: number;
  typeDefinition?: string;
  filePath: string[];
  fileName: string;
};
