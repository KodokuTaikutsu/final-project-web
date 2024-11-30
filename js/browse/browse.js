import { fetchProducts, fetchCategories } from "./api.js"; // Use ./ for files in the same directory
import { renderProducts } from "./render.js";
import { filterProducts } from "./filter.js";


document.addEventListener("DOMContentLoaded", async () => {
  const productList = document.querySelector(".product-list");
  const categoryFilter = document.getElementById("category-filter");
  const searchBar = document.getElementById("search-bar");
  const searchButton = document.getElementById("search-button");

  let allProducts = [];

  const handleFilterAndSearch = () => {
    const category = categoryFilter.value;
    const searchQuery = searchBar.value;
    const filteredProducts = filterProducts(allProducts, category, searchQuery);
    renderProducts(productList, filteredProducts);
  };

  try {
    allProducts = await fetchProducts();
    renderProducts(productList, allProducts);

    const categories = await fetchCategories();
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.category_id;
      option.textContent = category.category_name;
      categoryFilter.appendChild(option);
    });
  } catch (error) {
    console.error("Error initializing page:", error);
  }

  categoryFilter.addEventListener("change", handleFilterAndSearch);
  searchButton.addEventListener("click", handleFilterAndSearch);
  searchBar.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      handleFilterAndSearch();
    }
  });
});
