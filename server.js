const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Sample menu items (This can be replaced with a database)
let menuItems = [
    { id: '1', name: 'Pizza', category: 'Main Course', price: 10.99, available_quantity: 10 },
    { id: '2', name: 'Pasta', category: 'Main Course', price: 8.99, available_quantity: 5 },
    { id: '3', name: 'Salad', category: 'Appetizer', price: 6.99, available_quantity: 0 },
];

let orders = []; // Array to store orders

// Order route
app.post('/order', (req, res) => {
    const orderData = req.body;
    
    // Validate order data
    if (!orderData.table_number || !Array.isArray(orderData.order_items)) {
        return res.status(400).json({ message: 'Invalid order data' });
    }

    try {
        // Calculate total price
        const totalPrice = orderData.order_items.reduce((total, item) => {
            const menuItem = menuItems.find(menuItem => menuItem.id === item.id);
            if (menuItem) {
                return total + (menuItem.price * item.quantity);
            }
            return total;
        }, 0);

        // Create a new order
        const orderId = orders.length + 1; // Generate order ID
        const orderDate = new Date();

        const newOrder = {
            id: orderId,
            table_number: orderData.table_number,
            contact_number: orderData.contact_number,
            order_items: orderData.order_items,
            total_price: totalPrice,
            order_date: orderDate,
            status: 'Pending',
        };

        // Update available quantities
        for (const orderItem of orderData.order_items) {
            const menuItem = menuItems.find(item => item.id === orderItem.id);
            if (menuItem) {
                if (menuItem.available_quantity >= orderItem.quantity) {
                    menuItem.available_quantity -= orderItem.quantity; // Decrease the available quantity
                } else {
                    return res.status(400).json({ message: `Not enough quantity for ${menuItem.name}` });
                }
            } else {
                return res.status(400).json({ message: `Item not found: ${orderItem.id}` });
            }
        }

        orders.push(newOrder); // Add the new order to the orders array

        console.log('Order placed successfully:', newOrder); // Log successful order placement
        res.status(200).json({ message: 'Order placed successfully!', orderId: orderId });
    } catch (error) {
        console.error("Error processing order:", error); // Log error
        res.status(500).json({ message: 'An error occurred while processing your order.', error: error.message });
    }
});

// Route to get all orders for history
app.get('/orders', (req, res) => {
    res.status(200).json(orders); // Return the orders
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
