import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import Promo from "./models/Promo.js";
import User from "./models/User.js";
import authRoutes from "./routes/auth.js";
import promoRoutes from "./routes/promo.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Define relationships
User.hasMany(Promo, { foreignKey: 'userId' });
Promo.belongsTo(User, { foreignKey: 'userId' });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/promo", promoRoutes);

// Test email endpoint
app.get("/api/test-email", (req, res) => {
  res.json({ 
    message: "Email service configured", 
    emailUser: process.env.EMAIL_USER,
    status: "Ready to send emails to real Gmail addresses"
  });
});

// Database sync and server start
(async () => {
  try {
    // FIRST: Sync the database to create tables
    console.log("🔄 Creating database tables...");
    await sequelize.sync({ alter: true });
    console.log("✅ Database tables created/updated successfully");
    
    // THEN: Check and add any missing columns if needed
    try {
      const [userResults] = await sequelize.query("PRAGMA table_info(Users)");
      const hasEmailColumn = userResults.some(col => col.name === 'email');
      
      if (!hasEmailColumn) {
        console.log("📝 Adding email column to Users table...");
        await sequelize.query("ALTER TABLE Users ADD COLUMN email VARCHAR(255) UNIQUE");
        console.log("✅ Email column added");
      }
    } catch (error) {
      console.log("Note: Columns already exist or table not yet created");
    }
    
    try {
      const [promoResults] = await sequelize.query("PRAGMA table_info(Promos)");
      const hasUserIdColumn = promoResults.some(col => col.name === 'userId');
      
      if (!hasUserIdColumn) {
        console.log("📝 Adding userId column to Promos table...");
        await sequelize.query("ALTER TABLE Promos ADD COLUMN userId INTEGER REFERENCES Users(id)");
        console.log("✅ UserId column added");
      }
    } catch (error) {
      console.log("Note: Columns already exist");
    }
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📧 Email configured to send from: ${process.env.EMAIL_USER}`);
      console.log(`✅ Real Gmail integration ready!\n`);
    });
    
  } catch (err) {
    console.error("❌ Database error:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  }
})();