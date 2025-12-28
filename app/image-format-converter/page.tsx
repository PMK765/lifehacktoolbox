import type { Metadata } from "next";
import ImageFormatConverter from "@/components/ImageFormatConverter";

export const metadata: Metadata = {
  title:
    "HEIC to JPG, PNG & Image Format Converter | LifeHackToolbox",
  description:
    "Convert HEIC photos to JPG, PNG, or WEBP directly in your browser. Supports JPG, PNG, WEBP, GIF, and more, with optional max file size and quality controls. No uploads, fully client-side.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/image-format-converter"
  }
};

const ImageFormatConverterPage = () => {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          HEIC to JPG, PNG &amp; Image Format Converter
        </h1>
        <p className="max-w-3xl text-sm text-slate-700">
          Convert HEIC photos and other image formats to JPG, PNG, or WEBP
          without uploading anything. Adjust quality, scale, and optional max
          file size — everything runs locally in your browser using Canvas and
          Web APIs.
        </p>
      </section>
      <section className="mt-6">
        <ImageFormatConverter />
      </section>
      <section className="mt-10 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-800 md:p-7">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          Convert HEIC to JPG and PNG in your browser
        </h2>
        <p>
          Many phones now save photos in HEIC or HEIF format by default, which
          can be difficult to open on older computers or some apps. This{" "}
          <span className="font-semibold">HEIC to JPG converter</span> runs
          entirely in your browser. You can drop in HEIC files alongside JPG,
          PNG, WEBP, and other images, then export them as JPG, PNG, or WEBP
          with a couple of clicks. There is no upload step — the page uses local
          browser APIs to decode, draw, and re-encode each image.
        </p>
        <p>
          The workflow is simple: choose one or more images, select your output
          format, optionally set a maximum target size and scale percentage, and
          then click &ldquo;Convert images.&rdquo; Thumbnails and download links
          appear for each converted file so you can quickly save them to your
          device or share them elsewhere.
        </p>
        <h3 className="text-sm font-semibold text-slate-900">
          Supported image formats
        </h3>
        <p>
          The converter accepts any format your browser can decode, including
          JPEG, PNG, WEBP, and GIF. For HEIC files, it first attempts to decode
          them using in-browser capabilities via the Canvas and ImageBitmap
          APIs. On some platforms, this is enough to handle modern HEIC photos
          directly. On others, HEIC support may be limited or absent. In that
          case, some images may fail to load, and the tool will let you know
          which files could not be converted.
        </p>
        <p>
          Once an image is decoded, the tool draws it onto a hidden canvas,
          optionally scales the resolution, and then exports it as JPG, PNG, or
          WEBP. This design makes the converter a flexible{" "}
          <span className="font-semibold">
            image format converter online
          </span>{" "}
          that works for both HEIC and traditional photo formats.
        </p>
        <h3 className="text-sm font-semibold text-slate-900">
          How the max file size limit works
        </h3>
        <p>
          When you specify a &ldquo;Max output size&rdquo; in kilobytes, the
          converter uses that value as a soft target for JPG and WEBP outputs.
          It starts at your chosen quality level and, if the result is too
          large, automatically lowers the quality in several steps until the
          file is at or below the requested size or the quality floor is
          reached. Because compression is approximate, the final size may be
          slightly above or below the target, but this provides a convenient way
          to keep files small for email or web uploads.
        </p>
        <p>
          You can also use the scale slider to reduce resolution before
          encoding, which is often the most effective way to shrink images.
          Combining a moderate scale (for example 50–75%) with a max size limit
          gives much more predictable results than quality adjustment alone.
          PNG is always lossless and ignores quality settings, so size control
          there relies on scaling only.
        </p>
        <h3 className="text-sm font-semibold text-slate-900">
          Privacy: images never leave your device
        </h3>
        <p>
          This tool is designed as a{" "}
          <span className="font-semibold">
            no upload HEIC converter
          </span>{" "}
          and{" "}
          <span className="font-semibold">
            client-side image converter
          </span>
          . All decoding and encoding happens in your browser memory. The
          converter does not send images to any server or store them anywhere
          except temporarily in your own tab. When you refresh or close the
          page, any in-memory images and URLs are discarded.
        </p>
        <p>
          Because everything runs locally, you can safely process personal
          photos or sensitive screenshots without worrying about where they are
          being uploaded. This approach also makes the tool fast: once the page
          is loaded, conversions are limited only by your device&apos;s CPU and
          browser capabilities.
        </p>
        <p>
          If you work regularly with HEIC images from phones, or you just need a
          quick way to convert pictures to JPG, PNG, or WEBP for the web, this
          browser-based converter provides a simple, private workflow that you
          can reuse anytime.
        </p>
      </section>
    </main>
  );
};

export default ImageFormatConverterPage;


