const pool = require('../config/db');


// Get all directions for the user
exports.getAddress = async (req, res) => {
    try {
        const userId = parseInt(req.userId, 10); // Extracted from middleware
        console.log("Extracted userId from middleware:", userId);
        console.log("User ID Value:", userId, "Type:", typeof userId);


        if (!userId) {
            console.error("User ID is missing.");
            return res.status(400).json({ error: "User ID is required." });
        }

        const query = `SELECT * FROM directions WHERE user_id = $1::int`;
        console.log("Running query:", query, "with userId:", userId);

        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            console.warn("No addresses found for userId:", userId);
            return res.status(404).json({ error: "No addresses found for this user." });
        }

        console.log("Addresses retrieved:", result.rows);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error in getAddress function:", error);
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

