const pool = require("../config/db");


exports.createOrder = async (req, res) => {
    try {
        const userId = req.userId; // Retrieved from middleware
        if (!userId) {
            return res.status(400).json({ error: "User ID is required to place an order." });
        }

        const { items, total } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Order must have at least one item." });
        }

        if (!total || isNaN(total)) {
            return res.status(400).json({ error: "Invalid total amount." });
        }

        // Insert into the `orders` table
        const orderResult = await pool.query(
            `INSERT INTO orders (user_id, total, order_date) VALUES ($1, $2, NOW()) RETURNING order_id`,
            [userId, total]
        );

        const orderId = orderResult.rows[0].order_id;

        // Insert into the `order_details` table
        const orderDetailsPromises = items.map((item) =>
            pool.query(
                `INSERT INTO order_details (order_id, product_id, quantity, subtotal)
                 VALUES ($1, $2, $3, $4)`,
                [orderId, item.product_id, item.quantity, item.subtotal]
            )
        );

        await Promise.all(orderDetailsPromises);

        res.status(201).json({ message: "Order created successfully", orderId });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Failed to create order." });
    }
};

// Retrieve orders for a specific user
exports.getOrders = async (req, res) => {
    try {
        const userId = req.userId; // Retrieved from the `verifyToken` middleware
        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }

        // Fetch orders for the user
        const ordersQuery = `
            SELECT o.order_id, o.order_date, o.total, 
            (
                SELECT json_agg(
                    json_build_object(
                        'product_name', p.product_name,
                        'quantity', od.quantity,
                        'subtotal', od.subtotal
                    )
                )
                FROM order_details od
                JOIN products p ON od.product_id = p.product_id
                WHERE od.order_id = o.order_id
            ) AS items
            FROM orders o
            WHERE o.user_id = $1
            ORDER BY o.order_date DESC;
        `;

        const result = await pool.query(ordersQuery, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No orders found for this user." });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Failed to fetch orders." });
    }
};

exports.getAllOrdersWithDetails = async (req, res) => {
    try {
      const query = `
        SELECT 
          o.order_id, 
          o.total, 
          o.order_date, 
          u.full_name AS user_name,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'product_name', p.product_name,
              'quantity', od.quantity,
              'subtotal', od.subtotal
            )
          ) AS order_items
        FROM orders o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN products p ON od.product_id = p.product_id
        JOIN users u ON o.user_id = u.user_id
        GROUP BY o.order_id, u.full_name
        ORDER BY o.order_date DESC;
      `;
  
      const result = await pool.query(query);
  
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching orders with details:", error);
      res.status(500).json({ error: "Failed to fetch orders." });
    }
  };