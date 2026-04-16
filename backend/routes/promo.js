import express from "express";
import Promo from "../models/Promo.js";
import User from "../models/User.js";
import { nanoid } from "nanoid";
import { sendPromoCodeEmail } from "../services/emailService.js";

const router = express.Router();

// Generate promo for specific user - SENDS EMAIL TO REAL GMAIL
router.post("/generate-for-user", async (req, res) => {
  try {
    const { userId, discount } = req.body;
    
    // Get user from database
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Generate unique promo code
    const code = nanoid(8).toUpperCase();
    
    // Save to database
    const promo = await Promo.create({
      code,
      discount: discount || 10,
      userId: userId
    });
    
    // SEND EMAIL TO USER'S REAL GMAIL ADDRESS
    console.log(`📧 Attempting to send promo code ${code} to ${user.email}`);
    const emailResult = await sendPromoCodeEmail(
      user.email,
      user.username,
      code,
      discount || 10
    );
    
    if (emailResult.success) {
      console.log(`✅ Promo code ${code} sent successfully to ${user.email}`);
    } else {
      console.log(`❌ Failed to send promo code to ${user.email}: ${emailResult.error}`);
    }
    
    res.json({ 
      success: true,
      promo, 
      user: { id: user.id, username: user.username, email: user.email },
      emailSent: emailResult.success,
      emailError: emailResult.error || null
    });
  } catch (err) {
    console.error("Error generating promo:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get promos for specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const promos = await Promo.findAll({
      where: { userId: userId },
      include: [{
        model: User,
        attributes: ['username', 'email'],
        required: false
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(promos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate promo (general - no user)
router.post("/generate", async (req, res) => {
  try {
    const code = nanoid(8).toUpperCase();

    const promo = await Promo.create({
      code,
      discount: req.body.discount || 10,
      userId: null
    });

    res.json(promo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all promos with user info
router.get("/", async (req, res) => {
  try {
    const promos = await Promo.findAll({
      include: [{
        model: User,
        attributes: ['username', 'email'],
        required: false
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(promos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users with email
router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email']
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Validate promo
router.post("/validate", async (req, res) => {
  const { code, userId } = req.body;

  const promo = await Promo.findOne({ 
    where: { code: code.toUpperCase() },
    include: [{
      model: User,
      attributes: ['username', 'email'],
      required: false
    }]
  });

  if (!promo) {
    return res.json({ valid: false, message: "Invalid promo code" });
  }
  
  if (promo.isUsed) {
    return res.json({ valid: false, message: "This promo code has already been used" });
  }
  
  // Check if promo is assigned to the user
  if (userId && promo.userId && promo.userId !== parseInt(userId)) {
    return res.json({ valid: false, message: "This promo code is not assigned to your account" });
  }

  // Mark as used
  promo.isUsed = true;
  await promo.save();

  res.json({ 
    valid: true, 
    discount: promo.discount, 
    message: `Success! You got ${promo.discount}% discount!`,
    user: promo.User 
  });
});

export default router;