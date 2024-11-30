document.addEventListener("DOMContentLoaded", () => {
    const checkoutButton = document.getElementById("checkout-button");

    const placeOrder = async () => {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            alert("You must log in to place an order.");
            window.location.href = "/html/login.html";
            return;
        }

        try {
            // Fetch cart items
            const cartResponse = await fetch("http://localhost:3000/api/cart", {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (!cartResponse.ok) {
                console.error("Error fetching cart items:", await cartResponse.text());
                alert("Failed to retrieve cart items.");
                return;
            }

            const cartData = await cartResponse.json();

            if (cartData && Array.isArray(cartData.items)) {
                // Calculate totalAmount from the cart data
                const totalAmount = cartData.items.reduce(
                    (sum, item) => sum + (parseFloat(item.subtotal) || 0),
                    0
                );

                if (isNaN(totalAmount) || totalAmount <= 0) {
                    alert("Invalid total amount.");
                    return;
                }

                // Send cart items to the order endpoint
                const orderResponse = await fetch("http://localhost:3000/api/orders", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({
                        items: cartData.items.map((item) => ({
                            product_id: item.productId || item.product_id,
                            quantity: item.quantity,
                            subtotal: item.subtotal,
                        })),
                        total: totalAmount.toFixed(2), // Ensure total is formatted as a string
                    }),
                });

                const orderData = await orderResponse.json();

                if (orderResponse.ok) {
                    alert("Order placed successfully!");

                    // Clear cart after successful order placement
                    const clearCartResponse = await fetch(
                        "http://localhost:3000/api/cart/clear",
                        {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${authToken}` },
                        }
                    );

                    if (!clearCartResponse.ok) {
                        console.error("Failed to clear cart after order placement.");
                    }

                    // Redirect to the "My Orders" page
                    window.location.href = "/html/orders.html";
                } else {
                    console.error("Error placing order:", orderData.error);
                    alert(orderData.error || "Failed to place order.");
                }
            } else {
                alert("Your cart is empty or failed to load.");
            }
        } catch (error) {
            console.error("Error placing order:", error);
            alert("An error occurred while placing your order. Please try again.");
        }
    };

    checkoutButton.addEventListener("click", placeOrder);
});
