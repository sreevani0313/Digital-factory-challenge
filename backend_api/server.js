const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./models/Task");


dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const User = require("./models/User");  // Import the User model

// User Registration Route
app.post("/api/register", async (req, res) => {
    console.log("POST /api/register hit");
    const { name, email, password } = req.body;

    try {
        // Check if the user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
        });

        // Save the user to the database
        await user.save();

        // Return a success message
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
});

// User Login Route
app.post("/api/login", async (req, res) => {
    console.log("POST /api/login hit");
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        // Return the token
        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
});

// Middleware to protect routes
const auth = (req, res, next) => {
    // Get the token from the Authorization header
    const token = req.header("x-auth-token");

    // If no token, return an error
    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the user to the request object
        req.user = decoded.userId;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error(error.message);
        res.status(401).json({ message: "Token is not valid" });
    }
};


// Protected route to get user profile
app.get("/api/profile", auth, async (req, res) => {
    try {
        // Use req.user (userId from the token) to find the authenticated user
        const user = await User.findById(req.user).select("-password"); // Exclude password from response
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user); // Send the user data back
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
});

app.delete("/api/tasks/:id", auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
});


app.put("/api/tasks/:id", auth, async (req, res) => {
    const { title, completed } = req.body;
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user },
            { title, completed },
            { new: true } // Return the updated document
        );
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json(task);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
});
