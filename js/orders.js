document.addEventListener("DOMContentLoaded", async () => {
    const ordersList = document.getElementById("orders-list");
  
    // Fetch orders from the API
    const fetchOrders = async () => {
      const authToken = localStorage.getItem("authToken");
  
      if (!authToken) {
        alert("You must log in to view your orders.");
        window.location.href = "/html/login.html";
        return;
      }
  
      try {
        const response = await fetch("http://localhost:3000/api/orders", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
  
        const orders = await response.json();
  
        if (orders.length === 0) {
          ordersList.innerHTML = "<p>You have no orders yet.</p>";
          return;
        }
  
        renderOrders(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        ordersList.innerHTML = "<p>Failed to load orders. Please try again later.</p>";
      }
    };
  
    // Render orders on the page
    const renderOrders = (orders) => {
      ordersList.innerHTML = ""; // Clear the container
  
      orders.forEach((order) => {
        const orderElement = document.createElement("div");
        orderElement.classList.add("order");
  
        const orderItemsHtml = order.items
          .map(
            (item) => `
              <div class="order-item">
                <span>${item.product_name || "Unnamed Product"}</span>
                <span>Qty: ${item.quantity}</span>
                <span>Subtotal: $${item.subtotal.toFixed(2)}</span>
              </div>
            `
          )
          .join("");
  
        orderElement.innerHTML = `
          <div class="order-header">
            <p>Order ID: ${order.order_id}</p>
            <p>Date: ${new Date(order.order_date).toLocaleDateString()}</p>
            <p>Total: $${parseFloat(order.total).toFixed(2)}</p>
          </div>
          <div class="order-items">
            ${orderItemsHtml}
          </div>
        `;
  
        ordersList.appendChild(orderElement);
      });
    };
  
    // Fetch orders on page load
    fetchOrders();
  });
  