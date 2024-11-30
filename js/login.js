document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent form from refreshing the page

  // Get form data
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    // Send POST request to the login endpoint
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Save the token and user profile info
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("profilePicture", data.user.profilePicture); // Save profile picture URL
      localStorage.setItem("userName", data.user.fullName); // Save user name (optional)
      localStorage.setItem("roleId", data.user.roleId); // Save user role ID

      // Merge local cart with the server cart
      const localCart = JSON.parse(localStorage.getItem("cart")) || [];
      if (localCart.length > 0) {
        await mergeCartWithServer(localCart, data.token);
        localStorage.removeItem("cart"); // Clear local cart after merging
      }

      // Redirect based on user role
      if (data.user.roleId === 1) {
        // Admin role
        alert("Admin login successful!");
        window.location.href = "../html/manage-products.html"; // Redirect to admin page
      } else {
        // Customer role
        alert("Login successful!");
        window.location.href = "../index.html"; // Redirect to homepage
      }
    } else {
      // Show error message if login fails
      alert(data.error || "Failed to log in. Please check your credentials.");
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("An unexpected error occurred. Please try again.");
  }
});

// Function to merge the local cart with the server cart
const mergeCartWithServer = async (localCart, token) => {
  try {
    const response = await fetch("http://localhost:3000/api/cart/merge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cart: localCart }),
    });

    if (!response.ok) {
      throw new Error("Failed to merge cart with server.");
    }

    console.log("Cart merged successfully!");
  } catch (error) {
    console.error("Error merging cart:", error);
  }
};
