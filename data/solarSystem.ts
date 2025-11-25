export type PlanetId =
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

export type PlanetInfo = {
  id: PlanetId;
  name: string;
  radiusKm: number;
  orbitalRadiusAu: number;
  orbitalPeriodDays: number;
  rotationPeriodHours: number;
  massKg: number;
  averageTempK: number;
  axialTiltDegrees: number;
  color: string;
  textureImage?: string;
  description: string;
};

export const AU_IN_KM = 149_597_870.7;

export const sun = {
  radiusKm: 696_340,
  textureImage: "/planets/sun.png",
  color: "#facc15"
};

export const planets: PlanetInfo[] = [
  {
    id: "mercury",
    name: "Mercury",
    radiusKm: 2440,
    orbitalRadiusAu: 0.39,
    orbitalPeriodDays: 88,
    rotationPeriodHours: 1407.6,
    massKg: 3.30e23,
    averageTempK: 440,
    axialTiltDegrees: 0.03,
    color: "#9ca3af",
    textureImage: "/planets/mercury.png",
    description:
      "The smallest planet and closest to the Sun, Mercury is a rocky world with extreme temperature swings between its blistering dayside and frigid nightside."
  },
  {
    id: "venus",
    name: "Venus",
    radiusKm: 6052,
    orbitalRadiusAu: 0.72,
    orbitalPeriodDays: 224.7,
    rotationPeriodHours: -5832.5,
    massKg: 4.87e24,
    averageTempK: 737,
    axialTiltDegrees: 177.4,
    color: "#f97316",
    textureImage: "/planets/venus.png",
    description:
      "Venus is a dense, cloud-shrouded world with a thick carbon dioxide atmosphere and runaway greenhouse effect, making it the hottest planet in the solar system."
  },
  {
    id: "earth",
    name: "Earth",
    radiusKm: 6371,
    orbitalRadiusAu: 1,
    orbitalPeriodDays: 365.25,
    rotationPeriodHours: 23.93,
    massKg: 5.97e24,
    averageTempK: 288,
    axialTiltDegrees: 23.4,
    color: "#22c55e",
    textureImage: "/planets/earth.png",
    description:
      "Our home world, Earth is a dynamic blue planet with liquid water, a protective atmosphere, and a diversity of life unmatched anywhere else we know."
  },
  {
    id: "mars",
    name: "Mars",
    radiusKm: 3389,
    orbitalRadiusAu: 1.52,
    orbitalPeriodDays: 687,
    rotationPeriodHours: 24.6,
    massKg: 6.39e23,
    averageTempK: 210,
    axialTiltDegrees: 25.2,
    color: "#f97373",
    textureImage: "/planets/mars.png",
    description:
      "Known as the Red Planet, Mars is a cold desert world with the largest volcano and canyon in the solar system and polar caps made of water and dry ice."
  },
  {
    id: "jupiter",
    name: "Jupiter",
    radiusKm: 69_911,
    orbitalRadiusAu: 5.20,
    orbitalPeriodDays: 4333,
    rotationPeriodHours: 9.9,
    massKg: 1.90e27,
    averageTempK: 165,
    axialTiltDegrees: 3.1,
    color: "#facc6b",
    textureImage: "/planets/jupiter.png",
    description:
      "Jupiter is a gas giant more massive than all the other planets combined, famous for its Great Red Spot storm and dozens of moons including volcanic Io and icy Europa."
  },
  {
    id: "saturn",
    name: "Saturn",
    radiusKm: 58_232,
    orbitalRadiusAu: 9.58,
    orbitalPeriodDays: 10_759,
    rotationPeriodHours: 10.7,
    massKg: 5.68e26,
    averageTempK: 134,
    axialTiltDegrees: 26.7,
    color: "#facc85",
    textureImage: "/planets/saturn.png",
    description:
      "Saturn is a ringed gas giant with spectacular icy rings and a rich system of moons, including Titan, which has lakes of liquid methane on its surface."
  },
  {
    id: "uranus",
    name: "Uranus",
    radiusKm: 25_362,
    orbitalRadiusAu: 19.20,
    orbitalPeriodDays: 30_688,
    rotationPeriodHours: -17.2,
    massKg: 8.68e25,
    averageTempK: 76,
    axialTiltDegrees: 97.8,
    color: "#38bdf8",
    textureImage: "/planets/uranus.png",
    description:
      "An ice giant with a striking blue-green color, Uranus rotates on its side, giving it extreme seasons as it slowly orbits the Sun."
  },
  {
    id: "neptune",
    name: "Neptune",
    radiusKm: 24_622,
    orbitalRadiusAu: 30.05,
    orbitalPeriodDays: 60_190,
    rotationPeriodHours: 16.1,
    massKg: 1.02e26,
    averageTempK: 72,
    axialTiltDegrees: 28.3,
    color: "#3b82f6",
    textureImage: "/planets/neptune.png",
    description:
      "The most distant known major planet, Neptune is an ice giant with supersonic winds and a deep blue hue driven by methane in its atmosphere."
  }
];


