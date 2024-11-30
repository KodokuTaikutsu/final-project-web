document.addEventListener("DOMContentLoaded", () => {
  const authToken = localStorage.getItem("authToken"); // Check if the user is logged in
  let profilePicture = localStorage.getItem("profilePicture");
  const navLinks = document.querySelector(".nav-links");

  // Select "Log In" and "Sign Up" buttons by their IDs
  const logInButton = document.getElementById("loginButton");
  const signUpButton = document.getElementById("signUpButton");

  // Function to render the profile picture in the nav
  const renderProfilePicture = () => {
      // Remove any existing profile picture in the nav
      const existingProfileLink = document.querySelector(".profile-link");
      if (existingProfileLink) {
          existingProfileLink.remove();
      }

      // Only render the profile picture if the user is logged in and has a valid profilePicture
      if (authToken && profilePicture) {
          // Create a link wrapping the profile picture
          const profileLink = document.createElement("a");
          profileLink.href = "/html/profile.html"; // Redirect to the profile management page
          profileLink.classList.add("profile-link");

          // Create the profile image element
          const profileImage = document.createElement("img");
          profileImage.src = `http://localhost:3000${profilePicture}`; // Use profile picture if available
          profileImage.alt = "Profile Picture";
          profileImage.classList.add("profile-picture");

          profileLink.appendChild(profileImage);

          // Add to the navigation bar
          navLinks.appendChild(profileLink);
      }
  };

  // Function to handle the visibility of "Log In" and "Sign Up" buttons
  const updateNavLinks = () => {
      if (authToken) {
          // User is logged in: Hide "Log In" and "Sign Up" buttons
          if (logInButton) logInButton.style.display = "none";
          if (signUpButton) signUpButton.style.display = "none";
      } else {
          // User is not logged in: Ensure "Log In" and "Sign Up" buttons are visible
          if (logInButton) logInButton.style.display = "inline-block";
          if (signUpButton) signUpButton.style.display = "inline-block";
      }
  };

  // Render the profile picture if authToken is available
  if (authToken) {
      if (profilePicture) {
          renderProfilePicture();
      } else {
          // Fetch the profile picture from the backend if not in localStorage
          fetch("http://localhost:3000/api/users/me", {
              headers: {
                  Authorization: `Bearer ${authToken}`,
              },
          })
              .then((response) => response.json())
              .then((data) => {
                  if (data.profilePicture) {
                      profilePicture = data.profilePicture;
                      localStorage.setItem("profilePicture", profilePicture);
                      renderProfilePicture();
                  }
              })
              .catch((error) => {
                  console.error("Error fetching user data:", error);
              });
      }
  }

  // Call the function to update visibility of "Log In" and "Sign Up" buttons
  updateNavLinks();

  // Listen for the custom event 'profilePictureUpdated' to update the nav
  document.addEventListener("profilePictureUpdated", (event) => {
      profilePicture = event.detail.profilePicture; // Update the profile picture
      localStorage.setItem("profilePicture", profilePicture); // Update local storage
      renderProfilePicture(); // Re-render the profile picture in the nav
  });
});
