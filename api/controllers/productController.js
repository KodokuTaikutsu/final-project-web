const pool = require("../config/db");

// Get all products (Accessible to everyone)
exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Get a specific product by ID (Accessible to everyone)
exports.getProduct = async (req, res) => {
  const productId = req.params.id;
  try {
    const result = await pool.query("SELECT * FROM products WHERE product_id = $1", [productId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { product_name, description, price, category_id } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!product_name || !description || !price || !category_id) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Insert product without specifying `product_id`
    const query = `
      INSERT INTO products (product_name, description, price, image_url, category_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`;
    const values = [product_name, description, parseFloat(price), image_url, parseInt(category_id)];

    const result = await pool.query(query, values);

    res.status(201).json({ message: "Product added successfully", product: result.rows[0] });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add product." });
  }
};

  

// Update an existing product (Admin only)
exports.updateProduct = async (req, res) => {
  const productId = req.params.id;
  const { productName, description, price, categoryId } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const existingProduct = await pool.query("SELECT * FROM products WHERE product_id = $1", [productId]);
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const updatedProduct = await pool.query(
      `UPDATE products 
       SET product_name = $1, description = $2, price = $3, image_url = COALESCE($4, image_url), category_id = $5 
       WHERE product_id = $6 RETURNING *`,
      [
        productName || existingProduct.rows[0].product_name,
        description || existingProduct.rows[0].description,
        price || existingProduct.rows[0].price,
        imageUrl,
        categoryId || existingProduct.rows[0].category_id,
        productId,
      ]
    );

    res.status(200).json({ message: "Product updated successfully", product: updatedProduct.rows[0] });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

// Delete a product (Admin only)
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the product exists in any orders
    const orderDetails = await pool.query(
      "SELECT * FROM order_details WHERE product_id = $1",
      [id]
    );

    if (orderDetails.rows.length > 0) {
      return res.status(400).json({
        error: "Cannot delete product. It is part of an existing order.",
      });
    }

    // Proceed with deletion if the product is not in any orders
    const result = await pool.query(
      "DELETE FROM products WHERE product_id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product." });
  }
};
