import { Sequelize } from "sequelize";

// Using SQLite (you can change to PostgreSQL or MySQL)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false // Set to console.log to see SQL queries
});

export default sequelize;