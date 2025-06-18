import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // 'Bearer token_value'

  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized. Please login again." });
  }

  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = token_decode.id;
    next();
  } catch (error) {
    console.error("Invalid Token", error);
    res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};

export default authMiddleware;
