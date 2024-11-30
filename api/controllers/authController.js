const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    const { fullName, email, password, roleId } = req.body;
  
    try {
      console.log("Checking if user exists...");
      const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  
      if (userCheck.rows.length > 0) {
        console.log("User already exists.");
        return res.status(400).json({ error: "User already exists" });
      }
  
      console.log("Hashing password...");
      const hashedPassword = await bcrypt.hash(password, 10);
  
      console.log("Inserting new user into database...");
      const newUser = await pool.query(
        "INSERT INTO users (full_name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [fullName, email, hashedPassword, roleId]
      );
  
      console.log("User registered successfully:", newUser.rows[0]);
      res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  };
  

  exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Query the database for the user by email
      const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (userResult.rows.length === 0) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
  
      const user = userResult.rows[0];
  
      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
  
      // Debug: Ensure JWT_SECRET is loaded
      console.log("JWT_SECRET:", process.env.JWT_SECRET);
  
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: "Server configuration error: JWT_SECRET is missing" });
      }
  
      // Generate a JWT token
      const token = jwt.sign(
        { userId: user.user_id },
        process.env.JWT_SECRET, // Use your secret from .env
        { expiresIn: "12h" }
      );
  
      // Respond with the token and user details
      res.status(200).json({
        message: "Login successful",
        token, // Include the JWT token in the response
        user: {
          id: user.user_id,
          fullName: user.full_name,
          email: user.email,
          profilePicture: user.profile_picture,
          roleId: user.role_id,
        },
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  };
  