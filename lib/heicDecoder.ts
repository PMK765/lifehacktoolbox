export const decodeHeicToImageBitmap = async (
  file: File
): Promise<ImageBitmap | null> => {
  if (typeof window === "undefined") {
    return null;
  }
  if (typeof createImageBitmap === "undefined") {
    return null;
  }
  return createImageBitmap(file).catch(() => null);
};


