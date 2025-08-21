// app.js
import express from 'express';
import cors from 'cors';
import connectDB from './db/connection.js';
import brandRoutes from './routes/brandRoutes.js';
import userRoutes from './routes/userRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import dotenv from 'dotenv';

const app = express();

connectDB();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/user', userRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/tracking', trackingRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Connect to MongoDB
connectDB().catch(console.error);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;