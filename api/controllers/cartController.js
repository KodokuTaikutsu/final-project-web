const pool = require('../config/db'); // Import the database connection

// Create or retrieve the cart for a user
exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;

    // Check if the user has an existing cart
    let cartQuery = 'SELECT * FROM shopping_cart WHERE user_id = $1';
    let cartResult = await pool.query(cartQuery, [userId]);
    let cart;

    if (cartResult.rows.length === 0) {
      // If no cart exists, create one
      const createCartQuery = `
        INSERT INTO shopping_cart (user_id, total_amount)
        VALUES ($1, 0.00)
        RETURNING *;
      `;
      const createCartResult = await pool.query(createCartQuery, [userId]);
      cart = createCartResult.rows[0];
    } else {
      cart = cartResult.rows[0];
    }

    // Get the items in the cart
    const cartItemsQuery = `
      SELECT ci.cart_item_id, ci.quantity, ci.subtotal, p.product_id, p.product_name, p.price, p.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      WHERE ci.cart_id = $1;
    `;
    const cartItemsResult = await pool.query(cartItemsQuery, [cart.cart_id]);

    res.json({
      cart,
      items: cartItemsResult.rows,
    });
  } catch (error) {
    console.error('Error retrieving cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add an item to the cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    // Check if the user has a cart
    let cartQuery = 'SELECT * FROM shopping_cart WHERE user_id = $1';
    let cartResult = await pool.query(cartQuery, [userId]);
    let cart;

    if (cartResult.rows.length === 0) {
      // If no cart exists, create one
      const createCartQuery = `
        INSERT INTO shopping_cart (user_id, total_amount)
        VALUES ($1, 0.00)
        RETURNING *;
      `;
      const createCartResult = await pool.query(createCartQuery, [userId]);
      cart = createCartResult.rows[0];
    } else {
      cart = cartResult.rows[0];
    }

    // Get the product price
    const productQuery = 'SELECT * FROM products WHERE product_id = $1';
    const productResult = await pool.query(productQuery, [productId]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const product = productResult.rows[0];

    const subtotal = product.price * quantity;

    // Check if the item is already in the cart
    const existingItemQuery = `
      SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2
    `;
    const existingItemResult = await pool.query(existingItemQuery, [cart.cart_id, productId]);

    if (existingItemResult.rows.length > 0) {
      // If the item exists, update the quantity and subtotal
      const existingItem = existingItemResult.rows[0];
      const updatedQuantity = existingItem.quantity + quantity;
      const updatedSubtotal = updatedQuantity * product.price;

      const updateItemQuery = `
        UPDATE cart_items
        SET quantity = $1, subtotal = $2
        WHERE cart_item_id = $3
      `;
      await pool.query(updateItemQuery, [updatedQuantity, updatedSubtotal, existingItem.cart_item_id]);
    } else {
      // If the item does not exist, add it to the cart
      const addItemQuery = `
        INSERT INTO cart_items (cart_id, product_id, quantity, subtotal)
        VALUES ($1, $2, $3, $4)
      `;
      await pool.query(addItemQuery, [cart.cart_id, productId, quantity, subtotal]);
    }

    // Update the cart's total amount
    const totalQuery = `
      SELECT SUM(subtotal) AS total
      FROM cart_items
      WHERE cart_id = $1
    `;
    const totalResult = await pool.query(totalQuery, [cart.cart_id]);
    const totalAmount = totalResult.rows[0].total;

    const updateCartQuery = `
      UPDATE shopping_cart
      SET total_amount = $1
      WHERE cart_id = $2
    `;
    await pool.query(updateCartQuery, [totalAmount, cart.cart_id]);

    res.status(201).json({ message: 'Item added to cart successfully.' });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update the quantity of a cart item
exports.updateCartItem = async (req, res) => {
  try {
    const { cartItemId, quantity } = req.body;

    // Validate quantity
    if (!cartItemId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid cart item ID or quantity.' });
    }

    // Get the existing item details
    const itemQuery = `
      SELECT ci.*, p.price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      WHERE cart_item_id = $1
    `;
    const itemResult = await pool.query(itemQuery, [cartItemId]);
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found.' });
    }
    const item = itemResult.rows[0];

    const updatedSubtotal = item.price * quantity;

    // Update the cart item
    const updateItemQuery = `
      UPDATE cart_items
      SET quantity = $1, subtotal = $2
      WHERE cart_item_id = $3
    `;
    await pool.query(updateItemQuery, [quantity, updatedSubtotal, cartItemId]);

    // Update the cart's total amount
    const totalQuery = `
      SELECT SUM(subtotal) AS total
      FROM cart_items
      WHERE cart_id = $1
    `;
    const totalResult = await pool.query(totalQuery, [item.cart_id]);
    const totalAmount = totalResult.rows[0]?.total || 0;

    const updateCartQuery = `
      UPDATE shopping_cart
      SET total_amount = $1
      WHERE cart_id = $2
    `;
    await pool.query(updateCartQuery, [totalAmount, item.cart_id]);

    res.status(200).json({ message: 'Cart item updated successfully.' });
  } catch (error) {
    console.error('Error updating cart item:', error.message);
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
};


// Remove an item from the cart
exports.removeCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.body;

    if (!cartItemId) {
      console.error("Missing cartItemId in request:", req.body);
      return res.status(400).json({ error: "cartItemId is required." });
    }

    // Fetch the cart item to validate its existence
    const itemQuery = `
      SELECT * FROM cart_items WHERE cart_item_id = $1
    `;
    const itemResult = await pool.query(itemQuery, [cartItemId]);
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: "Cart item not found." });
    }
    const cartId = itemResult.rows[0].cart_id;

    // Delete the cart item
    const deleteItemQuery = `
      DELETE FROM cart_items WHERE cart_item_id = $1
    `;
    await pool.query(deleteItemQuery, [cartItemId]);

    // Update the total amount in the shopping cart
    const totalQuery = `
      SELECT SUM(subtotal) AS total
      FROM cart_items
      WHERE cart_id = $1
    `;
    const totalResult = await pool.query(totalQuery, [cartId]);
    const totalAmount = totalResult.rows[0]?.total || 0;

    const updateCartQuery = `
      UPDATE shopping_cart
      SET total_amount = $1
      WHERE cart_id = $2
    `;
    await pool.query(updateCartQuery, [totalAmount, cartId]);

    res.status(200).json({ message: "Cart item removed successfully." });
  } catch (error) {
    console.error("Error removing cart item:", error.message);
    console.error(error.stack);
    res.status(500).json({ error: "Internal server error." });
  }
};




// Merge local cart with the user's cart in the database
exports.mergeCart = async (req, res) => {
    try {
      const userId = req.userId;
      const localCart = req.body.cart; // Local cart sent from the frontend
  
      // Get or create the user's cart
      let cartQuery = 'SELECT * FROM shopping_cart WHERE user_id = $1';
      let cartResult = await pool.query(cartQuery, [userId]);
      let cart;
  
      if (cartResult.rows.length === 0) {
        // Create a new cart if none exists
        const createCartQuery = `
          INSERT INTO shopping_cart (user_id, total_amount)
          VALUES ($1, 0.00)
          RETURNING *;
        `;
        const createCartResult = await pool.query(createCartQuery, [userId]);
        cart = createCartResult.rows[0];
      } else {
        cart = cartResult.rows[0];
      }
  
      // Merge the local cart into the database cart
      for (const localItem of localCart) {
        const { productId, quantity } = localItem;
  
        // Get product details
        const productQuery = 'SELECT * FROM products WHERE product_id = $1';
        const productResult = await pool.query(productQuery, [productId]);
        if (productResult.rows.length === 0) {
          continue; // Skip items with invalid product IDs
        }
        const product = productResult.rows[0];
        const subtotal = product.price * quantity;
  
        // Check if the item is already in the cart
        const existingItemQuery = `
          SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2
        `;
        const existingItemResult = await pool.query(existingItemQuery, [cart.cart_id, productId]);
  
        if (existingItemResult.rows.length > 0) {
          // If the item exists, update the quantity and subtotal
          const existingItem = existingItemResult.rows[0];
          const updatedQuantity = existingItem.quantity + quantity;
          const updatedSubtotal = updatedQuantity * product.price;
  
          const updateItemQuery = `
            UPDATE cart_items
            SET quantity = $1, subtotal = $2
            WHERE cart_item_id = $3
          `;
          await pool.query(updateItemQuery, [updatedQuantity, updatedSubtotal, existingItem.cart_item_id]);
        } else {
          // If the item does not exist, add it to the cart
          const addItemQuery = `
            INSERT INTO cart_items (cart_id, product_id, quantity, subtotal)
            VALUES ($1, $2, $3, $4)
          `;
          await pool.query(addItemQuery, [cart.cart_id, productId, quantity, subtotal]);
        }
      }
  
      // Update the cart's total amount
      const totalQuery = `
        SELECT SUM(subtotal) AS total
        FROM cart_items
        WHERE cart_id = $1
      `;
      const totalResult = await pool.query(totalQuery, [cart.cart_id]);
      const totalAmount = totalResult.rows[0].total;
  
      const updateCartQuery = `
        UPDATE shopping_cart
        SET total_amount = $1
        WHERE cart_id = $2
      `;
      await pool.query(updateCartQuery, [totalAmount, cart.cart_id]);
  
      res.status(200).json({ message: 'Cart merged successfully.' });
    } catch (error) {
      console.error('Error merging cart:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  exports.clearCart = async (req, res) => {
    try {
        const userId = req.userId; // Retrieved from the middleware

        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }

        // Delete all cart items for the user
        await pool.query(`DELETE FROM shopping_cart WHERE user_id = $1`, [userId]);

        res.status(200).json({ message: "Cart cleared successfully." });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ error: "Failed to clear the cart." });
    }
};