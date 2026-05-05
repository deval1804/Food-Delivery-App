import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "devaldarji93795@gmail.com",
    pass: "xqui firv ywzd yfnp"
  }
});

export const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: "devaldarji93795@gmail.com",
    to,
    subject,
    text
  });
};