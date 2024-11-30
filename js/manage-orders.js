document.addEventListener("DOMContentLoaded", async () => {
    const orderTableBody = document.getElementById("order-table-body");
    const authToken = localStorage.getItem("authToken");
  
    if (!authToken) {
      alert("You must log in as an admin to access this page.");
      window.location.href = "/html/login.html";
      return;
    }
  
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/admin/orders", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch orders.");
        }
  
        const orders = await response.json();
  
        orderTableBody.innerHTML = ""; // Clear the table body
  
        orders.forEach((order) => {
          const row = document.createElement("tr");
  
          // Format order items
          const items = order.order_items
            .map(
              (item) =>
                `${item.product_name} (x${item.quantity}) - $${parseFloat(
                  item.subtotal
                ).toFixed(2)}`
            )
            .join("<br>");
  
          row.innerHTML = `
            <td>${order.order_id}</td>
            <td>${order.user_name || "Unknown User"}</td>
            <td>$${parseFloat(order.total).toFixed(2)}</td>
            <td>${new Date(order.order_date).toLocaleString()}</td>
            <td>${items}</td>
          `;
  
          orderTableBody.appendChild(row);
        });
      } catch (error) {
        console.error("Error fetching orders:", error);
        alert("Failed to load orders. Please try again later.");
      }
    };
  
    // Fetch and render orders on page load
    await fetchOrders();
  });
  