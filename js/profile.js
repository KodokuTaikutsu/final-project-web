document.addEventListener("DOMContentLoaded", () => {
  const authToken = localStorage.getItem("authToken");
  const apiUrl = "http://localhost:3000/api";
  const currentProfilePicture = document.getElementById("currentProfilePicture");
  const usernameElement = document.getElementById("username");
  const emailElement = document.getElementById("email");
  const profilePictureForm = document.getElementById("updateProfilePictureForm");
  const logoutButton = document.getElementById("logoutButton");

  // Function to decode JWT token
  const decodeJWT = (token) => {
      if (!token) return null;
      const payloadBase64 = token.split(".")[1];
      const decodedPayload = atob(payloadBase64);
      return JSON.parse(decodedPayload);
  };

  // Decode the token to retrieve the user ID
  const userPayload = decodeJWT(authToken);
  const userId = userPayload?.userId;

  if (!authToken || !userId) {
      console.error("No valid token or user ID found. Redirecting to login.");
      window.location.href = "../html/login.html";
      return;
  }

  // Fetch user data and profile picture
  const fetchUserData = async () => {
      try {
          const response = await fetch(`${apiUrl}/users/me`, {
              headers: {
                  Authorization: `Bearer ${authToken}`,
              },
          });

          if (!response.ok) {
              throw new Error("Failed to fetch user data");
          }

          const userData = await response.json();

          // Set user details
          if (userData.fullname) {
              usernameElement.textContent = `Full Name: ${userData.fullname}`;
          } else {
              usernameElement.textContent = "Full Name: Not Available";
          }

          if (userData.email) {
              emailElement.textContent = `Email: ${userData.email}`;
          } else {
              emailElement.textContent = "Email: Not Available";
          }

          // Set profile picture
          if (userData.profilepicture) {
              currentProfilePicture.src = `http://localhost:3000${userData.profilepicture}?t=${new Date().getTime()}`;
          } else {
              currentProfilePicture.src = "../images/default-avatar.png"; // Default avatar if no image exists
          }
      } catch (error) {
          console.error("Error fetching user data:", error);

          // Show fallback data
          usernameElement.textContent = "Full Name: Error Loading";
          emailElement.textContent = "Email: Error Loading";
          currentProfilePicture.src = "../images/default-avatar.png";
      }
  };

  // Handle profile picture upload
  profilePictureForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData();
      const profilePictureFile = document.getElementById("profilePicture").files[0];

      if (!profilePictureFile) {
          alert("Please select a file before uploading.");
          return;
      }

      formData.append("profilePicture", profilePictureFile);

      try {
          const response = await fetch(`${apiUrl}/users/${userId}/profile-picture`, {
              method: "POST",
              headers: {
                  Authorization: `Bearer ${authToken}`, // Ensure token is included
              },
              body: formData,
          });

          const data = await response.json();

          if (response.ok) {
              alert("Profile picture updated successfully!");

              // Update profile picture
              const updatedProfilePicture = data.user.profile_picture;
              currentProfilePicture.src = `http://localhost:3000${updatedProfilePicture}?t=${new Date().getTime()}`;

              // Update localStorage
              localStorage.setItem("profilePicture", updatedProfilePicture);
          } else {
              console.error("Server Error:", data);
              alert(data.error || "Failed to upload profile picture.");
          }
      } catch (error) {
          console.error("Error uploading profile picture:", error);
          alert("An unexpected error occurred during the upload.");
      }
  });

  // Logout function
  logoutButton.addEventListener("click", () => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("profilePicture");
      window.location.href = "../html/login.html";
  });

  // Fetch user data on page load
  fetchUserData();
});
