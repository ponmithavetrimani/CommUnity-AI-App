import twilio from "twilio";

// .env needs:
//   TWILIO_ACCOUNT_SID=xxxx
//   TWILIO_AUTH_TOKEN=xxxx
//   TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async (to: string, body: string) => {
  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
};