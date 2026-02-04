export const getProfile = async (req, res) => {
  try {
    res.json({
      message: "User profile fetched successfully",
      user: req.user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching profile", error: error.message });
  }
};
