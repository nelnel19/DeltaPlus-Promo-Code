import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Promo = sequelize.define("Promo", {
  code: {
    type: DataTypes.STRING,
    unique: true
  },
  discount: {
    type: DataTypes.INTEGER
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

export default Promo;