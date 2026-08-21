import { admin } from "../config/firebaseAdmin.js";
import { logError } from "../utils/logger.js";
import { ERROR_MESSAGES, HTTP_STATUS } from "../config/constants.js";

/**
 * Authentication middleware
 * Verifies Firebase ID token and attaches user to request
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
      success: false,
      error: ERROR_MESSAGES.NO_TOKEN,
      statusCode: HTTP_STATUS.UNAUTHORIZED
    });
  }
  
  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin().auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (err) {
    logError("Auth middleware error:", err);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
      success: false,
      error: ERROR_MESSAGES.INVALID_TOKEN,
      statusCode: HTTP_STATUS.UNAUTHORIZED
    });
  }
};

export default authMiddleware;
