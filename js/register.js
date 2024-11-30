document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent form from refreshing the page

  // Get form data
  const fullName = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!fullName || !email || !password) {
    alert("Please fill out all fields.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        password,
        roleId: 2, // Default role ID for regular users
      }),
    });

    if (response.ok) {
      alert("Registration successful! Please log in.");
      window.location.href = "login.html"; // Redirect to login page
    } else {
      // Attempt to parse the error message if it's JSON
      const data = await response.json().catch(() => null);
      const errorMessage = data?.error || "Failed to register. Please try again.";
      alert(errorMessage);
      console.error("Registration error:", errorMessage);
    }
  } catch (error) {
    console.error("Network or unexpected error:", error);
    alert("An unexpected error occurred. Please check your network and try again.");
  }
});
