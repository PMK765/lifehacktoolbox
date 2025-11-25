export type BabyNameGender = "boy" | "girl" | "neutral";

export type BabyNameRegion =
  | "North America"
  | "Latin America"
  | "Western Europe"
  | "Eastern Europe"
  | "Northern Europe"
  | "Southern Europe"
  | "Middle East"
  | "North Africa"
  | "Sub-Saharan Africa"
  | "South Asia"
  | "East Asia"
  | "Southeast Asia"
  | "Oceania"
  | "Other";

export type BabyNameCountryCode = string;

export type BabyNameEntryGender =
  | BabyNameGender
  | "boy/girl";

export type BabyNameEntry = {
  id: string;
  name: string;
  gender: BabyNameEntryGender;
  originCountryCodes: BabyNameCountryCode[];
  originRegions: BabyNameRegion[];
  meanings: string[];
  usageNotes?: string;
  popularityRank?: number | null;
};


