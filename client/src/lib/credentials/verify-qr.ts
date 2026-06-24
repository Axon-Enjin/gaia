import QRCode from "qrcode";
import { verifyUrlFor } from "./issuer-config";

const QR_OPTS = {
  errorCorrectionLevel: "M" as const,
  margin: 1,
  width: 240,
};

/** PNG data URL for a credential's public verify link (server-only). */
export async function verifyQrDataUrlFor(credentialId: string): Promise<string> {
  return QRCode.toDataURL(verifyUrlFor(credentialId), QR_OPTS);
}
