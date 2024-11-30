export const renderProducts = (productList, products) => {
    productList.innerHTML = ""; // Clear product list
    if (products.length === 0) {
      productList.innerHTML = "<p>No products found.</p>";
      return;
    }
  
    products.forEach((product) => {
      const productItem = document.createElement("div");
      productItem.classList.add("product-item");
      productItem.innerHTML = `
        <img src="http://localhost:3000${product.image_url}" alt="${product.product_name}" />
        <div class="product-details">
          <h2>${product.product_name}</h2>
          <p>${product.description}</p>
          <p class="price">$${product.price}</p>
          <a href="product.html?id=${product.product_id}" class="product-button">View Product</a>
        </div>
      `;
      productList.appendChild(productItem);
    });
  };
  