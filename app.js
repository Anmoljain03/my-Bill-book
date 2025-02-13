document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("printBillBtn").classList.add("hidden");
});

let items = [];

// Fetch items from the backend and update the global `items` array
async function fetchItems() {
    try {
        const response = await fetch("https://my-bill-book-4.onrender.com/items");
        items = await response.json();
        console.log("Fetched items:", items);
    } catch (error) {
        console.error("Error fetching items:", error);
    }
}

// Call fetchItems when the page loads
fetchItems();

// Start the shopping process
async function startShopping() {
    await fetchItems(); // Force fetch items before checking

    const customerName = document.getElementById("customerName").value;
    const gender = document.getElementById("gender").value;
    const phoneNumber = document.getElementById("phoneNumber").value;

    if (!customerName) {
        alert("Please enter customer name");
        return;
    }

    if (!phoneNumber || phoneNumber.length !== 10 || isNaN(phoneNumber)) {
        alert("Please enter a valid 10-digit phone number");
        return;
    }

    if (items.length === 0) {
        alert("No items available. Please add items first.");
        return;
    }

    let purchases = [];
    addItem(purchases, customerName, gender, phoneNumber);
}

// Function to add an item to the bill
function addItem(purchases, customerName, gender, phoneNumber) {
    let itemNames = items.map((item, index) => `${index + 1}. ${item.name} (Rs. ${item.price})`).join("\n");

    let index = prompt(`Enter item number (1-${items.length}) or press Cancel to finish:\n${itemNames}`);
    if (index === null) {
        generateBill(purchases, customerName, gender, phoneNumber);
        return;
    }

    index = parseInt(index);
    if (isNaN(index) || index < 1 || index > items.length) {
        alert("Invalid item number. Please enter a number between 1 and " + items.length);
        addItem(purchases, customerName, gender, phoneNumber);
        return;
    }

    let quantity = prompt(`Enter quantity for ${items[index - 1].name} (Price: ${items[index - 1].price} Rs each):`);
    if (quantity === null || quantity.trim() === "" || isNaN(quantity) || quantity <= 0) {
        alert("Invalid quantity. Please enter again.");
        addItem(purchases, customerName, gender, phoneNumber);
        return;
    }

    quantity = parseInt(quantity);
    let price = items[index - 1].price;
    let total = quantity * price;

    purchases.push({ item: items[index - 1].name, quantity, price, total });

    let addMore = confirm("Do you want to add another item?");
    if (addMore) {
        addItem(purchases, customerName, gender, phoneNumber);
    } else {
        generateBill(purchases, customerName, gender, phoneNumber);
    }
}

// Generate the bill and display it
async function generateBill(purchases, customerName, gender, phoneNumber) {
    if (purchases.length === 0) {
        alert("No items purchased.");
        return;
    }

    let totalBill = purchases.reduce((sum, p) => sum + p.total, 0);
    let discount = totalBill * 0.15;
    let discountedTotal = totalBill - discount;
    let gst = discountedTotal * 0.10;
    let carryBag = confirm("Do you need a carry bag? (10 Rs Extra)") ? 10 : 0;
    let gift = gender === "Female" ? "Cadbury" : "Leather Wallet";
    let finalAmount = discountedTotal + gst + carryBag;

    let billHTML = `<h3>Bill Summary</h3>
    <p><b>Name:</b> ${customerName} &nbsp;&nbsp; <b>Phone:</b> ${phoneNumber} &nbsp;&nbsp; <b>Date:</b> ${new Date().toLocaleDateString()}</p>
    <table>
        <tr><th>Item Name</th><th>Quantity</th><th>Price</th><th>Total</th></tr>`;

    purchases.forEach(p => {
        billHTML += `<tr><td>${p.item}</td><td>${p.quantity}</td><td>${p.price} Rs</td><td>${p.total} Rs</td></tr>`;
    });

    billHTML += `</table>
    <p><b>Total Amount Before GST:</b> ${totalBill.toFixed(2)} Rs</p>
    <p><b>Discount (15%):</b> -${discount.toFixed(2)} Rs</p>
    <p><b>Total Amount After Discount:</b> ${discountedTotal.toFixed(2)} Rs</p>
    <p><b>Gift:</b> ${gift}</p>
    <p><b>Carry Bag:</b> ${carryBag ? "Yes (10 Rs)" : "No"}</p>
    <p><b>GST (10%):</b> ${gst.toFixed(2)} Rs</p>
    <h3>Total Payable Amount: ${finalAmount.toFixed(2)} Rs</h3>
    <h2>Thank You for Visiting Jain Mobile</h2>`;

    document.getElementById("bill").innerHTML = billHTML;

    document.getElementById("printBillBtn").style.display = "block";

    try {
        const response = await fetch("https://my-bill-book-4.onrender.com/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerName, gender, phoneNumber, purchases })
        });

        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error("Error saving bill:", error);
    }
}

// Owner login function
function ownerLogin() {
    const password = prompt("Enter Owner Password:");
    if (password === "1234") { 
        document.getElementById("ownerSection").classList.remove("hidden");
        alert("Access Granted!");
    } else {
        alert("Access Denied! Incorrect password.");
    }
}

// Function to add a new item
async function addNewItem() {
    const itemName = document.getElementById("itemName").value;
    const itemPrice = document.getElementById("itemPrice").value;

    if (!itemName || !itemPrice) {
        alert("Please enter both item name and price.");
        return;
    }

    try {
        const response = await fetch("https://my-bill-book-4.onrender.com/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: itemName, price: parseFloat(itemPrice) })
        });

        const result = await response.json();
        document.getElementById("itemStatus").innerText = result.message;
        document.getElementById("itemName").value = "";
        document.getElementById("itemPrice").value = "";

        fetchItems();
    } catch (error) {
        console.error("Error adding item:", error);
    }
}

// Function to delete an item
async function deleteItem() {
    const itemName = document.getElementById("deleteItemName").value;

    if (!itemName) {
        alert("Please enter an item name to delete.");
        return;
    }

    try {
        const response = await fetch(`https://my-bill-book-4.onrender.com/items/${itemName}`, {
            method: "DELETE",
        });

        const result = await response.json();
        document.getElementById("deleteStatus").innerText = result.message;
        document.getElementById("deleteItemName").value = "";

        fetchItems();
    } catch (error) {
        console.error("Error deleting item:", error);
    }
}
