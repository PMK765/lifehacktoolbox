import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";

const baseUrl = "https://lifehacktoolbox.com";

const isRouteGroup = (segment: string) =>
  segment.startsWith("(") && segment.endsWith(")");

const isDynamicSegment = (segment: string) =>
  segment.includes("[") || segment.includes("]");

const collectAppPagePaths = (directory: string, segments: string[] = []) => {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  const hasPageFile = entries.some(
    (entry) =>
      entry.isFile() &&
      (entry.name === "page.tsx" || entry.name === "page.js")
  );

  const paths: string[] = [];

  if (hasPageFile) {
    const urlPath =
      segments.length === 0 ? "/" : `/${segments.join("/")}`;
    paths.push(urlPath);
  }

  entries.forEach((entry) => {
    if (!entry.isDirectory()) {
      return;
    }

    if (entry.name === "api") {
      return;
    }

    const nextDirectory = path.join(directory, entry.name);
    const nextSegments = [...segments];

    if (!isRouteGroup(entry.name)) {
      if (isDynamicSegment(entry.name)) {
        return;
      }
      nextSegments.push(entry.name);
    }

    const childPaths = collectAppPagePaths(nextDirectory, nextSegments);
    if (childPaths.length > 0) {
      paths.push(...childPaths);
    }
  });

  return paths;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const appDirectory = path.join(process.cwd(), "app");
  const paths = collectAppPagePaths(appDirectory);
  const lastModified = new Date();

  return paths.map((urlPath) => ({
    url: `${baseUrl}${urlPath}`,
    lastModified
  }));
}


