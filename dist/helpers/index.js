import crypto from "crypto";
const SECRET = "FOCUS_SECRET_API_KEYS";
export const random = () => crypto.randomBytes(256).toString("base64");
export const authentication = (password, salt) => {
    return crypto
        .createHmac("sha256", [salt, password].join("/"))
        .update(SECRET)
        .digest("hex");
};
