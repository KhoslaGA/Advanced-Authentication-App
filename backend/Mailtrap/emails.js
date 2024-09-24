import { mailtrapClient } from "./mailtrap.js";
import { sender } from "./mailtrap.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailTemplates.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];
  try {
    const res = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify Your Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });
    console.log("Email sent successfully", res);
  } catch (err) {
    console.error(`Error sending verificarion`, err);
    throw new Error(`Error sending verification email: ${err}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "1b01356b-ef6f-4512-a106-12ff5cfa7e91",
      template_variables: {
        company_info_name: "Blushtron",
        name: name,
      },
    });
    console.log("Email sent successfully", response);
  } catch (error) {
    console.error(`Error sending welcome email`, error);

    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendResetPassword = async (email, resetURL, name) => {
  const recipient = [{ email }];

  try {
    const res = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace(
        "[Reset Link]",
        resetURL
      ).replace("[Client Name]", name),
      category: "Password Reset",
    });
    console.log("Email sent successfully", res);
  } catch (error) {
    console.error(`Error sending reset email`, error);

    throw new Error(`Error sending reset email: ${error}`);
  }
};



export const sendResetSuccessEmail = async (email, name) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace(
        "[Client Name]",
        name
      ).replace("[Login Link]", `http://localhost:5173/`),
      category: "Password Reset",
    });

    console.log("Password reset email sent successfully", response);
  } catch (error) {
    console.error(`Error sending password reset success email`, error);

    throw new Error(`Error sending password reset success email: ${error}`);
  }
};
