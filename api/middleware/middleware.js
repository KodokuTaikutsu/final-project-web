const jwt = require("jsonwebtoken");
const pool = require("../config/db"); // Assuming you have access to your database

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        console.log("Decoded token payload:", decoded); // Log the decoded payload
        req.userId = decoded.userId; // Attach the userId to the request object

        // Fetch role_id from the database if not included in the token
        const result = await pool.query("SELECT role_id FROM users WHERE user_id = $1", [req.userId]);
        if (result.rows.length === 0) {
            return res.status(403).json({ error: "User not found or invalid role." });
        }
        req.roleId = result.rows[0].role_id; // Attach the role_id to the request object

        next(); // Pass control to the next middleware or route
    } catch (error) {
        console.error("JWT verification error:", error);
        return res.status(403).json({ error: "Invalid or expired token." });
    }
};

// Middleware to restrict access to admins
const verifyAdmin = (req, res, next) => {
    if (req.roleId !== 1) { // Assuming role_id = 1 represents admins
        return res.status(403).json({ error: "Access denied. Admins only." });
    }
    next();
};

// Example middleware: Log all requests (optional)
const requestLogger = (req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
};

// Export all middleware functions
module.exports = {
    verifyToken,
    verifyAdmin,
    requestLogger, // Add other middleware here as needed
};
