import { uploadRemoteImage } from "@/lib/cloudinary";

export type NotionFileObject =
  | { type: "external"; external: { url: string } }
  | { type: "file"; file: { url: string } }
  | null
  | undefined;

export function getNotionFileUrl(file?: NotionFileObject) {
  if (!file) {
    return null;
  }

  if (file.type === "external") {
    return file.external.url;
  }

  if (file.type === "file") {
    return file.file.url;
  }

  return null;
}

function extractImageUrlFromProxyPath(url: URL) {
  const encodedPath = url.pathname.replace(/^\/image\//, "");

  if (!encodedPath) {
    return null;
  }

  return decodeURIComponent(encodedPath);
}

export function getOriginalNotionImageUrl(url: string) {
  if (!url.includes("notion.so/image")) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    const searchParamUrl = parsedUrl.searchParams.get("url");

    if (searchParamUrl) {
      return decodeURIComponent(searchParamUrl);
    }

    return extractImageUrlFromProxyPath(parsedUrl) ?? url;
  } catch {
    return decodeURIComponent(url);
  }
}

export async function getHostedImageUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  return uploadRemoteImage(getOriginalNotionImageUrl(url));
}
