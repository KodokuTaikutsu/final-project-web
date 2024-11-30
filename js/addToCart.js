document.addEventListener("DOMContentLoaded", () => {
  const addToCartButton = document.getElementById("addToCartButton");
  const quantitySelector = document.getElementById("quantity");

  // // Ensure event listener is only attached once
  // if (addToCartButton) {
  //   if (!addToCartButton.dataset.listenerAttached) {
  //     addToCartButton.dataset.listenerAttached = true; // Mark listener as attached

  //     // Add click event listener
  //     addToCartButton.addEventListener("click", async () => {
  //       const productId = new URLSearchParams(window.location.search).get("id");
  //       const quantity = parseInt(quantitySelector.value);

  //       if (!productId || quantity <= 0) {
  //         alert("Please select a valid product and quantity.");
  //         return;
  //       }

  //       const productDetails = await fetchProductDetails(productId);
  //       if (productDetails) {
  //         productDetails.quantity = quantity; // Add selected quantity to the product object
  //         addToCart(productDetails);
  //       }
  //     });
  //   }
  // } else {
  //   console.error("Add to Cart button not found.");
  // }

  // Function to add an item to the cart
  window.addToCart = (product) => {
    if (!product || !product.productId || !product.productName || !product.price) {
        console.error("Invalid product object:", product);
        alert("Failed to add item to cart. Product details are missing.");
        return;
    }

    const authToken = localStorage.getItem("authToken");

    if (authToken) {
        // For logged-in users, send the item to the API
        fetch("http://localhost:3000/api/cart/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                productId: product.productId,
                quantity: product.quantity || 1,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to add item to the cart via API.");
                }
                return response.json();
            })
            .then((data) => {
                alert(`${product.productName} added to the cart!`);
                location.reload();
            })
            .catch((error) => {
                console.error("Error adding to cart via API:", error);
                alert("An error occurred while adding the item to the cart.");
            });
    } else {
        // For non-logged-in users, save in localStorage
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItem = cart.find((item) => item.productId === product.productId);

        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
            existingItem.subtotal = existingItem.quantity * existingItem.price;
        } else {
            cart.push({
                productId: product.productId,
                productName: product.productName,
                price: product.price,
                quantity: product.quantity || 1,
                subtotal: (product.quantity || 1) * product.price,
            });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        alert(`${product.productName} added to the cart!`);
        location.reload();
    }
};

  // Export the function for reuse
 
  

  // Fetch product details (if needed for localStorage functionality)
  const fetchProductDetails = async (productId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/products/${productId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch product details");
      }
      const product = await response.json();
      return {
        productId: product.product_id, // Ensure correct property naming
        productName: product.product_name,
        price: parseFloat(product.price),
      };
    } catch (err) {
      console.error("Error fetching product details:", err);
      alert("Failed to fetch product details.");
      return null;
    }
  };
});
