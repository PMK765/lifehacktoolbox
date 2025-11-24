declare module "tesseract.js/dist/tesseract.min.js" {
  const Tesseract: {
    recognize: (
      image: string | ArrayBuffer | Uint8Array,
      langs: string,
      options?: {
        logger?: (message: { status: string; progress?: number }) => void;
      }
    ) => Promise<{
      data: {
        text: string;
      };
    }>;
  };

  export default Tesseract;
}


