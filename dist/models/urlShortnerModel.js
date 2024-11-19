import mongoose, { Schema, model } from "mongoose";
const urlSchema = new Schema({
    originalUrl: { type: String, required: true },
    shortUrl: { type: String, required: true, unique: true },
    clicks: { type: Number, default: 0 },
    date: [Date],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "A Url must belong to a User"],
    },
    lastAccessedAt: {
        type: Date,
        default: new Date(),
    },
    trackingData: [
        {
            ip: String,
            device: String,
            os: String,
            browser: String,
            location: String,
        },
    ],
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
const Url = model("Url", urlSchema);
export default Url;
// interface IUrl extends Document {
//   originalUrl: string;
//   shortUrl: string;
//   clicks: number;
//   date: Date;
//   trackingData: {
//     ip: string;
//     device: string;
//     os: string;
//     browser: string;
//     location: string;
//   }[];
// }
// const urlSchema: Schema = new Schema({
//   originalUrl: { type: String, required: true },
//   shortUrl: { type: String, required: true, unique: true },
//   clicks: { type: Number, default: 0 },
//   date: { type: Date, default: Date.now },
//   trackingData: [
//     {
//       ip: String,
//       device: String,
//       os: String,
//       browser: String,
//       location: String,
//     },
//   ],
// });
// export const Url = mongoose.model<IUrl>("Url", urlSchema);
