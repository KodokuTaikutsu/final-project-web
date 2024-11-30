export const filterProducts = (products, category, searchQuery) => {
    return products.filter((product) => {
      const matchesCategory = category ? product.category_id === parseInt(category) : true;
      const matchesSearchQuery = product.product_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearchQuery;
    });
  };
  