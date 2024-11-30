document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.getElementById("cart-items");
  const totalPriceElement = document.getElementById("total-price");
  const checkoutButton = document.getElementById("checkout-button");

  const calculateTotal = (cart) => {
    return cart.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
  };

  const fetchCartItems = () => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      fetchCartFromServer(authToken);
    } else {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      renderCart({ items: cart, cart: { totalAmount: calculateTotal(cart) } });
    }
  };

  const fetchCartFromServer = async (authToken) => {
    try {
      const response = await fetch("http://localhost:3000/api/cart", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const cartData = await response.json();
      if (cartData && Array.isArray(cartData.items)) {
        renderCart(cartData);
      } else {
        console.error("Cart data not in expected format:", cartData);
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
      cartItemsContainer.innerHTML = "<p>Failed to load cart items. Please try again later.</p>";
    }
  };

  const renderCart = (cartData) => {
    const { items, cart } = cartData;

    if (!Array.isArray(items) || items.length === 0) {
      cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
      totalPriceElement.innerText = "Total: $0.00";
      return;
    }

    cartItemsContainer.innerHTML = "";
    let totalPrice = 0;

    items.forEach(item => {
      const productName = item.productName || item.product_name || "Unnamed Product";
      const price = parseFloat(item.price) || 0;
      const quantity = item.quantity || 0;
      const subtotal = parseFloat(item.subtotal) || 0;

      const cartItemElement = document.createElement("div");
      cartItemElement.classList.add("cart-item");

      cartItemElement.innerHTML = `
        <div class="cart-item-details">
          <h2>${productName}</h2>
          <p>Price: $${price.toFixed(2)}</p>
          <p>Quantity: <span class="item-quantity">${quantity}</span></p>
          <p>Subtotal: $<span class="item-subtotal">${subtotal.toFixed(2)}</span></p>
        </div>
        <div class="cart-item-actions">
          <button class="update-quantity" data-cart-item-id="${item.cart_item_id || item.productId}">Update Quantity</button>
          <button class="remove-item" data-cart-item-id="${item.cart_item_id || item.productId}">Remove</button>
        </div>
      `;

      cartItemsContainer.appendChild(cartItemElement);
      totalPrice += subtotal;
    });

    totalPriceElement.innerText = `Total: $${totalPrice.toFixed(2)}`;
    attachEventListeners();
  };

  const updateCartQuantity = async (cartItemId) => {
    const newQuantity = parseInt(prompt("Enter new quantity:"));
    if (isNaN(newQuantity) || newQuantity < 1) {
      alert("Please enter a valid quantity.");
      return;
    }

    const authToken = localStorage.getItem("authToken");

    if (authToken) {
      try {
        const response = await fetch("http://localhost:3000/api/cart/update", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ cartItemId: parseInt(cartItemId), quantity: newQuantity }),
        });

        if (response.ok) {
          const updatedCart = await response.json();
          renderCart(updatedCart);
          alert("Quantity updated successfully.");
          location.reload();
        } else {
          const error = await response.json();
          console.error("Failed to update quantity:", error);
          alert(error.error || "Failed to update quantity.");
        }
      } catch (error) {
        console.error("Error updating quantity:", error);
        alert("An error occurred while updating the quantity.");
      }
    } else {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const item = cart.find((item) => item.productId === parseInt(cartItemId)); // Use productId for localStorage

      if (item) {
        item.quantity = newQuantity;
        item.subtotal = item.quantity * item.price;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart({ items: cart, cart: { totalAmount: calculateTotal(cart) } });
        alert("Quantity updated successfully.");
        location.reload();
      } else {
        console.error("Item not found in localStorage cart:", cartItemId);
        alert("Item not found in cart.");
      }
    }
  };

  const removeItemFromCart = async (cartItemId) => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      try {
        const response = await fetch("http://localhost:3000/api/cart/remove", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ cartItemId: parseInt(cartItemId) }),
        });

        if (response.ok) {
          alert("Item removed successfully!");
          location.reload();
        } else {
          console.error("Failed to remove item:", await response.text());
          alert("Failed to remove item.");
        }
      } catch (error) {
        console.error("Error removing item:", error);
        alert("An error occurred while removing the item.");
      }
    } else {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const updatedCart = cart.filter((item) => item.productId !== parseInt(cartItemId));

      if (cart.length !== updatedCart.length) {
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        location.reload();
      } else {
        alert("Item not found in cart.");
      }
    }
  };

  const attachEventListeners = () => {
    const updateButtons = document.querySelectorAll(".update-quantity");
    const removeButtons = document.querySelectorAll(".remove-item");

    updateButtons.forEach(button => {
      button.addEventListener("click", (e) => {
        const cartItemId = e.target.getAttribute("data-cart-item-id");
        updateCartQuantity(cartItemId);
      });
    });

    removeButtons.forEach(button => {
      button.addEventListener("click", (e) => {
        const cartItemId = e.target.getAttribute("data-cart-item-id");
        removeItemFromCart(cartItemId);
      });
    });
  };

  // Add event listener for the checkout button


  fetchCartItems();
});
