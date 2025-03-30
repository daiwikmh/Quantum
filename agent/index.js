import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import validateEnvironment from "./evnValidation.js";
import { startWsServer } from "../agent/wsServer.js";

dotenv.config();
validateEnvironment();

let currentUserEmail = "goutamkumar.sharmq@gmail.com"; // Set default email for testing

const app = express();
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:5173'], // Add your client URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Endpoint to set current user email
app.post("/api/set-email", (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required"
      });
    }

    currentUserEmail = email;
    console.log("Email set to:", currentUserEmail); // Debug log
    
    res.json({
      status: "success",
      message: "Email set successfully",
      email: currentUserEmail
    });
  } catch (error) {
    console.error("Error setting email:", error);
    res.status(500).json({
      status: "error",
      message: "Server error while setting email"
    });
  }
});

// Debug endpoint to check current email
app.get("/api/current-email", (req, res) => {
  res.json({
    status: "success",
    email: currentUserEmail
  });
});

export const getCurrentEmail = () => currentUserEmail;

const server = http.createServer(app);
startWsServer(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Current email set to: ${currentUserEmail}`); // Debug log
});
