import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string,
  publicId?: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder,
      resource_type: "image",
    };
    if (publicId) uploadOptions.public_id = publicId;

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error || !result) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      })
      .end(fileBuffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export async function getPortfolioImages(): Promise<PortfolioImage[]> {
  const result = await cloudinary.search
    .expression("folder:sketch-artist/portfolio")
    .sort_by("created_at", "desc")
    .with_field("context")
    .max_results(50)
    .execute();

  return result.resources.map((r: CloudinaryResource) => ({
    id: r.public_id,
    url: r.secure_url,
    title: r.context?.custom?.title || "Untitled",
    category: r.context?.custom?.category || "Portrait",
    description: r.context?.custom?.description || "",
    createdAt: r.created_at,
  }));
}

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  created_at: string;
  context?: {
    custom?: {
      title?: string;
      category?: string;
      description?: string;
    };
  };
}

export interface PortfolioImage {
  id: string;
  url: string;
  title: string;
  category: string;
  description: string;
  createdAt: string;
}
