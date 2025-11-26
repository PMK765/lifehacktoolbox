export type UnitCircleReferenceRow = {
  degrees: number;
  radiansLabel: string;
  cosExact: string;
  sinExact: string;
  tanExact: string;
  tanDefined: boolean;
};

export const UNIT_CIRCLE_REFERENCE: UnitCircleReferenceRow[] = [
  {
    degrees: 0,
    radiansLabel: "0",
    cosExact: "1",
    sinExact: "0",
    tanExact: "0",
    tanDefined: true
  },
  {
    degrees: 30,
    radiansLabel: "π/6",
    cosExact: "√3/2",
    sinExact: "1/2",
    tanExact: "1/√3",
    tanDefined: true
  },
  {
    degrees: 45,
    radiansLabel: "π/4",
    cosExact: "√2/2",
    sinExact: "√2/2",
    tanExact: "1",
    tanDefined: true
  },
  {
    degrees: 60,
    radiansLabel: "π/3",
    cosExact: "1/2",
    sinExact: "√3/2",
    tanExact: "√3",
    tanDefined: true
  },
  {
    degrees: 90,
    radiansLabel: "π/2",
    cosExact: "0",
    sinExact: "1",
    tanExact: "undefined",
    tanDefined: false
  },
  {
    degrees: 120,
    radiansLabel: "2π/3",
    cosExact: "-1/2",
    sinExact: "√3/2",
    tanExact: "-√3",
    tanDefined: true
  },
  {
    degrees: 135,
    radiansLabel: "3π/4",
    cosExact: "-√2/2",
    sinExact: "√2/2",
    tanExact: "-1",
    tanDefined: true
  },
  {
    degrees: 150,
    radiansLabel: "5π/6",
    cosExact: "-√3/2",
    sinExact: "1/2",
    tanExact: "-1/√3",
    tanDefined: true
  },
  {
    degrees: 180,
    radiansLabel: "π",
    cosExact: "-1",
    sinExact: "0",
    tanExact: "0",
    tanDefined: true
  },
  {
    degrees: 210,
    radiansLabel: "7π/6",
    cosExact: "-√3/2",
    sinExact: "-1/2",
    tanExact: "1/√3",
    tanDefined: true
  },
  {
    degrees: 225,
    radiansLabel: "5π/4",
    cosExact: "-√2/2",
    sinExact: "-√2/2",
    tanExact: "1",
    tanDefined: true
  },
  {
    degrees: 240,
    radiansLabel: "4π/3",
    cosExact: "-1/2",
    sinExact: "-√3/2",
    tanExact: "√3",
    tanDefined: true
  },
  {
    degrees: 270,
    radiansLabel: "3π/2",
    cosExact: "0",
    sinExact: "-1",
    tanExact: "undefined",
    tanDefined: false
  },
  {
    degrees: 300,
    radiansLabel: "5π/3",
    cosExact: "1/2",
    sinExact: "-√3/2",
    tanExact: "-√3",
    tanDefined: true
  },
  {
    degrees: 315,
    radiansLabel: "7π/4",
    cosExact: "√2/2",
    sinExact: "-√2/2",
    tanExact: "-1",
    tanDefined: true
  },
  {
    degrees: 330,
    radiansLabel: "11π/6",
    cosExact: "√3/2",
    sinExact: "-1/2",
    tanExact: "-1/√3",
    tanDefined: true
  },
  {
    degrees: 360,
    radiansLabel: "2π",
    cosExact: "1",
    sinExact: "0",
    tanExact: "0",
    tanDefined: true
  }
];


