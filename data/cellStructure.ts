export type OrganelleId =
  | "cell_membrane"
  | "cytoplasm"
  | "nucleus"
  | "nucleolus"
  | "mitochondrion"
  | "ribosomes"
  | "rough_er"
  | "smooth_er"
  | "golgi"
  | "lysosome"
  | "centrosome";

export type OrganelleInfo = {
  id: OrganelleId;
  name: string;
  function: string;
  funFact: string;
  memoryTip: string;
  keywords: string[];
};

export const ORGANELLES: OrganelleInfo[] = [
  {
    id: "cell_membrane",
    name: "Cell membrane",
    function:
      "A selectively permeable boundary that controls what enters and leaves the cell and helps the cell communicate with its environment.",
    funFact:
      "The membrane is a fluid mosaic: lipids and proteins drift sideways, making it flexible but still organized.",
    memoryTip:
      "Membrane = 'member' gatekeeper. It decides who gets in and who stays out.",
    keywords: ["membrane", "boundary", "transport", "phospholipid", "signal"]
  },
  {
    id: "cytoplasm",
    name: "Cytoplasm",
    function:
      "A gel-like interior where many chemical reactions occur and where organelles are suspended.",
    funFact:
      "Cytoplasm isn’t just water—it's crowded with proteins, ions, and structures that affect how molecules move.",
    memoryTip:
      "Cyto = cell, plasm = fluid. Cytoplasm is the busy fluid workspace inside the cell.",
    keywords: ["cytoplasm", "fluid", "reactions", "inside"]
  },
  {
    id: "nucleus",
    name: "Nucleus",
    function:
      "The control center that stores DNA and coordinates gene expression, cell growth, and division.",
    funFact:
      "Nuclear pores act like guarded doorways, allowing RNA and proteins to pass while protecting DNA.",
    memoryTip:
      "Nucleus = 'news' center. It holds the instructions and sends out messages to the cell.",
    keywords: ["nucleus", "dna", "genes", "chromatin", "control"]
  },
  {
    id: "nucleolus",
    name: "Nucleolus",
    function:
      "A dense region inside the nucleus where ribosomal RNA is made and ribosome parts are assembled.",
    funFact:
      "Cells making lots of protein often have a prominent nucleolus because they need many ribosomes.",
    memoryTip:
      "Nucleolus = nucleus 'factory' for ribosomes.",
    keywords: ["nucleolus", "rrna", "ribosome", "assembly"]
  },
  {
    id: "mitochondrion",
    name: "Mitochondrion",
    function:
      "Produces ATP (usable energy) through cellular respiration and helps regulate metabolism.",
    funFact:
      "Mitochondria have their own DNA, reflecting their origin from ancient symbiotic bacteria.",
    memoryTip:
      "Mitochondria = 'powerhouse' makes ATP energy.",
    keywords: ["mitochondria", "atp", "energy", "respiration"]
  },
  {
    id: "ribosomes",
    name: "Ribosomes",
    function:
      "Molecular machines that build proteins by translating messenger RNA (mRNA).",
    funFact:
      "Ribosomes can be free in the cytoplasm or attached to rough ER—both make proteins, but for different destinations.",
    memoryTip:
      "Ribo = robots. Ribosomes are the protein-building robots.",
    keywords: ["ribosome", "protein", "translation", "mrna"]
  },
  {
    id: "rough_er",
    name: "Rough ER",
    function:
      "A membrane network studded with ribosomes that helps fold and process proteins headed for membranes or secretion.",
    funFact:
      "The rough ER is especially abundant in cells that secrete lots of proteins, like pancreas cells.",
    memoryTip:
      "Rough = ribosomes make it bumpy. Rough ER handles protein production and processing.",
    keywords: ["rough er", "endoplasmic reticulum", "protein", "ribosomes"]
  },
  {
    id: "smooth_er",
    name: "Smooth ER",
    function:
      "Makes lipids, helps detoxify chemicals, and stores calcium in many cell types.",
    funFact:
      "In muscle cells, a specialized smooth ER stores calcium needed for contraction.",
    memoryTip:
      "Smooth ER = smooth fats. It’s for lipids and detox.",
    keywords: ["smooth er", "lipids", "detox", "calcium"]
  },
  {
    id: "golgi",
    name: "Golgi apparatus",
    function:
      "Modifies, sorts, and packages proteins and lipids into vesicles for transport to their destinations.",
    funFact:
      "The Golgi works like a shipping center: it adds molecular 'labels' so cargo gets delivered correctly.",
    memoryTip:
      "Golgi = the cell's 'post office'—packages and ships.",
    keywords: ["golgi", "package", "vesicle", "shipping", "modify"]
  },
  {
    id: "lysosome",
    name: "Lysosome",
    function:
      "Breaks down waste materials and old cell parts using digestive enzymes.",
    funFact:
      "Lysosomes help recycle cellular components, providing raw materials the cell can reuse.",
    memoryTip:
      "Lyso = 'lysis' break apart. Lysosomes digest and recycle.",
    keywords: ["lysosome", "digest", "enzymes", "recycle"]
  },
  {
    id: "centrosome",
    name: "Centrosome",
    function:
      "Organizes microtubules and helps form the spindle during cell division.",
    funFact:
      "The centrosome is the main microtubule organizing center in many animal cells.",
    memoryTip:
      "Centro = center. Centrosome organizes the cell’s internal scaffolding.",
    keywords: ["centrosome", "microtubules", "spindle", "division"]
  }
];

export const organelleById = (id: OrganelleId): OrganelleInfo | undefined =>
  ORGANELLES.find((o) => o.id === id);


