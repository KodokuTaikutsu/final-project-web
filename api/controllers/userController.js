const pool = require("../config/db");

exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

exports.updateProfilePicture = async (req, res) => {
    const userId = req.params.id; // Get user ID from the URL
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;
  
    try {
      if (!profilePicture) {
        return res.status(400).json({ error: "No profile picture uploaded" });
      }
  
      const result = await pool.query(
        "UPDATE users SET profile_picture = $1 WHERE user_id = $2 RETURNING *",
        [profilePicture, userId]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.status(200).json({
        message: "Profile picture updated successfully",
        user: result.rows[0]
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({ error: "Failed to update profile picture" });
    }
  };


  exports.getMe = async (req, res) => {
    try {
        const userId = req.userId; // Retrieved from the verifyToken middleware

        // Query the database using the correct column names
        const userResult = await pool.query(
            "SELECT user_id AS id, full_name AS fullname, email, profile_picture AS profilepicture FROM users WHERE user_id = $1",
            [userId]
        );

        // Handle case where user is not found
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // Return the user data
        res.status(200).json(userResult.rows[0]);
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ error: "Failed to fetch user details" });
    }
};

exports.getAddress = async (req, res) => {
  try {
      const userId = req.userId;
      console.log("Extracted userId from middleware:", userId); // Debug log for userId

      if (!userId) {
          console.error("User ID is missing in the request.");
          return res.status(400).json({ error: "User ID is required." });
      }

      const query = "SELECT * FROM directions WHERE user_id = $1";
      console.log("Running query with userId:", userId); // Debug log for query
      const result = await pool.query(query, [parseInt(userId, 10)]);

      if (result.rows.length === 0) {
          console.warn("No addresses found for userId:", userId);
          return res.status(404).json({ error: "No addresses found for this user." });
      }

      console.log("Addresses retrieved successfully:", result.rows); // Debug log for addresses
      res.status(200).json(result.rows);
  } catch (error) {
      console.error("Error fetching addresses:", error); // Improved error log
      res.status(500).json({ error: "Failed to fetch addresses." });
  }
};




// Add a new direction for the user
exports.addAddress = async (req, res) => {
try {
  const userId = req.userId; // Extracted from middleware
  const { address_line, city, state, postal_code, country } = req.body;

  if (!address_line || !city || !state || !postal_code || !country) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const result = await pool.query(
    `INSERT INTO directions (user_id, address_line, city, state, postal_code, country)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [userId, address_line, city, state, postal_code, country]
  );

  res.status(201).json({ message: "Direction added successfully", direction: result.rows[0] });
} catch (error) {
  console.error("Error adding direction:", error);
  res.status(500).json({ error: "Internal server error" });
}
};

