export type BaseId = "binary" | "decimal" | "hex" | "octal";

const baseRadixMap: Record<BaseId, number> = {
  binary: 2,
  octal: 8,
  decimal: 10,
  hex: 16
};

const isValidDigitForBase = (character: string, base: BaseId): boolean => {
  if (base === "decimal") {
    return character >= "0" && character <= "9";
  }
  if (base === "binary") {
    return character === "0" || character === "1";
  }
  if (base === "octal") {
    return character >= "0" && character <= "7";
  }
  const upper = character.toUpperCase();
  if (upper >= "0" && upper <= "9") {
    return true;
  }
  return upper >= "A" && upper <= "F";
};

export const parseFromBase = (input: string, base: BaseId): number | null => {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }
  const cleaned =
    base === "hex" ? trimmed.toUpperCase() : trimmed;
  let result = 0;
  const radix = baseRadixMap[base];
  for (let index = 0; index < cleaned.length; index += 1) {
    const character = cleaned[index];
    if (!isValidDigitForBase(character, base)) {
      return null;
    }
    let digit = 0;
    if (character >= "0" && character <= "9") {
      digit = character.charCodeAt(0) - "0".charCodeAt(0);
    } else {
      const upper = character.toUpperCase();
      digit = 10 + (upper.charCodeAt(0) - "A".charCodeAt(0));
    }
    result = result * radix + digit;
    if (!Number.isFinite(result) || result < 0) {
      return null;
    }
  }
  return result;
};

export const formatToBase = (value: number, base: BaseId): string => {
  if (!Number.isFinite(value) || value < 0) {
    return "";
  }
  const radix = baseRadixMap[base];
  if (value === 0) {
    return "0";
  }
  let integer = Math.floor(value);
  const digits: string[] = [];
  while (integer > 0) {
    const digit = integer % radix;
    if (digit < 10) {
      digits.push(String.fromCharCode("0".charCodeAt(0) + digit));
    } else {
      digits.push(
        String.fromCharCode("A".charCodeAt(0) + (digit - 10))
      );
    }
    integer = Math.floor(integer / radix);
  }
  return digits.reverse().join("");
};

export const clampToBitWidth = (
  value: number,
  bitWidth: 8 | 16 | 32
): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const max =
    bitWidth === 32
      ? 0xffffffff
      : (1 << bitWidth) - 1;
  const integer = Math.floor(value);
  if (integer < 0) {
    return 0;
  }
  if (integer > max) {
    return max;
  }
  return integer;
};


