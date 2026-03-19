/**
 * Object detection using TensorFlow.js + COCO-SSD.
 * Runs fully server-side — no external API calls.
 *
 * Detects people and animals to:
 *  1. Auto-count subjects for pricing
 *  2. Enrich complexity scoring
 */

import sharp from "sharp";

// COCO-SSD classes that count as "subjects" for a sketch artist
const PERSON_CLASSES = new Set(["person"]);
const ANIMAL_CLASSES = new Set([
  "cat", "dog", "horse", "cow", "elephant",
  "bear", "zebra", "giraffe", "bird", "sheep",
]);

export interface DetectionResult {
  subjectCount: number;           // auto-detected count for pricing
  subjectKey: "1" | "2" | "3" | "4+"; // mapped to pricing tier
  detectedLabels: string[];       // e.g. ["person", "person", "dog"]
  allObjects: DetectedObject[];   // full list with scores
  backgroundComplexity: number;   // 0–1, based on non-subject object count
}

export interface DetectedObject {
  label: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, w, h]
}

// Singleton model — loaded once per process lifetime
let modelCache: import("@tensorflow-models/coco-ssd").ObjectDetection | null = null;
let loadingPromise: Promise<import("@tensorflow-models/coco-ssd").ObjectDetection> | null = null;

async function getModel() {
  if (modelCache) return modelCache;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    // Register the CPU backend (pure JS, no native addon)
    await import("@tensorflow/tfjs");
    const cocoSsd = await import("@tensorflow-models/coco-ssd");
    const model = await cocoSsd.load({ base: "lite_mobilenet_v2" });
    modelCache = model;
    console.log("[COCO-SSD] Model loaded");
    return model;
  })();

  return loadingPromise;
}

/**
 * Run COCO-SSD detection on an image buffer.
 * Returns subject count, labels, and background complexity score.
 */
export async function detectObjects(imageBuffer: Buffer): Promise<DetectionResult> {
  // Resize to 416×416 — good balance of speed vs accuracy for COCO-SSD
  const { data, info } = await sharp(imageBuffer)
    .resize(416, 416, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;

  // Dynamically import tf to create the tensor
  const tf = await import("@tensorflow/tfjs");

  // Create a 3D tensor [H, W, 3] from raw RGB bytes
  const tensor = tf.tensor3d(new Uint8Array(data), [height, width, 3], "int32");

  let predictions: import("@tensorflow-models/coco-ssd").DetectedObject[] = [];
  try {
    const model = await getModel();
    predictions = await model.detect(tensor as unknown as ImageData, 20, 0.4);
  } finally {
    tensor.dispose();
  }

  // Map predictions to our format
  const allObjects: DetectedObject[] = predictions.map((p) => ({
    label: p.class,
    score: Math.round(p.score * 100) / 100,
    bbox: p.bbox as [number, number, number, number],
  }));

  // Count subjects: people + major animals (score ≥ 0.5)
  const subjectObjects = allObjects.filter(
    (o) => o.score >= 0.5 && (PERSON_CLASSES.has(o.label) || ANIMAL_CLASSES.has(o.label))
  );

  const detectedLabels = subjectObjects.map((o) => o.label);
  const subjectCount = subjectObjects.length;

  // Background complexity: non-subject objects detected
  const backgroundObjects = allObjects.filter(
    (o) => !PERSON_CLASSES.has(o.label) && !ANIMAL_CLASSES.has(o.label)
  );
  const backgroundComplexity = Math.min(backgroundObjects.length / 5, 1);

  const subjectKey = toSubjectKey(subjectCount);

  return {
    subjectCount,
    subjectKey,
    detectedLabels,
    allObjects,
    backgroundComplexity,
  };
}

function toSubjectKey(count: number): "1" | "2" | "3" | "4+" {
  if (count <= 1) return "1";
  if (count === 2) return "2";
  if (count === 3) return "3";
  return "4+";
}
