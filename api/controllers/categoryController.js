const pool = require("../config/db");

// Fetch all categories
exports.getCategories = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM categories ORDER BY category_id ASC");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};

// Add a new category
exports.addCategory = async (req, res) => {
    const { category_name } = req.body;

    if (!category_name) {
        return res.status(400).json({ error: "Category name is required." });
    }

    try {
        const result = await pool.query(
            "INSERT INTO categories (category_name) VALUES ($1) RETURNING *",
            [category_name]
        );
        res.status(201).json({ message: "Category added successfully", category: result.rows[0] });
    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).json({ error: "Failed to add category" });
    }
};

// Update an existing category
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { category_name } = req.body;

    if (!category_name) {
        return res.status(400).json({ error: "Category name is required." });
    }

    try {
        const result = await pool.query(
            "UPDATE categories SET category_name = $1 WHERE category_id = $2 RETURNING *",
            [category_name, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Category not found." });
        }

        res.status(200).json({ message: "Category updated successfully", category: result.rows[0] });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ error: "Failed to update category" });
    }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM categories WHERE category_id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Category not found." });
        }

        res.status(200).json({ message: "Category deleted successfully", category: result.rows[0] });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ error: "Failed to delete category" });
    }
};
