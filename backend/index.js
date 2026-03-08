import express from 'express';
const app = express();
import { connectToDatabase } from './database/connectionToDatabase.js';    
import dotenv from "dotenv";
import authRoutes from './routes/auth-route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import profileRoutes from './routes/profile-route.js';  // add this import   
dotenv.config();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use('/api/profile', profileRoutes); 
app.use(cookieParser());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.get('/',(req,res)=>{
    res.send("Hello there!!");
});

connectToDatabase()
  .then(() => {
    app.listen(3000, ()=>{
        console.log("server running on port 3000");
    })
  })
  .catch(err => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });


//Ml85ExjXP5W7xcwB           => mongo- passwordcd..
