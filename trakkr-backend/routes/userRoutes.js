// routes\userRoutes.js
import express from 'express';
const router = express.Router();

// Dummy in-memory user store (replace with DB in production)
const users = [];

// Signup route
router.post('/signup', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ status: false, message: 'Email required.' });
    }
    const exists = users.find(u => u.email === email);
    if (exists) {
        return res.status(409).json({ status: false, message: 'Email already exists.' });
    }
    users.push({ email });
    return res.json({ status: true, message: 'Signup successful.' });
});

// Login route
router.post('/login', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ status: false, message: 'Email required.' });
    }
    const exists = users.find(u => u.email === email);
    if (!exists) {
        return res.status(404).json({ status: false, message: 'Email not found.' });
    }
    return res.json({ status: true, message: 'Login successful.' });
});

export default router;