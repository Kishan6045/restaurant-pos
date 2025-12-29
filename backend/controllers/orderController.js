const Order = require("../models/Order-Model");
const Table = require("../models/Table-Model");
const Product = require("../models/Products-Model");



exports.createOrder = async (req, res) => {
    try {
        const { tableId, items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Items required" });
        }

        const table = await Table.findById(tableId);
        if (!table) {
            return res.status(404).json({ message: "Table not found" });
        }

        //  check existing OPEN order
        let order = await Order.findOne({
            tableId,
            paymentStatus: "unpaid"
        });

        let totalAmount = order ? order.totalAmount : 0;
        for (let item of items) {
            if (!item.productId || !item.quantity) {
                return res.status(400).json({ message: "ProductId and quantity required" });
            }
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }
            if (item.quantity <= 0) {
                return res.status(400).json({ message: "Quntity must be greater than 0" });
            }
            totalAmount += product.price * item.quantity;
            //agar order already hai → item add
            if (order) {
                const existingItem = order.items.find(
                    i => i.productId.toString() === item.productId.toString()
                );

                if (existingItem) {
                    existingItem.quantity += item.quantity;
                } else {
                    order.items.push(item);
                }
            }

        }
        if (isNaN(totalAmount)) {
            return res.status(400).json({ message: "Invaild total amount calculation" });
        }

        // agar open order nahi mila → new create
        if (!order) {
            order = await Order.create({
                tableId,
                items,
                totalAmount,
                status: "pending",
                paymentStatus: "unpaid",
                createdBy: req.user.id
            });
            table.status = "occupied";
            await table.save();

            return res.status(201).json(order);
        }

        //existing order update
        order.totalAmount = totalAmount;
        await order.save();
        res.json({ message: "Iteams added to existing order", order });
    } catch (error) {
        res.status(500).json({ message: "Order creation failed" });
    }
};



//Kitchen updates order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatus = ["pending", "preparing", "ready", "served"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invaild status" });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: " Status update failed" });
    }
};


// View orders (Kitchen + Cashier + Admin)
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("tableId")    //populate use kare to pura table data aaja ta hai
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};