import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import pug from "pug";
import { convert } from "html-to-text";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default class HealthCheckMail {
  public to: string;
  public firstName: string;
  public data: any;
  public from: string;

  constructor(user?: any, data?: any) {
    this.to = `<${process.env.EMAIL_FROM}>`;
    this.firstName = `Abdulhakeem`;

    this.from = `Abdulhakeem Gidado <${process.env.EMAIL_FROM}>`;
    console.log(data);
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 465,
        auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
      });
      //   console.log(transporter);
      return transporter;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT as string, 10),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template?: any, subject?: any) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      data: this.data,
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
    console.log("email reached");
    // 3) Create a transport and send email
    const about = await this.newTransport().sendMail(mailOptions);
    console.log(about, "about to send email");
  }
  async sendHealthCheck() {
    console.log("health check hit");
    const sent = await this.send("health", "Health Check Report");
    console.log(sent, "sent message");
  }
}
