import { MailtrapClient } from "mailtrap";

const TOKEN = "2f1fb48c637a2ce02f27e41abe7be4a7";

export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "mailtrap@demomailtrap.com",
  name: "Mailtrap Test",
};
