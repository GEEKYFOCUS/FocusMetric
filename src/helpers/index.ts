import crypto from "crypto";
const SECRET: string = "FOCUS_SECRET_API_KEYS";
export const random = (): string => crypto.randomBytes(256).toString("base64");
export const authentication = (password: string, salt: string): any => {
  return crypto
    .createHmac("sha256", [salt, password].join("/"))
    .update(SECRET)
    .digest("hex");
};
