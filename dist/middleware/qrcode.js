var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import QRCode from "qrcode";
import AppError from "../utils/appError.js";
import { HttpStatus } from "../helpers/httpsStatus.js";
// Function to generate QR code based on URL
export function generateQRCode(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const qrCodeData = yield QRCode.toDataURL(url);
            return qrCodeData;
        }
        catch (err) {
            console.error("Error generating QR code:", err);
            new AppError("Failed to generate QR code", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    });
}
