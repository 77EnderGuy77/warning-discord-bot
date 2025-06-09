import {sequelize} from "../index";

import { DataTypes, Model } from "sequelize";

class Warning extends Model {
  declare id: number;
  declare userId: string;
  declare modId: string;
  declare reason: string;
  declare createdAt: number;
}

Warning.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING(19),
      allowNull: false,
    },
    modId: {
      type: DataTypes.STRING(19),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING(100),
    },
    createdAt: {
      type: DataTypes.INTEGER,
    },
  },
  { sequelize, tableName: "warnigns", timestamps: false }
);

export default Warning;