/**
 * Crops an image using a canvas from react-easy-crop's pixel area output.
 * Returns a new File of the cropped region.
 */
export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function getCroppedImageFile(
  imageSrc: string,
  pixelCrop: PixelCrop,
  originalFileName: string
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error("Canvas to Blob failed")); return; }
      resolve(new File([blob], originalFileName, { type: "image/jpeg" }));
    }, "image/jpeg", 0.92);
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

/** All A-series paper has ratio 1:√2. Returns width/height. */
export function getPaperAspectRatio(orientation: "portrait" | "landscape"): number {
  const ratio = 1 / Math.SQRT2; // ≈ 0.7071
  return orientation === "portrait" ? ratio : 1 / ratio;
}

/** Paper size display labels with dimensions */
export const PAPER_DIMENSIONS: Record<string, { mm: string }> = {
  A5: { mm: "148 × 210 mm" },
  A4: { mm: "210 × 297 mm" },
  A3: { mm: "297 × 420 mm" },
  A2: { mm: "420 × 594 mm" },
};

/** Paper dimensions in mm (portrait: width < height) */
export const PAPER_MM: Record<string, { w: number; h: number }> = {
  A5: { w: 148, h: 210 },
  A4: { w: 210, h: 297 },
  A3: { w: 297, h: 420 },
  A2: { w: 420, h: 594 },
};

/** Frame border in mm */
export const FRAME_BORDER_MM = 10;

/**
 * Returns the border as a fraction of the crop area dimensions.
 * Used to position the frame overlay on screen.
 */
export function getBorderFraction(
  size: string,
  orientation: "portrait" | "landscape"
): { x: number; y: number } {
  const base = PAPER_MM[size];
  const w = orientation === "portrait" ? base.w : base.h;
  const h = orientation === "portrait" ? base.h : base.w;
  return {
    x: FRAME_BORDER_MM / w, // fraction of width per side
    y: FRAME_BORDER_MM / h, // fraction of height per side
  };
}
