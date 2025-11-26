export type RGB = {
  r: number;
  g: number;
  b: number;
};

export type HSL = {
  h: number;
  s: number;
  l: number;
};

export type PaletteColor = {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  fraction: number;
};

export const clampChannel = (value: number): number => {
  if (value < 0) {
    return 0;
  }
  if (value > 255) {
    return 255;
  }
  return Math.round(value);
};

export const rgbToHex = (rgb: RGB): string => {
  const toHex = (component: number) => {
    const clamped = clampChannel(component);
    const hex = clamped.toString(16).toUpperCase();
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
};

export const hexToRgb = (hex: string): RGB | null => {
  const trimmed = hex.trim().replace(/^#/u, "");
  if (trimmed.length !== 6) {
    return null;
  }
  const r = Number.parseInt(trimmed.slice(0, 2), 16);
  const g = Number.parseInt(trimmed.slice(2, 4), 16);
  const b = Number.parseInt(trimmed.slice(4, 6), 16);
  if (
    Number.isNaN(r) ||
    Number.isNaN(g) ||
    Number.isNaN(b)
  ) {
    return null;
  }
  return { r, g, b };
};

export const rgbToHsl = (rgb: RGB): HSL => {
  const rNorm = clampChannel(rgb.r) / 255;
  const gNorm = clampChannel(rgb.g) / 255;
  const bNorm = clampChannel(rgb.b) / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (delta !== 0) {
    if (max === rNorm) {
      h =
        ((gNorm - bNorm) / delta +
          (gNorm < bNorm ? 6 : 0)) *
        60;
    } else if (max === gNorm) {
      h = ((bNorm - rNorm) / delta + 2) * 60;
    } else {
      h = ((rNorm - gNorm) / delta + 4) * 60;
    }
    s =
      l === 0 || l === 1
        ? 0
        : delta / (1 - Math.abs(2 * l - 1));
  }
  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

const getRandomSampleIndices = (
  pixelCount: number,
  maxSamples: number
): number[] => {
  const limit = Math.min(pixelCount, maxSamples);
  const indices: number[] = [];
  if (pixelCount <= limit) {
    for (let index = 0; index < pixelCount; index += 1) {
      indices.push(index);
    }
    return indices;
  }
  const step = Math.floor(pixelCount / limit) || 1;
  for (let index = 0; index < pixelCount; index += step) {
    indices.push(index);
    if (indices.length >= limit) {
      break;
    }
  }
  return indices;
};

const extractSamples = (
  data: Uint8ClampedArray,
  maxSamples: number
): RGB[] => {
  const pixelCount = Math.floor(data.length / 4);
  const indices = getRandomSampleIndices(pixelCount, maxSamples);
  const samples: RGB[] = [];
  indices.forEach((pixelIndex) => {
    const offset = pixelIndex * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const a = data[offset + 3];
    if (a === 0) {
      return;
    }
    samples.push({ r, g, b });
  });
  return samples;
};

const distanceSq = (a: RGB, b: RGB): number => {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
};

const initializeCentroids = (samples: RGB[], k: number): RGB[] => {
  if (samples.length === 0 || k <= 0) {
    return [];
  }
  const centroids: RGB[] = [];
  const usedIndices = new Set<number>();
  const maxIndex = samples.length;
  while (centroids.length < k && usedIndices.size < maxIndex) {
    const index = Math.floor(Math.random() * maxIndex);
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      centroids.push(samples[index]);
    }
  }
  return centroids;
};

export const extractPaletteFromImageData = (
  imageData: ImageData,
  colorCount: number,
  maxSamples = 4000
): PaletteColor[] => {
  const clampedColorCount = Math.max(
    1,
    Math.min(32, colorCount)
  );
  const samples = extractSamples(
    imageData.data,
    maxSamples
  );
  if (samples.length === 0) {
    return [];
  }
  const k = Math.min(clampedColorCount, samples.length);
  let centroids = initializeCentroids(samples, k);
  const assignments = new Array<number>(samples.length).fill(
    0
  );
  const maxIterations = 8;
  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    for (let i = 0; i < samples.length; i += 1) {
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let c = 0; c < centroids.length; c += 1) {
        const distance = distanceSq(samples[i], centroids[c]);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = c;
        }
      }
      assignments[i] = bestIndex;
    }
    const sums: { r: number; g: number; b: number; count: number }[] =
      centroids.map(() => ({
        r: 0,
        g: 0,
        b: 0,
        count: 0
      }));
    for (let i = 0; i < samples.length; i += 1) {
      const clusterIndex = assignments[i];
      const sample = samples[i];
      const target = sums[clusterIndex];
      target.r += sample.r;
      target.g += sample.g;
      target.b += sample.b;
      target.count += 1;
    }
    centroids = centroids.map((centroid, index) => {
      const bucket = sums[index];
      if (bucket.count === 0) {
        return centroid;
      }
      return {
        r: bucket.r / bucket.count,
        g: bucket.g / bucket.count,
        b: bucket.b / bucket.count
      };
    });
  }
  const clusterCounts = new Array(centroids.length).fill(0);
  assignments.forEach((clusterIndex) => {
    if (clusterIndex >= 0 && clusterIndex < clusterCounts.length) {
      clusterCounts[clusterIndex] += 1;
    }
  });
  const totalSamples = assignments.length || 1;
  const colors: PaletteColor[] = centroids.map((centroid, index) => {
    const rgb: RGB = {
      r: clampChannel(centroid.r),
      g: clampChannel(centroid.g),
      b: clampChannel(centroid.b)
    };
    const fraction = clusterCounts[index] / totalSamples;
    const hex = rgbToHex(rgb);
    const hsl = rgbToHsl(rgb);
    return { hex, rgb, hsl, fraction };
  });
  colors.sort((a, b) => b.fraction - a.fraction);
  return colors;
};


