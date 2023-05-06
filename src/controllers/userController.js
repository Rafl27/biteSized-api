const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

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
        const user = new User({ name, email, password: hash });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ token });

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
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong when trying to login' });
    }
}