export const fetchProducts = async () => {
    const response = await fetch("http://localhost:3000/api/products");
    return response.json();
  };
  
  export const fetchCategories = async () => {
    const response = await fetch("http://localhost:3000/api/categories");
    return response.json();
  };
  