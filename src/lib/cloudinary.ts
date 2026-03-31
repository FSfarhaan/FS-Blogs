import { v2 as cloudinary } from "cloudinary";
import { getRequiredEnv } from "@/lib/env";

const uploadedImageCache = new Map<string, string>();
let isConfigured = false;

function configureCloudinary() {
  if (isConfigured) {
    return cloudinary;
  }

  cloudinary.config({
    cloud_name: getRequiredEnv("CLOUDINARY_CLOUD_NAME"),
    api_key: getRequiredEnv("CLOUDINARY_API_KEY"),
    api_secret: getRequiredEnv("CLOUDINARY_API_SECRET"),
  });

  isConfigured = true;

  return cloudinary;
}

export function getCachedCloudinaryUrl(sourceUrl: string) {
  return uploadedImageCache.get(sourceUrl);
}

export async function uploadRemoteImage(sourceUrl: string) {
  const cachedUrl = getCachedCloudinaryUrl(sourceUrl);

  if (cachedUrl) {
    return cachedUrl;
  }

  const client = configureCloudinary();
  const upload = await client.uploader.upload(sourceUrl, {
    folder: "blog-images",
    resource_type: "image",
  });

  uploadedImageCache.set(sourceUrl, upload.secure_url);

  return upload.secure_url;
}

export default cloudinary;
