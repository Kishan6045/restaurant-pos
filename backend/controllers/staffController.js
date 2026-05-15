const User = require("../models/User-Model");
const bcrypt = require("bcryptjs");

// create staff
exports.createStaff = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // check existing user
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "User already exists" });
        }
        // password hashing
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: "cashier"
        });
        await user.save();
        res.status(201).json({
            message: "Staff created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Staff creation failed" });
    }
};


//update staff
exports.updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, password } = req.body;

        //find staff
        const user = await User.findById(id);
        if (!user || user.role !== "cashier") {
            return res.status(404).json({ message: "Staff not found" });
        }
        //update fields
        if (name) user.name = name;
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }
        await user.save();

        res.json({
            message: "Staff updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Staff update failed" });
    }
};


// delete staff
exports.deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        // find staff
        const user = await User.findById(id);
        if (!user || user.role !== "cashier") {
            return res.status(404).json({ message: "Staff not found" });
        }
        if (user.isActive === false) {
            return res.status(400).json({ message: "Staff already deactivated" });
        }
        user.isActive = false;
        await user.save();
        res.json({ message: "Staff deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Staff deletion failed" });
    }
};


// get all staff (paginated)
exports.getAllStaff = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const skip = (page - 1) * limit;
        const filter = { role: "cashier" };

        const [staff, total] = await Promise.all([
            User.find(filter, "-password").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            User.countDocuments(filter),
        ]);

        res.json({
            staff,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Fetching staff failed" });
    }
};