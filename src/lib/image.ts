import sharp from "sharp";

// This runs on a 1 vCPU / 2GB VPS that's already documented as tight under
// load — sharp's default concurrency spins up multiple libvips threads per
// image, and saveUploadedImages processes every file in a save concurrently
// (Promise.all), so an admin uploading a few photos at once could run
// several decode/resize pipelines in parallel and exhaust memory. Capping
// this to 1 trades a little latency for not risking a native crash, which
// (unlike a JS exception) no try/catch here can recover from — the request
// just dies.
sharp.concurrency(1);

const MAX_DIMENSION = 1600;
// Storefront <Image> tags now request quality 90 for product photos, so
// storing the source at a lower quality would just cap it there anyway.
const JPEG_QUALITY = 90;

export type ProcessedImage = { buffer: Buffer; contentType: string; ext: string };

// Phone photos routinely come in at 3000-4000px and several MB each —
// nothing on the site ever displays a product photo anywhere near that
// size, so storing (and uploading, and later re-downloading) the original
// is pure waste. Resizes to a sane max dimension and normalizes to JPEG,
// which compresses photographic content far better than PNG. Animated GIFs
// are passed through untouched, since resizing/re-encoding one needs
// special multi-frame handling that isn't worth it for product photos
// (which are essentially never animated).
export async function processProductImage(buffer: Buffer, contentType: string): Promise<ProcessedImage> {
  if (contentType === "image/gif") {
    return { buffer, contentType, ext: ".gif" };
  }

  async function encode(pipeline: ReturnType<typeof sharp>): Promise<Buffer> {
    return pipeline
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();
  }

  let resized: Buffer;
  try {
    // Product photos are routinely shot small-and-centered on a big plain
    // backdrop (mockup-style), which leaves a lot of empty margin baked
    // into the file itself — the product card's object-cover crop can only
    // trim whichever edge overflows its box, not empty space inside the
    // photo. trim() auto-crops uniform-color padding from the edges before
    // resizing, so the actual garment fills the frame instead. It throws
    // on an image with no uniform border to find (e.g. a flat test swatch
    // with no edges at all), so falls back to the untrimmed image then.
    resized = await encode(sharp(buffer).rotate().trim());
  } catch {
    resized = await encode(sharp(buffer).rotate());
  }

  return { buffer: resized, contentType: "image/jpeg", ext: ".jpg" };
}
