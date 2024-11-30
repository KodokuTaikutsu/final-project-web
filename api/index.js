const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes/routes");
const { requestLogger } = require("./middleware/middleware"); // Import middleware

require("dotenv").config();


const app = express();
const port = process.env.PORT || 3000;

app.use("/uploads", express.static("uploads"));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(requestLogger); // Use global request logger middleware

// Routes
app.use("/api", routes);

// Error Handling
app.use((req, res, next) => {
    res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error("Internal server error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
