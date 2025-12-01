import { decodeHeicToImageBitmap } from "./heicDecoder";

export type SupportedOutputFormat = "jpeg" | "png" | "webp";

export type ConvertedImageResult = {
  originalFile: File;
  outputBlob: Blob;
  outputUrl: string;
  outputFormat: SupportedOutputFormat;
  estimatedSizeKb: number;
  width: number;
  height: number;
};

export type ConversionOptions = {
  outputFormat: SupportedOutputFormat;
  quality: number;
  maxSizeKb?: number;
  scalePercent: number;
};

export const getMimeTypeForFormat = (
  format: SupportedOutputFormat
): string => {
  if (format === "jpeg") {
    return "image/jpeg";
  }
  if (format === "png") {
    return "image/png";
  }
  return "image/webp";
};

export const getExtensionForFormat = (
  format: SupportedOutputFormat
): string => {
  if (format === "jpeg") {
    return "jpg";
  }
  if (format === "png") {
    return "png";
  }
  return "webp";
};

export const loadImageFromFile = async (
  file: File
): Promise<HTMLImageElement | null> => {
  if (typeof window === "undefined") {
    return null;
  }
  const url = URL.createObjectURL(file);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
};

export const loadImageForAnyFormat = async (
  file: File
): Promise<{
  image: CanvasImageSource | null;
  width: number;
  height: number;
}> => {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".heic")) {
    const bitmap =
      await decodeHeicToImageBitmap(file);
    if (!bitmap) {
      return {
        image: null,
        width: 0,
        height: 0
      };
    }
    return {
      image: bitmap,
      width: bitmap.width,
      height: bitmap.height
    };
  }
  const img = await loadImageFromFile(file);
  if (!img) {
    return { image: null, width: 0, height: 0 };
  }
  return {
    image: img,
    width: img.naturalWidth,
    height: img.naturalHeight
  };
};

const createScaledCanvas = (
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  scalePercent: number
): HTMLCanvasElement | null => {
  if (typeof document === "undefined") {
    return null;
  }
  const scale =
    scalePercent <= 0 ? 1 : scalePercent / 100;
  const width = Math.max(
    1,
    Math.round(sourceWidth * scale)
  );
  const height = Math.max(
    1,
    Math.round(sourceHeight * scale)
  );
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
};

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob | null> =>
  new Promise((resolve) => {
    if (!canvas.toBlob) {
      resolve(null);
      return;
    }
    const q =
      quality < 0.2
        ? 0.2
        : quality > 1
        ? 1
        : quality;
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        resolve(blob);
      },
      mimeType,
      q
    );
  });

export const convertImageFile = async (
  file: File,
  options: ConversionOptions
): Promise<ConvertedImageResult | null> => {
  if (typeof window === "undefined") {
    return null;
  }
  const loaded = await loadImageForAnyFormat(file);
  if (
    !loaded.image ||
    loaded.width <= 0 ||
    loaded.height <= 0
  ) {
    return null;
  }
  const canvas = createScaledCanvas(
    loaded.image,
    loaded.width,
    loaded.height,
    options.scalePercent
  );
  if (!canvas) {
    return null;
  }
  const mimeType = getMimeTypeForFormat(
    options.outputFormat
  );
  const targetBytes =
    options.maxSizeKb && options.maxSizeKb > 0
      ? options.maxSizeKb * 1024
      : null;
  if (
    options.outputFormat === "png" ||
    !targetBytes
  ) {
    const blob = await canvasToBlob(
      canvas,
      mimeType,
      options.quality
    );
    if (!blob) {
      return null;
    }
    const sizeKb = blob.size / 1024;
    const url = URL.createObjectURL(blob);
    return {
      originalFile: file,
      outputBlob: blob,
      outputUrl: url,
      outputFormat: options.outputFormat,
      estimatedSizeKb: sizeKb,
      width: canvas.width,
      height: canvas.height
    };
  }
  let currentQuality = options.quality;
  let lastBlob: Blob | null = null;
  let lastSizeKb = 0;
  let attempts = 0;
  while (
    attempts < 8 &&
    currentQuality >= 0.2
  ) {
    const blob = await canvasToBlob(
      canvas,
      mimeType,
      currentQuality
    );
    if (!blob) {
      break;
    }
    const sizeKb = blob.size / 1024;
    lastBlob = blob;
    lastSizeKb = sizeKb;
    if (!targetBytes || blob.size <= targetBytes) {
      break;
    }
    currentQuality *= 0.75;
    attempts += 1;
  }
  if (!lastBlob) {
    return null;
  }
  const url = URL.createObjectURL(lastBlob);
  return {
    originalFile: file,
    outputBlob: lastBlob,
    outputUrl: url,
    outputFormat: options.outputFormat,
    estimatedSizeKb: lastSizeKb,
    width: canvas.width,
    height: canvas.height
  };
};


