const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const requireAuth = require('../middlewares/authMiddleware');
require('dotenv').config();

const getRandomNumber = () => Math.floor(Math.random() * 5000) + 1;

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check for Required Fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "A user with this email already exists" });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hash, profilePicture: `https://api.dicebear.com/6.x/bottts/svg?seed=${getRandomNumber()}` });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ "token": token, "name": user.name, "email": user.email, "profilePicture": user.profilePicture });

    } catch (err) {
        // Catch Specific Errors
        if (err.code === 11000) {
            return res.status(400).json({ message: "A user with this email already exists" });
        }

        // Handle Unexpected Errors
        console.error(err);
        res.status(500).json({ message: "Something went wrong on the server-side" });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(422).json({ error: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(422).json({ error: 'Invalid email or password' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ "token": token, "name": user.name, "email": user.email, "profilePicture": user.profilePicture });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong when trying to login' });
    }
}

exports.getUserInfo = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Get the token from the header
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        const user = await User.findOne({ _id: decodedToken.userId }); // Use the decoded token to find the user by ID
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ "name": user.name, "email": user.email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong on the server-side" });
    }
};