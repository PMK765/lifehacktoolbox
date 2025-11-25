declare module "qrcode" {
  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options: {
      errorCorrectionLevel?: "L" | "M" | "Q" | "H";
      margin?: number;
      color?: {
        dark?: string;
        light?: string;
      };
      scale?: number;
      width?: number;
    },
    callback?: (error: unknown | null) => void
  ): void;

  const QRCode: {
    toCanvas: typeof toCanvas;
  };

  export default QRCode;
}


