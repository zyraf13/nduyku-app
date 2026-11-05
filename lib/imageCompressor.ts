// ponytail: Canvas resize client-side; jpeg 0.8 — video dilewati apa adanya
export async function compressImage(file: File, maxW = 1200, quality = 0.8): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    return file; // format tak terbaca Canvas — kirim mentah, biar Storage yang urus
  }
  const scale = Math.min(1, maxW / bmp.width);
  if (scale === 1 && file.size < 300_000) return file;
  const cvs = document.createElement("canvas");
  cvs.width = Math.round(bmp.width * scale);
  cvs.height = Math.round(bmp.height * scale);
  cvs.getContext("2d")!.drawImage(bmp, 0, 0, cvs.width, cvs.height);
  const blob: Blob = await new Promise((res) => cvs.toBlob((b) => res(b!), "image/jpeg", quality));
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}
