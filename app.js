// Function to fetch menu items from the API
async function fetchMenuItems() {
    try {
        const response = await fetch("https://api.jsonbin.io/v3/b/66faa41facd3cb34a88ed968", {
            method: "GET",
            headers: {
                "X-Master-Key": "$2b$10$uE.tFGujZ93rs.TD2HkC9.H0kHw6lAEI9g3kJmB5xP2hLCjphMYe6" // Use the master key for access
            }
        });
        const data = await response.json();
        displayMenuItems(data.record); // Assuming the menu items are in data.record
    } catch (error) {
        console.error("Error fetching menu items:", error);
    }
}

// Function to display menu items on the page
function displayMenuItems(menuItems) {
    const menuContainer = document.getElementById("menu-items");
    menuContainer.innerHTML = ""; // Clear any existing items

    menuItems.forEach(item => {
        if (item.available_quantity > 0) { // Check if the item is available
            const menuItem = document.createElement("div");
            menuItem.className = "menu-item";
            menuItem.innerHTML = `
                <img src="${item.image_url}" alt="${item.name}" style="width: 100%; border-radius: 8px; margin-bottom: 10px;">
                <h2>${item.name}</h2>
                <p>Category: ${item.category}</p>
                <p>Price: $${item.price.toFixed(2)}</p>
                <p>Available Quantity: <span class="quantity">${item.available_quantity}</span></p>
                <button onclick="addToOrder('${item.id}', '${item.name}', ${item.price}, ${item.available_quantity})">Add to Order</button>
            `;
            menuContainer.appendChild(menuItem);
        }
    });
}

let order = [];

// Function to add an item to the order
function addToOrder(itemId, itemName, itemPrice, availableQuantity) {
    const existingItem = order.find(item => item.id === itemId);
    if (existingItem) {
        if (existingItem.quantity < availableQuantity) {
            existingItem.quantity += 1; // Increment quantity if item already exists and is available
        } else {
            alert(`Cannot add more of ${itemName}. Only ${availableQuantity} available.`);
            return;
        }
    } else {
        order.push({ id: itemId, name: itemName, price: itemPrice, quantity: 1 }); // Add new item to order
    }
    updateOrderSummary(); // Update the order summary display
}

// Function to update the order summary display
function updateOrderSummary() {
    const orderSummary = document.getElementById("order-summary");
    orderSummary.innerHTML = ""; // Clear existing summary

    order.forEach(item => {
        const itemElement = document.createElement("div");
        itemElement.innerHTML = `${item.name} - $${item.price.toFixed(2)} x ${item.quantity}`;
        orderSummary.appendChild(itemElement);
    });
    
    const totalPrice = order.reduce((total, item) => total + item.price * item.quantity, 0);
    orderSummary.innerHTML += `<strong>Total: $${totalPrice.toFixed(2)}</strong>`;
}

// Add an event listener for the order form submission
document.getElementById('order-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const tableNumber = document.getElementById('table-number').value;
    const contactNumber = document.getElementById('contact-number').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    // Prepare the order data
    const orderData = {
        table_number: tableNumber,
        contact_number: contactNumber,
        date: date,
        time: time,
        order_items: order // Use the order array you have already populated
    };

    try {
        const response = await fetch('http://localhost:3000/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message); // Show success message
            updateMenuQuantities(); // Update quantities in menu
            resetOrderForm(); // Reset the form
        } else {
            alert('Failed to place order. Please try again.');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('An error occurred while placing the order.');
    }
});

// Function to update menu item quantities in the UI
function updateMenuQuantities() {
    order.forEach(item => {
        const menuItemElement = document.querySelector(`.menu-item:has(h2:contains("${item.name}")) .quantity`);
        if (menuItemElement) {
            const currentQuantity = parseInt(menuItemElement.textContent);
            menuItemElement.textContent = currentQuantity - item.quantity; // Update the quantity
        }
    });
}

// Function to reset the order form
function resetOrderForm() {
    document.getElementById('order-form').reset(); // Reset the form fields
    order = []; // Clear the order array
    updateOrderSummary(); // Clear the order summary
}

// Function to show the menu
function showMenu() {
    document.getElementById('app').style.display = 'block'; // Show the menu
    document.getElementById('order-history').style.display = 'none'; // Hide order history
}

// Function to show order history
async function showOrderHistory() {
    const response = await fetch('http://localhost:3000/orders');
    const orders = await response.json();
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = ''; // Clear existing orders

    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.innerHTML = `
            <h3>Order ID: ${order.id}</h3>
            <p>Table Number: ${order.table_number}</p>
            <p>Contact Number: ${order.contact_number}</p>
            <p>Items:</p>
            <ul>
                ${order.order_items.map(item => `<li>${item.name} - $${item.price.toFixed(2)} x ${item.quantity}</li>`).join('')}
            </ul>
            <p>Total Price: $${order.total_price.toFixed(2)}</p>
            <p>Status: ${order.status}</p>
            <p>Date: ${new Date(order.order_date).toLocaleString()}</p>
            <hr>
        `;
        ordersList.appendChild(orderElement);
    });

    document.getElementById('app').style.display = 'none'; // Hide menu
    document.getElementById('order-history').style.display = 'block'; // Show order history
}

// Event listener for view order history button
document.getElementById('view-order-history').addEventListener('click', showOrderHistory);

// Fetch menu items on page load
fetchMenuItems();
