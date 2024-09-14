import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized- no token provided" });
  try {
    const decoded = jwt.verify(token, "Khosla");
    req.userId = decoded.userId;
    next();
    if (!decoded)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized- invalid token" });
  } catch (err) {
    console.log("Error in verifyToken ", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
