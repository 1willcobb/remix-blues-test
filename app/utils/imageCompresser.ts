// Compress the image file
import imageCompression from "browser-image-compression";

export async function compressFile(file) {
  console.log("Compressing file:", file);
  const options = {
    maxSizeMB: 0.75,
    maxWidthOrHeight: 800,
    useWebWorker: true,
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    console.log("Compressed file:", compressedBlob);

    if (compressedBlob.size === 0) {
      throw new Error("Compressed file is empty.");
    }

    // Create a new File object from the Blob
    const compressedFile = new File(
      [compressedBlob],
      `compressed-${file.name}` || `compressed-${Date.now()}.jpg`,
      {
        type: file.type || "image/jpeg",
      }
    );

    return { compressedFile };
  } catch (error) {
    console.error("Error compressing file:", error);
    throw error;
  }
}