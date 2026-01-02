export type UniverseObjectCategory =
  | "Subatomic"
  | "Molecular"
  | "Microscopic"
  | "Human scale"
  | "Geographic"
  | "Astronomical"
  | "Cosmic";

export type UniverseObjectId =
  | "proton"
  | "dna_diameter"
  | "atom"
  | "virus"
  | "bacterium"
  | "red_blood_cell"
  | "human_hair"
  | "ant"
  | "human"
  | "blue_whale"
  | "house"
  | "football_field"
  | "city"
  | "earth"
  | "jupiter"
  | "sun"
  | "solar_system_neptune"
  | "milky_way"
  | "local_group"
  | "observable_universe";

export type UniverseObject = {
  id: UniverseObjectId;
  name: string;
  category: UniverseObjectCategory;
  diameterMeters: number;
  description: string;
  comparisons: string[];
};

export const UNIVERSE_OBJECTS: UniverseObject[] = [
  {
    id: "proton",
    name: "Proton (diameter)",
    category: "Subatomic",
    diameterMeters: 1.7e-15,
    description:
      "A proton is a positively charged particle found in atomic nuclei. This is an order-of-magnitude scale for its size.",
    comparisons: ["Atomic nuclei are built from protons and neutrons."]
  },
  {
    id: "atom",
    name: "Atom (typical diameter)",
    category: "Subatomic",
    diameterMeters: 1e-10,
    description:
      "Atoms are the basic building blocks of matter. Typical atoms are about one angstrom across.",
    comparisons: ["A sheet of paper is roughly 100,000 atoms thick."]
  },
  {
    id: "dna_diameter",
    name: "DNA double helix (diameter)",
    category: "Molecular",
    diameterMeters: 2e-9,
    description:
      "DNA stores genetic information. The double helix is about 2 nanometers wide.",
    comparisons: ["A human hair is roughly 30,000–100,000 nm thick."]
  },
  {
    id: "virus",
    name: "Virus (typical diameter)",
    category: "Microscopic",
    diameterMeters: 1e-7,
    description:
      "Viruses are tiny infectious agents. Many are around 100 nanometers in diameter.",
    comparisons: ["Many viruses are smaller than bacteria by about 10×."]
  },
  {
    id: "bacterium",
    name: "Bacterium (typical size)",
    category: "Microscopic",
    diameterMeters: 2e-6,
    description:
      "Bacteria are single-celled organisms. Many common bacteria are a few micrometers long.",
    comparisons: ["A red blood cell is larger than many bacteria."]
  },
  {
    id: "red_blood_cell",
    name: "Red blood cell (diameter)",
    category: "Microscopic",
    diameterMeters: 7.5e-6,
    description:
      "Red blood cells transport oxygen in blood. They are roughly 7–8 micrometers across.",
    comparisons: ["A human hair is about 10× wider than a red blood cell."]
  },
  {
    id: "human_hair",
    name: "Human hair (thickness)",
    category: "Microscopic",
    diameterMeters: 7e-5,
    description:
      "Human hair thickness varies, but a typical value is around 70 micrometers.",
    comparisons: ["A strand of hair is visible but still microscopic in scale."]
  },
  {
    id: "ant",
    name: "Ant (length)",
    category: "Human scale",
    diameterMeters: 0.005,
    description:
      "Many ants are a few millimeters long, making them a convenient small-scale reference.",
    comparisons: ["A human is about 300× taller than an ant."]
  },
  {
    id: "human",
    name: "Human (height)",
    category: "Human scale",
    diameterMeters: 1.7,
    description:
      "A typical adult human height is around 1.6–1.8 meters.",
    comparisons: ["A house is several times taller than a person."]
  },
  {
    id: "blue_whale",
    name: "Blue whale (length)",
    category: "Human scale",
    diameterMeters: 25,
    description:
      "Blue whales are the largest animals known to have lived, reaching about 20–30 meters.",
    comparisons: ["A blue whale can be longer than a basketball court is wide."]
  },
  {
    id: "house",
    name: "House (width)",
    category: "Human scale",
    diameterMeters: 10,
    description:
      "A small house might be around 10 meters across. Exact sizes vary widely.",
    comparisons: ["A football field is roughly 10× longer than a house is wide."]
  },
  {
    id: "football_field",
    name: "Football field (length)",
    category: "Geographic",
    diameterMeters: 100,
    description:
      "A convenient everyday large scale. A field is about 100 meters long.",
    comparisons: ["A city spans thousands of football fields."]
  },
  {
    id: "city",
    name: "City (across)",
    category: "Geographic",
    diameterMeters: 20000,
    description:
      "Cities vary dramatically, but a mid-sized city might be tens of kilometers across.",
    comparisons: ["Earth is about 600× wider than a 20 km city."]
  },
  {
    id: "earth",
    name: "Earth (diameter)",
    category: "Astronomical",
    diameterMeters: 1.2742e7,
    description:
      "Earth is the third planet from the Sun, about 12,742 km in diameter.",
    comparisons: ["Earth could fit inside the Sun about 109 times across."]
  },
  {
    id: "jupiter",
    name: "Jupiter (diameter)",
    category: "Astronomical",
    diameterMeters: 1.3982e8,
    description:
      "Jupiter is the largest planet in our solar system, about 140,000 km across.",
    comparisons: ["Jupiter is about 11× Earth’s diameter."]
  },
  {
    id: "sun",
    name: "Sun (diameter)",
    category: "Astronomical",
    diameterMeters: 1.3927e9,
    description:
      "The Sun is the star at the center of our solar system, about 1.39 million km in diameter.",
    comparisons: ["The Sun is about 10× Jupiter’s diameter."]
  },
  {
    id: "solar_system_neptune",
    name: "Solar system (to Neptune orbit)",
    category: "Astronomical",
    diameterMeters: 9.0e12,
    description:
      "A rough diameter out to Neptune’s orbit (twice the orbital radius). This is a useful scale for the planetary system.",
    comparisons: ["Light takes many hours to cross the solar system."]
  },
  {
    id: "milky_way",
    name: "Milky Way galaxy (diameter)",
    category: "Cosmic",
    diameterMeters: 9.5e20,
    description:
      "The Milky Way is our galaxy, about 100,000 light-years across (order of magnitude).",
    comparisons: ["A light-year is about 9.46 trillion km."]
  },
  {
    id: "local_group",
    name: "Local Group (diameter)",
    category: "Cosmic",
    diameterMeters: 3e23,
    description:
      "A cluster of nearby galaxies including the Milky Way and Andromeda, spanning millions of light-years.",
    comparisons: ["Groups form part of the large-scale structure of the universe."]
  },
  {
    id: "observable_universe",
    name: "Observable universe (diameter)",
    category: "Cosmic",
    diameterMeters: 8.8e26,
    description:
      "The observable universe is the region we can see in principle because light has had time to reach us since the Big Bang.",
    comparisons: ["This is a horizon, not necessarily the full universe."]
  }
];

export const UNIVERSE_OBJECTS_SORTED = [...UNIVERSE_OBJECTS].sort(
  (a, b) => a.diameterMeters - b.diameterMeters
);

export const GUIDED_TOUR_IDS: UniverseObjectId[] = [
  "proton",
  "atom",
  "dna_diameter",
  "virus",
  "bacterium",
  "human_hair",
  "ant",
  "human",
  "house",
  "city",
  "earth",
  "sun",
  "solar_system_neptune",
  "milky_way",
  "local_group",
  "observable_universe"
];


