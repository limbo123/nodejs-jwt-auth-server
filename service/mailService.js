const nodemailer = require("nodemailer");

class MailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
          })
    }
    async sendAtivationLink(to, link) {
        console.log(to);
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: "Verify your account",
            text: "",
            html: `
            <div>
                <h1>For activation please click the link</h1>
                <a href="${link}">${link}</a>
            </div>
            
            `
        })
    }
}

module.exports = new MailService();