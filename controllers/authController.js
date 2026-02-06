export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: "User not authenticated",
        statusCode: 401
      });
    }

    res.json({
      success: true,
      data: {
        user: req.user
      },
      message: "User profile fetched successfully"
    });
  } catch (error) {
    console.error("❌ Auth Controller Error:", error);
    res.status(500).json({ 
      success: false,
      error: "Error fetching profile",
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined,
      statusCode: 500
    });
  }
};
