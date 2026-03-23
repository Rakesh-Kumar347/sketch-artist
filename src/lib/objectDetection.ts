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

// Foreground focus thresholds
const MIN_AREA_RATIO = 0.02;    // subject bbox must cover ≥ 2% of the image
const MIN_RELATIVE_AREA = 0.20; // subject must be ≥ 20% of the largest subject's area

/**
 * Filters detected subjects to only those that appear to be in focus / foreground.
 * Uses bounding box area as a proxy for depth — background subjects are small.
 */
function filterForeground(
  subjects: DetectedObject[],
  imageWidth: number,
  imageHeight: number
): DetectedObject[] {
  if (subjects.length === 0) return subjects;

  const imageArea = imageWidth * imageHeight;

  // Step 1: drop subjects whose bbox is too small relative to the full image
  const large = subjects.filter(
    (o) => (o.bbox[2] * o.bbox[3]) / imageArea >= MIN_AREA_RATIO
  );

  // Fallback: if nothing passes (very zoomed-out shot), keep all subjects
  const candidates = large.length > 0 ? large : subjects;

  // Step 2: drop subjects much smaller than the largest detected subject
  const maxArea = Math.max(...candidates.map((o) => o.bbox[2] * o.bbox[3]));
  return candidates.filter(
    (o) => (o.bbox[2] * o.bbox[3]) / maxArea >= MIN_RELATIVE_AREA
  );
}

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

  // All subject candidates: people + major animals (score ≥ 0.5)
  const subjectCandidates = allObjects.filter(
    (o) => o.score >= 0.5 && (PERSON_CLASSES.has(o.label) || ANIMAL_CLASSES.has(o.label))
  );

  // Keep only foreground subjects (in-focus, not distant background figures)
  const subjectObjects = filterForeground(subjectCandidates, width, height);

  const detectedLabels = subjectObjects.map((o) => o.label);
  const subjectCount = subjectObjects.length;

  // Background complexity: non-subject objects + subjects filtered out as background
  const nonSubjectObjects = allObjects.filter(
    (o) => !PERSON_CLASSES.has(o.label) && !ANIMAL_CLASSES.has(o.label)
  );
  const backgroundSubjects = subjectCandidates.filter((o) => !subjectObjects.includes(o));
  const backgroundComplexity = Math.min(
    (nonSubjectObjects.length + backgroundSubjects.length) / 5,
    1
  );

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
