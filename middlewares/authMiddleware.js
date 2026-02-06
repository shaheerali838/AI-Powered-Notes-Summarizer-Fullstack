import { admin } from "../config/firebaseAdmin.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No Token Provided" });
  }
  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin().auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};
export default authMiddleware;
