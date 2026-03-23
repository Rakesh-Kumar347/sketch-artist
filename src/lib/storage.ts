/**
 * Storage helpers — Cloudinary for images, exports match the interface
 * expected by portfolio and commission routes.
 */

import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import cloudinary from "@/lib/cloudinary";

export interface PortfolioImage {
  id: string;
  storagePath: string;
  url: string;
  title: string;
  category: string;
  description: string;
  createdAt: string;
}

// ─── Portfolio images ─────────────────────────────────────────────────────────

export async function uploadPortfolioImage(
  buffer: Buffer,
  _mimeType: string,
  title: string,
  category: string,
  description: string
): Promise<PortfolioImage> {
  const { url, publicId } = await uploadToCloudinary(buffer, "sketch-artist/portfolio");

  await cloudinary.uploader.explicit(publicId, {
    type: "upload",
    context: `title=${title}|category=${category}|description=${description}`,
  });

  return {
    id: publicId,
    storagePath: publicId,
    url,
    title,
    category,
    description,
    createdAt: new Date().toISOString(),
  };
}

export async function getPortfolioImages(): Promise<PortfolioImage[]> {
  const result = await cloudinary.search
    .expression("folder:sketch-artist/portfolio")
    .sort_by("created_at", "desc")
    .with_field("context")
    .max_results(50)
    .execute();

  return (result.resources as CloudinaryResource[]).map((r) => ({
    id: r.public_id,
    storagePath: r.public_id,
    url: r.secure_url,
    title: r.context?.custom?.title || "Untitled",
    category: r.context?.custom?.category || "Portrait",
    description: r.context?.custom?.description || "",
    createdAt: r.created_at,
  }));
}

export async function deletePortfolioImage(id: string): Promise<void> {
  await deleteFromCloudinary(id);
}

// ─── Reference images (commission uploads) ───────────────────────────────────

export async function uploadReferenceImage(
  buffer: Buffer,
  _orderId: string
): Promise<{ url: string; path: string }> {
  const { url, publicId } = await uploadToCloudinary(buffer, "sketch-artist/references");
  return { url, path: publicId };
}

// ─── Types ────────────────────────────────────────────────────────────────────

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
