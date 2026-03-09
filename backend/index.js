import express from 'express';
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

import { connectToDatabase } from './database/connectionToDatabase.js';
import authRoutes            from './routes/auth-route.js';
import profileRoutes         from './routes/profile-route.js';
import nutritionRoutes       from './routes/nutrition-route.js';
import foodLogRoutes         from './routes/foodLog-route.js';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
    origin:      process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/profile',   profileRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/food-log',  foodLogRoutes);

app.get('/', (_req, res) => res.send("Nutrition Tracker API – running ✓"));

// ─── Boot ─────────────────────────────────────────────────────────────────────
connectToDatabase()
    .then(() => {
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error("Failed to connect to database:", err);
        process.exit(1);
    });
