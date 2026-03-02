import heic2any from "heic2any";

/**
 * HEIC/HEIF support utilities.
 *
 * Apple devices capture photos in HEIC/HEIF by default.  Most desktop browsers
 * (Chrome, Edge, Firefox on Windows/Linux) cannot decode these formats natively.
 * These helpers convert HEIC/HEIF content to JPEG so images can be displayed
 * and uploaded universally — the same approach WhatsApp and other major
 * messaging apps use.
 *
 * Library: heic2any (uses libheif compiled to WASM)
 * https://github.com/nicolo-ribaudo/heic2any
 */

/** File extensions considered HEIC/HEIF. */
const HEIC_EXTENSIONS = new Set(["heic", "heif"]);

/** MIME types considered HEIC/HEIF. */
const HEIC_MIMES = new Set(["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"]);

/**
 * Known image magic-byte signatures.  If a ".heic" file actually starts with
 * one of these, it is a regular image that was simply renamed → no conversion
 * needed, the browser can render it directly.
 */
const IMAGE_SIGNATURES: { mime: string; bytes: number[] }[] = [
  { mime: "image/jpeg",  bytes: [0xFF, 0xD8, 0xFF] },
  { mime: "image/png",   bytes: [0x89, 0x50, 0x4E, 0x47] },
  { mime: "image/gif",   bytes: [0x47, 0x49, 0x46] },
  { mime: "image/webp",  bytes: [0x52, 0x49, 0x46, 0x46] }, // "RIFF"
  { mime: "image/bmp",   bytes: [0x42, 0x4D] },
];

/**
 * Read the first few bytes of a Blob/File and detect if it's actually a
 * browser-native image format (JPEG, PNG, GIF, WebP, BMP) regardless of the
 * file extension.  Returns the detected MIME or `null` if unknown.
 */
async function detectNativeImageMime(blob: Blob): Promise<string | null> {
  const header = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  for (const sig of IMAGE_SIGNATURES) {
    if (sig.bytes.every((b, i) => header[i] === b)) {
      return sig.mime;
    }
  }
  return null;
}

/**
 * Returns `true` when the file (or its URL) looks like a HEIC/HEIF image
 * based on its name / extension / MIME. Note: this does NOT inspect file
 * content — use `detectNativeImageMime` to rule out renamed JPEGs/PNGs.
 */
export function isHeicFile(fileOrUrl: File | string): boolean {
  if (typeof fileOrUrl === "string") {
    // URL — check the pathname extension
    try {
      const pathname = new URL(fileOrUrl, "https://x").pathname;
      const ext = pathname.split(".").pop()?.toLowerCase() ?? "";
      return HEIC_EXTENSIONS.has(ext);
    } catch {
      return false;
    }
  }
  // File object
  const ext = fileOrUrl.name.split(".").pop()?.toLowerCase() ?? "";
  if (HEIC_EXTENSIONS.has(ext)) return true;
  return HEIC_MIMES.has(fileOrUrl.type.toLowerCase());
}

/**
 * Normalise the heic2any result which may be a single Blob or an array of
 * Blobs (for multi-image HEIC containers like Live Photos / burst shots).
 * We always take the first image.
 */
function firstBlob(result: Blob | Blob[]): Blob {
  return Array.isArray(result) ? result[0] : result;
}

/**
 * Convert a HEIC/HEIF `File` to a JPEG `File`.
 *
 * - If the file's bytes reveal it's actually a JPEG/PNG/WebP that was merely
 *   renamed to .heic, it is returned as-is (browsers handle it natively).
 * - For genuine HEIC data the file is converted via heic2any.
 * - Throws if the file is HEIC and conversion fails so callers can handle the
 *   error explicitly (e.g. show a placeholder instead of a broken image).
 * - Returns the original file unchanged if it is not HEIC/HEIF by name.
 */
export async function convertHeicFileToJpeg(file: File): Promise<File> {
  if (!isHeicFile(file)) return file;

  // Check if the file is actually a browser-native image renamed to .heic/.heif
  const nativeMime = await detectNativeImageMime(file);
  if (nativeMime) {
    console.info(`[heicSupport] "${file.name}" has .heic extension but is actually ${nativeMime} — skipping conversion.`);
    // Return a File with the correct MIME so the browser renders it properly.
    const ext = nativeMime === "image/jpeg" ? ".jpg"
              : nativeMime === "image/png"  ? ".png"
              : nativeMime === "image/gif"  ? ".gif"
              : nativeMime === "image/webp" ? ".webp"
              : ".bmp";
    const baseName = file.name.replace(/\.heic$/i, "").replace(/\.heif$/i, "");
    return new File([file], `${baseName}${ext}`, {
      type: nativeMime,
      lastModified: file.lastModified,
    });
  }

  const jpegBlob = firstBlob(await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  }));

  const baseName = file.name
    .replace(/\.heic$/i, "")
    .replace(/\.heif$/i, "");
  return new File([jpegBlob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}

/**
 * Convert a HEIC/HEIF `Blob` (e.g. downloaded from a URL) to a displayable
 * blob URL.  Returns `null` if the blob is not HEIC or conversion fails, in
 * which case the caller should fall back to the original URL.
 *
 * Handles renamed files: if the blob is actually a JPEG/PNG, returns an
 * object URL directly without conversion.
 */
export async function convertHeicBlobToObjectUrl(blob: Blob, srcUrl: string): Promise<string | null> {
  if (!isHeicFile(srcUrl) && !HEIC_MIMES.has(blob.type?.toLowerCase() ?? "")) {
    return null;
  }

  // Check if the blob is actually a browser-native image format (renamed .heic)
  const nativeMime = await detectNativeImageMime(blob);
  if (nativeMime) {
    console.info(`[heicSupport] Blob from "${srcUrl}" has .heic URL but is actually ${nativeMime} — using directly.`);
    return URL.createObjectURL(new Blob([blob], { type: nativeMime }));
  }

  try {
    const jpegBlob = firstBlob(await heic2any({
      blob,
      toType: "image/jpeg",
      quality: 0.92,
    }));
    return URL.createObjectURL(jpegBlob);
  } catch (error) {
    console.warn("[heicSupport] HEIC→JPEG conversion failed for display:", error);
    return null;
  }
}
