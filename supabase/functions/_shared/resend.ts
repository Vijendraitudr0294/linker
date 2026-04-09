import { Resend } from "npm:resend";

export type SendEmailInput = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export const getResendClient = () => {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    throw new Error("RESEND_API_KEY not configured");
  }
  return new Resend(apiKey);
};

export const sendEmail = async (input: SendEmailInput) => {
  const resend = getResendClient();
  const { data, error } = await resend.emails.send(input);
  return { data, error };
};
