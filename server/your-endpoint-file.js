app.get("/your-endpoint", async (req, res) => {
  try {
    // your existing code
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});
