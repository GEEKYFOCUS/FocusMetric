var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import useragent from "useragent";
import UAParser from "ua-parser-js";
import { nanoid } from "nanoid";
import geoip from "geoip-lite";
import Url from "../models/urlShortnerModel";
import catchAsync from "../utils/catchAsync";
import { HttpStatus } from "../helpers/httpsStatus";
import { generateQRCode } from "../middleware/qrcode";
export const createShortUrl = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { originalUrl } = req.body;
    const baseUrl = process.env.BASE_URL;
    const shortCode = nanoid();
    const existingUrl = yield Url.findOne({ originalUrl });
    if (existingUrl) {
        return res.status(409).json({
            status: "success",
            data: {
                url: existingUrl.shortUrl,
                message: "URL already exists",
            },
        });
    }
    const shortUrl = `${baseUrl}/${shortCode}`;
    const newUrl = new Url({
        originalUrl,
        shortUrl,
        user: req.user ? req.user._id : null,
        clicks: 0,
    });
    yield newUrl.save();
    res.status(HttpStatus.OK).json({
        status: "success",
        data: {
            url: newUrl.shortUrl,
            message: "URL created successfully",
        },
    });
}));
export const handleRedirectToOriginalUrl = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { shortCode } = req.params;
    console.log(shortCode, "this is shortcode");
    const url = yield Url.findOne({
        shortUrl: `${process.env.BASE_URL}/${shortCode}`,
    });
    console.log(url, "this is shortUrl");
    const parser = new UAParser();
    const uaResult = parser.setUA(req.headers["user-agent"] || "").getResult();
    const device = uaResult.device.vendor
        ? `${uaResult.device.vendor} ${uaResult.device.model}`
        : "Unknown Device"; // Should give more detailed device info
    if (!url) {
        return res.status(404).json({
            status: "fail",
            message: "URL not found",
        });
    }
    // increase the url clicks count
    url.clicks++;
    url.lastAccessedAt = new Date();
    const todayDate = new Date();
    if (url.date.includes(todayDate)) {
        url.date = url.date;
    }
    else {
        url.date.push(todayDate);
    }
    // Track user data
    const ip = ((_a = req.ip) === null || _a === void 0 ? void 0 : _a.includes(":"))
        ? req.ip.split(":").pop() || "127.0.0.1"
        : req.ip || "Unknown";
    const agent = req.headers["user-agent"]
        ? useragent.parse(req.headers["user-agent"])
        : null;
    const testIp = "8.8.8.8"; // 👀👀 Google public DNS IP
    const geo = geoip.lookup(ip === "127.0.0.1" ? testIp : ip) || {
        country: "Unknown",
    };
    console.log(req.headers["user-agent"], "agent.....");
    url.trackingData.push({
        ip,
        device,
        os: agent ? agent.os.toString() : "Unknown",
        browser: agent ? agent.toAgent() : "Unknown",
        location: geo.country,
    });
    yield url.save();
    res.redirect(url.originalUrl);
}));
export const getUserUrls = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user ? req.user._id : null;
    const urls = yield Url.find({ user: userId });
    console.log(userId, urls);
    if (!urls) {
        return res.status(HttpStatus.NOT_FOUND).json({
            status: "success",
            message: "No URLs found for this user",
        });
    }
    res.status(HttpStatus.OK).json({
        status: "success",
        data: {
            message: "All available URls",
            urls,
        },
    });
}));
export const getQRCodeForUrl = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user ? req.user._id : null;
        console.log(userId, "this is userId");
        const { urlId } = req.params;
        // Find the URL
        const urlRecord = yield Url.findOne({ _id: urlId });
        console.log(urlRecord);
        if (!urlRecord) {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: "fail",
                message: "URL not found for this user.",
            });
        }
        // Update the lastAccessedAt field
        urlRecord.lastAccessedAt = new Date();
        yield urlRecord.save({ validateBeforeSave: false });
        // Generate QR code
        const qrCode = yield generateQRCode(urlRecord.shortUrl);
        // Return the QR code
        res.status(HttpStatus.OK).json({
            status: "success",
            data: {
                qrCode, // Data URL of the QR code
                message: "QR code generated and last accessed time updated",
            },
        });
    }
    catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: "fail",
            message: "Error generating QR code",
        });
    }
}));
//# sourceMappingURL=urlController.js.map