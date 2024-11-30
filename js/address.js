document.addEventListener("DOMContentLoaded", async () => {
    const addressesContainer = document.getElementById("addresses-container");
    const addAddressButton = document.getElementById("addAddressButton");
    const newAddressForms = document.getElementById("newAddressForms");
    const addressFormTemplate = document.getElementById("addressFormTemplate");
    const addMoreAddressForm = document.getElementById("addMoreAddressForm");
    const submitAddresses = document.getElementById("submitAddresses");

    // Function to fetch and display user addresses
    const fetchAddresses = async () => {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            alert("You need to log in to view your addresses.");
            return;
        }
    
        try {
            const response = await fetch("http://localhost:3000/api/addresses", {
                headers: { Authorization: `Bearer ${authToken}` },
            });
    
            if (!response.ok) {
                throw new Error(`Failed to fetch addresses: ${response.statusText}`);
            }
    
            const addresses = await response.json();
    
            if (!Array.isArray(addresses)) {
                console.error("Unexpected response format:", addresses);
                addressesContainer.innerHTML = "<p>No addresses found.</p>";
                return;
            }
    
            addressesContainer.innerHTML = addresses
                .map(address => `
                    <div class="address">
                        <p>${address.address_line}, ${address.city}, ${address.state}, ${address.postal_code}, ${address.country}</p>
                    </div>
                `)
                .join("");
        } catch (error) {
            console.error("Error fetching addresses:", error);
            addressesContainer.innerHTML = "<p>Error loading addresses. Please try again.</p>";
        }
    };
    
    

    // Recursive function to submit each address form
    const submitAddressForms = async (forms, index = 0) => {
        if (index >= forms.length) {
            alert("All addresses added successfully!");
            window.location.reload();
            return;
        }

        const form = forms[index];
        const address = {
            address_line: form.querySelector("input[name='address_line']").value,
            city: form.querySelector("input[name='city']").value,
            state: form.querySelector("input[name='state']").value,
            postal_code: form.querySelector("input[name='postal_code']").value,
            country: form.querySelector("input[name='country']").value,
        };

        const authToken = localStorage.getItem("authToken");

        if (!authToken) {
            alert("You need to log in to add addresses.");
            window.location.href = "/html/login.html";
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/addresses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(address),
            });

            if (response.ok) {
                console.log(`Address ${index + 1} added successfully.`);
                // Call the next address recursively
                await submitAddressForms(forms, index + 1);
            } else {
                const errorData = await response.json();
                alert(errorData.error || `Failed to add address ${index + 1}.`);
            }
        } catch (error) {
            console.error(`Error adding address ${index + 1}:`, error);
            alert(`An error occurred while adding address ${index + 1}.`);
        }
    };

    // Show address form when "Add Address" button is clicked
    addAddressButton.addEventListener("click", () => {
        newAddressForms.style.display = "block";
        addAddressButton.style.display = "none";
    });

    // Add a new address form when "Add More Address Form" button is clicked
    addMoreAddressForm.addEventListener("click", () => {
        const newForm = addressFormTemplate.content.cloneNode(true);
        newAddressForms.appendChild(newForm);
    });

    // Submit all addresses when "Submit Addresses" button is clicked
    submitAddresses.addEventListener("click", () => {
        const addressForms = document.querySelectorAll(".address-form");
        submitAddressForms(Array.from(addressForms));
    });

    // Fetch existing addresses on page load
    fetchAddresses();
});
