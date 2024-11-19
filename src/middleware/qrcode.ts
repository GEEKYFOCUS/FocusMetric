import QRCode from "qrcode";
import AppError from "../utils/appError";
import { HttpStatus } from "../helpers/httpsStatus";

// Function to generate QR code based on URL
export async function generateQRCode(url: string) {
  try {
    const qrCodeData = await QRCode.toDataURL(url);
    return qrCodeData;
  } catch (err) {
    console.error("Error generating QR code:", err);
    new AppError(
      "Failed to generate QR code",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
