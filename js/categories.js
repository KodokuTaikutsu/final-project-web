document.addEventListener("DOMContentLoaded", () => {
    const categoryTableBody = document.getElementById("category-table-body");
    const categoryForm = document.getElementById("categoryForm");
    const newCategoryButton = document.getElementById("new-category-button");
    const categoryNameInput = document.getElementById("categoryName");
    const editCategoryForm = document.getElementById("editCategoryForm");
    const editCategoryIdInput = document.getElementById("editCategoryId");
    const editCategoryNameInput = document.getElementById("editCategoryName");
  
    const authToken = localStorage.getItem("authToken");
  
    if (!authToken) {
      alert("You must log in as an admin to access this page.");
      window.location.href = "/html/login.html";
      return;
    }
  
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/admin/categories", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch categories.");
        }
  
        const categories = await response.json();
        categoryTableBody.innerHTML = "";
  
        categories.forEach((category) => {
          const row = document.createElement("tr");
  
          row.innerHTML = `
            <td>${category.category_id}</td>
            <td>${category.category_name}</td>
            <td>
              <button class="edit-category" data-id="${category.category_id}">Edit</button>
              <button class="delete-category" data-id="${category.category_id}">Delete</button>
            </td>
          `;
  
          categoryTableBody.appendChild(row);
        });
  
        attachCategoryListeners();
      } catch (error) {
        console.error("Error fetching categories:", error);
        alert("Failed to load categories.");
      }
    };
  
    const addCategory = async (event) => {
      event.preventDefault();
  
      const categoryName = categoryNameInput.value.trim();
  
      if (!categoryName) {
        alert("Category name is required.");
        return;
      }
  
      try {
        const response = await fetch("http://localhost:3000/api/admin/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ category_name: categoryName }),
        });
  
        if (response.ok) {
          alert("Category added successfully!");
          fetchCategories();
          categoryForm.style.display = "none"; // Hide the form
          categoryNameInput.value = ""; // Reset the form
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Failed to add category.");
        }
      } catch (error) {
        console.error("Error adding category:", error);
        alert("An unexpected error occurred.");
      }
    };
  
    const deleteCategory = async (categoryId) => {
      if (!confirm("Are you sure you want to delete this category?")) return;
  
      try {
        const response = await fetch(`http://localhost:3000/api/admin/categories/${categoryId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
  
        if (response.ok) {
          alert("Category deleted successfully!");
          fetchCategories();
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Failed to delete category.");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("An error occurred while deleting the category.");
      }
    };
  
    const editCategory = async (categoryId) => {
      const newCategoryName = prompt("Enter new category name:");
  
      if (!newCategoryName) {
        alert("Invalid input. Please try again.");
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:3000/api/admin/categories/${categoryId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ category_name: newCategoryName }),
        });
  
        if (response.ok) {
          alert("Category updated successfully!");
          fetchCategories();
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Failed to update category.");
        }
      } catch (error) {
        console.error("Error updating category:", error);
        alert("An error occurred while updating the category.");
      }
    };
  
    const attachCategoryListeners = () => {
      const editButtons = document.querySelectorAll(".edit-category");
      const deleteButtons = document.querySelectorAll(".delete-category");
  
      editButtons.forEach((button) =>
        button.addEventListener("click", () => {
          const categoryId = button.getAttribute("data-id");
          editCategory(categoryId);
        })
      );
  
      deleteButtons.forEach((button) =>
        button.addEventListener("click", () => {
          const categoryId = button.getAttribute("data-id");
          deleteCategory(categoryId);
        })
      );
    };
  
    newCategoryButton.addEventListener("click", () => {
      categoryForm.style.display = categoryForm.style.display === "none" ? "block" : "none";
    });
  
    categoryForm.addEventListener("submit", addCategory);
  
    // Fetch categories on page load
    fetchCategories();
  });
  