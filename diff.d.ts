declare module "diff" {
  export interface DiffChange {
    value: string;
    added?: boolean;
    removed?: boolean;
  }

  export function diffLines(
    oldText: string,
    newText: string
  ): DiffChange[];

  export function diffWords(
    oldText: string,
    newText: string
  ): DiffChange[];
}


