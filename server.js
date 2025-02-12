const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/shoppingDB", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// Define Schemas
const ItemSchema = new mongoose.Schema({
    name: String,
    price: Number
});
const Item = mongoose.model("Item", ItemSchema);

const CustomerSchema = new mongoose.Schema({
    name: String,
    gender: String,
    purchases: [{ item: String, quantity: Number, price: Number, total: Number }]
});
const Customer = mongoose.model("Customer", CustomerSchema);

// Fetch all items
app.get("/items", async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Server error while fetching items" });
    }
});

app.delete("/items/:name", async (req, res) => {
    try {
        const itemName = req.params.name;
        const deletedItem = await Item.findOneAndDelete({ name: itemName });

        if (!deletedItem) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.json({ message: `Item "${itemName}" deleted successfully` });
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({ error: "Server error while deleting item" });
    }
});


// Add new item
app.post("/items", async (req, res) => {
    try {
        const { name, price } = req.body;
        if (!name || !price) {
            return res.status(400).json({ error: "Item name and price are required" });
        }

        const newItem = new Item({ name, price });
        await newItem.save();
        res.status(201).json({ message: "Item added successfully", item: newItem });
    } catch (error) {
        res.status(500).json({ error: "Server error while adding item" });
    }
});

// Save customer purchase
app.post("/customers", async (req, res) => {
    try {
        const { customerName, gender, purchases } = req.body;
        const newCustomer = new Customer({ name: customerName, gender, purchases });
        await newCustomer.save();
        res.status(201).json({ message: "Bill saved successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Server error while saving bill" });
    }
});

// Get all customers
app.get("/customers", async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: "Server error while fetching customers" });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
