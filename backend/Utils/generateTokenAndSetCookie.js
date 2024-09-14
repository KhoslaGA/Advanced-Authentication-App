import jwt from "jsonwebtoken";

const secretKey = "Khosla";

export const generateTokenAndSetCookie = (res, userId) => {
  let token = jwt.sign({ userId }, secretKey, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    // !This makes the cookie inaccessible to JavaScript, which helps protect against cross-site scripting (XSS) attacks
    httpOnly: true,
    // !This sets the Secure attribute of the cookie, which ensures that the cookie is only transmitted over a secure protocol (HTTPS). The value is set based on the Node_Env environment variable being equal to "production".

    secure: (process.env.Node_Env = "production"),

    // ! This sets the SameSite attribute of the cookie, which helps prevent cross-site request forgery (CSRF) attacks. The value "strict" means that the cookie will only be sent with requests to the same site.
    sameSite: "strict",

    // !maxAge: 7 * 24 * 60 * 60 * 1000: This sets the maximum age of the cookie in milliseconds. In this case, it's set to 7 days.
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};
