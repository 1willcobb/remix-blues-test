import formData from "form-data";
import Mailgun from "mailgun.js";
const mailgun = new Mailgun(formData);

const config = {
  domainName: "sorev.co",
  mailgun: {
    // subdomain to use when sending emails, if you don't have a subdomain, just remove it. Highly recommended to have one (i.e. mg.yourdomain.com or mail.yourdomain.com)
    subdomain: "mg",
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `Sorev <noreply@mg.sorev.co>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Will at Sorev <will@mg.sorev.co>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "will@mg.sorev.co",
    // When someone replies to supportEmail sent by the app, forward it to the email below (otherwise it's lost). If you set supportEmail to empty, this will be ignored.
    forwardRepliesTo: "will@sorev.co",
  },
};

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "dummy",
});

// if (!process.env.MAILGUN_API_KEY && process.env.NODE_ENV === "development") {
//   console.group("⚠️ MAILGUN_API_KEY missing from .env");
//   console.error("It's not mandatory but it's required to send emails.");
//   console.error("If you don't need it, remove the code from /libs/mailgun.js");
//   console.groupEnd();
// }

/**
 * Sends an email using the provided parameters.
 *
 * @async
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The plain text content of the email.
 * @param {string} html - The HTML content of the email.
 * @param {string} replyTo - The email address to set as the "Reply-To" address.
 * @returns {Promise} A Promise that resolves when the email is sent.
 */
export async function sendEmail({ to, subject, text, html, replyTo }) {
  const data = {
    from: config.mailgun.fromAdmin,
    to: [to],
    subject,
    text,
    html,
    ...(replyTo && { "h:Reply-To": replyTo }),
  };

  await mg.messages.create(
    (config.mailgun.subdomain ? `${config.mailgun.subdomain}.` : "") +
      config.domainName,
    data
  );
}

export async function sendEmailTemplate({ template, to, subject, replyTo }) {
  const data = {
    from: config.mailgun.fromAdmin,
    template,
    to: [to],
    subject,
    ...(replyTo && { "h:Reply-To": replyTo }),
  };

  await mg.messages.create(
    (config.mailgun.subdomain ? `${config.mailgun.subdomain}.` : "") +
      config.domainName,
    data
  );
}
