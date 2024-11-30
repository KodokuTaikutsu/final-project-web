
document.addEventListener("DOMContentLoaded", async () => {
    const productContainer = document.querySelector(".product-container");
    const mainImage = document.getElementById("main-product-image");
    const productName = document.getElementById("product-name");
    const productPrice = document.getElementById("product-price");
    const productDescription = document.getElementById("product-description");
    const quantitySelector = document.getElementById("quantity");
    const addToCartButton = document.getElementById("addToCartButton");
    

    // Function to get the product ID from the URL
    const getProductIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("id"); // Assuming URL looks like product.html?id=1
    };

    // Function to fetch product details from the API
    const fetchProductDetails = async (productId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/products/${productId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch product details");
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching product details:", error);
            productContainer.innerHTML = "<p>Failed to load product details. Please try again later.</p>";
            return null;
        }
    };

    // Function to render product details
    const renderProductDetails = (product) => {
        mainImage.src = `http://localhost:3000${product.image_url}`;
        mainImage.alt = product.product_name;
        productName.textContent = product.product_name;
        productPrice.textContent = `Price: $${parseFloat(product.price).toFixed(2)}`;
        productDescription.textContent = `Description: ${product.description}`;
    };

    // Main logic
    const productId = getProductIdFromUrl();
    if (productId) {
        const product = await fetchProductDetails(productId);
        if (product) {
            renderProductDetails(product);

            // Ensure the Add to Cart button has only one event listener
            addToCartButton.addEventListener("click", () => {
                const selectedQuantity = parseInt(quantitySelector.value, 10);
                if (selectedQuantity > 0) {
                    // Call the `addToCart` function from addToCart.js
                    addToCart({
                        productId: product.product_id,
                        productName: product.product_name,
                        price: parseFloat(product.price),
                        quantity: selectedQuantity,
                    });
                } else {
                    alert("Please select a valid quantity.");
                }
            });
        }
    } else {
        productContainer.innerHTML = "<p>Invalid product ID. Please go back and select a product.</p>";
    }
});

