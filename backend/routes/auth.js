import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Promo from "../models/Promo.js";
import { nanoid } from "nanoid";
import { sendPromoCodeEmail } from "../services/emailService.js";

const router = express.Router();

// REGISTER - Creates account and sends welcome promo code
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({ 
      username, 
      email: email.toLowerCase(), 
      password: hashed 
    });

    // Generate welcome promo code
    const welcomeCode = nanoid(8).toUpperCase();
    await Promo.create({
      code: welcomeCode,
      discount: 10,
      userId: user.id
    });

    // Send welcome email with promo code
    const emailResult = await sendPromoCodeEmail(
      user.email, 
      user.username, 
      welcomeCode, 
      10
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      "your-secret-key-change-this",
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: emailResult.success 
        ? "Registration successful! Check your email for welcome promo code."
        : "Registration successful but promo email failed. Please contact support.",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      "your-secret-key-change-this",
      { expiresIn: '7d' }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;