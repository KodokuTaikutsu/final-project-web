document.addEventListener("DOMContentLoaded", async () => {
    const productTableBody = document.getElementById("product-table-body");
    const productForm = document.getElementById("productForm");
    const editForm = document.getElementById("editForm");
    const categoryIdSelect = document.getElementById("categoryId");
    const editCategoryIdSelect = document.getElementById("editCategoryId");
    const newProductButton = document.getElementById("new-product-button");
  
    const authToken = localStorage.getItem("authToken");
  
    if (!authToken) {
      alert("You must log in as an admin to access this page.");
      window.location.href = "/html/login.html";
      return;
    }
  
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/categories");
        const categories = await response.json();
  
        // Populate categories for both add and edit forms
        categories.forEach((category) => {
          const addOption = document.createElement("option");
          const editOption = document.createElement("option");
  
          addOption.value = category.category_id;
          addOption.textContent = category.category_name;
  
          editOption.value = category.category_id;
          editOption.textContent = category.category_name;
  
          categoryIdSelect.appendChild(addOption);
          editCategoryIdSelect.appendChild(editOption);
        });
      } catch (error) {
        console.error("Error fetching categories:", error);
        alert("Failed to load categories.");
      }
    };
  
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/products", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch products.");
        }
  
        const products = await response.json();
  
        productTableBody.innerHTML = "";
        products.forEach((product) => {
          const row = document.createElement("tr");
  
          row.innerHTML = `
            <td>${product.product_id}</td>
            <td>${product.product_name}</td>
            <td>${product.description}</td>
            <td>$${parseFloat(product.price).toFixed(2)}</td>
            <td>${product.category_id}</td>
            <td>
              <button class="edit-product" data-id="${product.product_id}" data-product='${JSON.stringify(
            product
          )}'>Edit</button>
              <button class="delete-product" data-id="${product.product_id}">Delete</button>
            </td>
          `;
  
          productTableBody.appendChild(row);
        });
  
        attachActionListeners();
      } catch (error) {
        console.error("Error fetching products:", error);
        alert("Failed to load products. Please try again later.");
      }
    };
  
    const addProduct = async (event) => {
      event.preventDefault();
      const productName = document.getElementById("productName").value.trim();
      const description = document.getElementById("description").value.trim();
      const price = document.getElementById("price").value.trim();
      const categoryId = document.getElementById("categoryId").value.trim();
      const image = document.getElementById("image").files[0];
  
      if (!productName || !description || !price || !categoryId) {
        alert("All fields are required.");
        return;
      }
  
      const formData = new FormData();
      formData.append("product_name", productName);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category_id", categoryId);
      if (image) {
        formData.append("image", image);
      }
  
      try {
        const response = await fetch("http://localhost:3000/api/admin/products", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        });
  
        if (response.ok) {
          alert("Product added successfully!");
          fetchProducts(); // Refresh product list
          productForm.style.display = "none"; // Hide the form after adding
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Failed to add product.");
        }
      } catch (error) {
        console.error("Error adding product:", error);
        alert("An unexpected error occurred.");
      }
    };
  
    const editProduct = async (event) => {
      event.preventDefault();
  
      const productId = document.getElementById("editProductId").value;
      const productName = document.getElementById("editProductName").value.trim();
      const description = document.getElementById("editDescription").value.trim();
      const price = document.getElementById("editPrice").value.trim();
      const categoryId = document.getElementById("editCategoryId").value.trim();
  
      if (!productName || !description || isNaN(parseFloat(price))) {
        alert("Invalid input. Please fill out all fields correctly.");
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:3000/api/admin/products/${productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ productName, description, price, categoryId }),
        });
  
        if (response.ok) {
          alert("Product updated successfully!");
          fetchProducts(); // Refresh product list
          editForm.style.display = "none"; // Hide the form after editing
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Failed to update product.");
        }
      } catch (error) {
        console.error("Error updating product:", error);
        alert("An error occurred while updating the product.");
      }
    };
  
    const deleteProduct = async (productId) => {
      if (!confirm("Are you sure you want to delete this product?")) return;
  
      try {
        const response = await fetch(`http://localhost:3000/api/admin/products/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
  
        if (response.ok) {
          alert("Product deleted successfully!");
          fetchProducts();
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Failed to delete product.");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("An error occurred while deleting the product.");
      }
    };
  
    const attachActionListeners = () => {
      const editButtons = document.querySelectorAll(".edit-product");
      const deleteButtons = document.querySelectorAll(".delete-product");
  
      editButtons.forEach((button) =>
        button.addEventListener("click", () => {
          const product = JSON.parse(button.getAttribute("data-product"));
  
          // Populate edit form fields
          document.getElementById("editProductId").value = product.product_id;
          document.getElementById("editProductName").value = product.product_name;
          document.getElementById("editDescription").value = product.description;
          document.getElementById("editPrice").value = product.price;
          document.getElementById("editCategoryId").value = product.category_id;
  
          // Show edit form
          editForm.style.display = "block";
        })
      );
  
      deleteButtons.forEach((button) =>
        button.addEventListener("click", () => {
          const productId = button.getAttribute("data-id");
          deleteProduct(productId);
        })
      );
    };
  
    // Show/hide the product form
    newProductButton.addEventListener("click", () => {
      productForm.style.display = productForm.style.display === "none" ? "block" : "none";
    });
  
    // Initialize the page
    await fetchCategories();
    await fetchProducts();
  
    productForm.addEventListener("submit", addProduct);
    editForm.addEventListener("submit", editProduct);
  });
  