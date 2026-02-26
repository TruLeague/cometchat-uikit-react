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
 * Returns `true` when the file (or its URL) looks like a HEIC/HEIF image.
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
 * Convert a HEIC/HEIF `File` to a JPEG `File`.
 * Returns the original file unchanged if conversion fails or if the file is
 * not actually HEIC/HEIF.
 */
export async function convertHeicFileToJpeg(file: File): Promise<File> {
  if (!isHeicFile(file)) return file;
  try {
    const jpegBlob = (await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92,
    })) as Blob;

    const baseName = file.name
      .replace(/\.heic$/i, "")
      .replace(/\.heif$/i, "");
    return new File([jpegBlob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } catch (error) {
    console.warn("[heicSupport] HEIC→JPEG conversion failed, using original file:", error);
    return file;
  }
}

/**
 * Convert a HEIC/HEIF `Blob` (e.g. downloaded from a URL) to a displayable
 * blob URL.  Returns `null` if the blob is not HEIC or conversion fails, in
 * which case the caller should fall back to the original URL.
 */
export async function convertHeicBlobToObjectUrl(blob: Blob, srcUrl: string): Promise<string | null> {
  if (!isHeicFile(srcUrl) && !HEIC_MIMES.has(blob.type?.toLowerCase() ?? "")) {
    return null;
  }
  try {
    const jpegBlob = (await heic2any({
      blob,
      toType: "image/jpeg",
      quality: 0.92,
    })) as Blob;
    return URL.createObjectURL(jpegBlob);
  } catch (error) {
    console.warn("[heicSupport] HEIC→JPEG conversion failed for display:", error);
    return null;
  }
}
