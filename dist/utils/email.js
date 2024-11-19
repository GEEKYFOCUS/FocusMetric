// import { fileURLToPath, FileUrlToPathOptions } from "url";
// import path from "path";
// import nodemailer from "nodemailer";
// import pug from "pug";
// import { convert, htmlToText } from "html-to-text";
// import SMTPTransport from "nodemailer/lib/smtp-transport";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// class Email {
//   to: string;
//   from: string;
//   url: string;
//   firstName: string;
//   constructor(
//     public user: any,
//     public originalUrl: string
//   ) {
//     console.log("message reach here");
//     console.log(user.email);
//     this.to = user.email;
//     this.from = ` Abdulhakeem  < ${process.env.EMAIL_FROM}>`;
//     this.url = originalUrl;
//     this.firstName = user.name.split(" ")[0];
//   }
//   newTransport() {
//     if (process.env.NODE_ENV === "production") {
//       const transporter = nodemailer.createTransport({
//         service: "smtp.gmail.com",
//         port: 465,
//         auth: {
//           user: process.env.EMAIL_FROM,
//           pass: process.env.EMAIL_PASSWORD,
//         },
//       });
//       console.log(transporter);
//       return transporter;
//     }
//     // Explictly define
//     const devTransportOps: SMTPTransport.Options = {
//       host: process.env.EMAIL_HOST,
//       port: parseInt(process.env.EMAIL_PORT as string, 10),
//       auth: {
//         user: process.env.EMAIL_FROM,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//       tls: {
//         rejectUnauthorized: false,
//       },
//     };
//     console.log(devTransportOps, "mail ops is available");
//     const node = nodemailer.createTransport(devTransportOps);
//     console.log(node, "mail node is available");
//     return node;
//   }
//   async send(template: any, subject: any) {
//     //pug template rendering
//     console.log("message reach template");
//     const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
//       firstName: this.firstName,
//       url: this.url,
//       title: subject,
//     });
//     // mailOptions
//     const mailOptions = {
//       from: this.from,
//       to: this.to,
//       subject: subject,
//       html,
//       text: convert(html),
//     };
//     console.log(mailOptions, "mailOptions");
//     const mailRes = await this.newTransport().sendMail(mailOptions);
//     console.log(mailRes, "MailRes");
//   }
//   async sendWelcome() {
//     await this.send("welcome", "Welcome to focusMetric!");
//   }
//   async sendResetPassword() {
//     await this.send(
//       "passwordReset",
//       "Your password reset token  is only valid for 10 minutes!"
//     );
//   }
//   async sendVerificationEmail() {
//     console.log("message reach verification");
//     const mail = await this.send("verifyUser", "Verify your email address");
//     console.log(mail, "sheduled email");
//     return mail;
//   }
// }
// export default Email;
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import pug from "pug";
import { convert } from "html-to-text";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(" ")[0];
        this.url = url;
        this.from = `Abdulhakeem Gidado <${process.env.EMAIL_FROM}>`;
    }
    newTransport() {
        if (process.env.NODE_ENV === "production") {
            const transporter = nodemailer.createTransport({
                service: "smtp.gmail.com",
                port: 465,
                auth: {
                    user: process.env.EMAIL_FROM,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });
            console.log(transporter);
            return transporter;
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT, 10),
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }
    // Send the actual email
    send(template, subject) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1) Render HTML based on a pug template
            const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
                firstName: this.firstName,
                url: this.url,
                subject,
            });
            // 2) Define email options
            const mailOptions = {
                from: this.from,
                to: this.to,
                subject,
                html,
                text: convert(html),
            };
            // 3) Create a transport and send email
            yield this.newTransport().sendMail(mailOptions);
        });
    }
    sendWelcome() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send("welcome", "Welcome to the Natours Family!");
        });
    }
    sendResetPassword() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send("passwordReset", "Your password reset token (valid for only 10 minutes)");
        });
    }
    sendVerificationEmail() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send("verifyUser", "Please verify your mail using the Link below");
        });
    }
}
