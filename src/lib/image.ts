import sharp from "sharp";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 82;

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

  const resized = await sharp(buffer)
    .rotate() // respects EXIF orientation before resizing, then strips it
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();

  return { buffer: resized, contentType: "image/jpeg", ext: ".jpg" };
}
