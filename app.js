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
function startShopping() {
    const customerName = document.getElementById("customerName").value;
    const gender = document.getElementById("gender").value;

    if (!customerName) {
        alert("Please enter customer name");
        return;
    }

    if (items.length === 0) {
        alert("No items available. Please add items first.");
        return;
    }

    let purchases = [];
    addItem(purchases, customerName, gender);
}

// Function to add an item to the bill
function addItem(purchases, customerName, gender) {
    let itemNames = items.map((item, index) => `${index + 1}. ${item.name} (Rs. ${item.price})`).join("\n");

    let index = prompt(`Enter item number (1-${items.length}) or press Cancel to finish:\n${itemNames}`);
    if (index === null) {
        generateBill(purchases, customerName, gender);
        return;
    }

    index = parseInt(index);
    if (isNaN(index) || index < 1 || index > items.length) {
        alert("Invalid item number. Please enter a number between 1 and " + items.length);
        addItem(purchases, customerName, gender);
        return;
    }

    let quantity = prompt(`Enter quantity for ${items[index - 1].name} (Price: ${items[index - 1].price} Rs each):`);
    if (quantity === null || quantity.trim() === "" || isNaN(quantity) || quantity <= 0) {
        alert("Invalid quantity. Please enter again.");
        addItem(purchases, customerName, gender);
        return;
    }

    quantity = parseInt(quantity);
    let price = items[index - 1].price;
    let total = quantity * price;

    purchases.push({ item: items[index - 1].name, quantity, price, total });

    let addMore = confirm("Do you want to add another item?");
    if (addMore) {
        addItem(purchases, customerName, gender);
    } else {
        generateBill(purchases, customerName, gender);
    }
}

// Show the Print Bill button
function showPrintButton() {
    document.getElementById("printBillBtn").classList.remove("hidden");
}

function printBill() {
    window.print(); // Open the browser's print dialog
}


// Print the bill
function printBill() {
    let billContent = document.getElementById("bill").innerHTML;
    let originalContent = document.body.innerHTML;

    document.body.innerHTML = `<div class="container">${billContent}</div>`;
    window.print();
    document.body.innerHTML = originalContent;
    location.reload(); // Reload the page after printing
}

// Generate the bill and display it
// Generate the bill and display it
async function generateBill(purchases, customerName, gender) {
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
    <p><b>Name:</b> ${customerName} &nbsp;&nbsp; <b>Date:</b> ${new Date().toLocaleDateString()}</p>
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
    <h2>Thank You for Visiting D-Mart</h2>`;

    document.getElementById("bill").innerHTML = billHTML;

    // ✅ Show the print button when bill is generated
    document.getElementById("printBillBtn").style.display = "block";

    try {
        const response = await fetch("https://my-bill-book-4.onrender.com/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerName, gender, purchases })
        });

        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error("Error saving bill:", error);
    }
}


function ownerLogin() {
    const password = prompt("Enter Owner Password:");
    
    if (password === "1234") { // ✅ Change this to a stronger password
        document.getElementById("ownerSection").classList.remove("hidden");
        alert("Access Granted!");
    } else {
        alert("Access Denied! Incorrect password.");
    }
}





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

        fetchItems(); // Refresh the items list
    } catch (error) {
        console.error("Error adding item:", error);
        document.getElementById("itemStatus").innerText = "Error adding item.";
    }
}

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

        fetchItems(); // Refresh item list after deletion
    } catch (error) {
        console.error("Error deleting item:", error);
        document.getElementById("deleteStatus").innerText = "Error deleting item.";
    }
}

function showQRCode() {
    // Get the total amount from the bill section
    const totalElement = document.querySelector("#bill h3:last-of-type");
    if (!totalElement) {
        alert("Error: No bill found. Please generate a bill first.");
        return;
    }

    const totalText = totalElement.textContent.match(/(\d+(\.\d+)?)/); // Extract total amount
    if (!totalText) {
        alert("Error: Could not retrieve the total amount.");
        return;
    }

    const totalAmount = parseFloat(totalText[0]); 
    const upiID = "9929689629@pthdfc"; 

    if (!upiID || upiID.includes("your-upi-id")) {
        alert("Error: Please set a valid UPI ID in the script.");
        return;
    }
    

    // Generate UPI payment URL
    const upiURL = `upi://pay?pa=${upiID}&pn=D-Mart&am=${totalAmount.toFixed(2)}&cu=INR&tn=Bill%20Payment`;

    // Generate QR Code
    const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiURL)}`;

    // Display QR Code
    document.getElementById("paymentSection").innerHTML = `
        <p><b>Scan this QR Code to Pay:</b></p>
        <img src="${qrCodeURL}" alt="QR Code">
        <p><b>UPI ID:</b> ${upiID}</p>
        <p><b>Amount:</b> ₹${totalAmount.toFixed(2)}</p>
        <p><b>Payment Note:</b>Jain Mobile Shop Billing System</p>
    `;

    alert("Scan the QR code with your UPI app to complete the payment!");
}



// function printBill() {
//     const billContent = document.getElementById("bill").innerHTML;
    
//     if (!billContent) {
//         alert("No bill available to print!");
//         return;
//     }

//     let printWindow = window.open("", "", "width=600,height=600");
//     printWindow.document.write("<html><head><title>Print Bill</title></head><body>");
//     printWindow.document.write(billContent);
//     printWindow.document.write("</body></html>");
//     printWindow.document.close();
//     printWindow.print();
// }
