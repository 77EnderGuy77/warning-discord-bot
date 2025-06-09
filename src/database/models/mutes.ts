import {sequelize} from "../index";

import { DataTypes, Model } from "sequelize";

class Mute extends Model {
  declare id: number;
  declare userId: string;
  declare modId: string;
  declare reasons: string;
  declare createdAt: number;
}

Mute.init(
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
    reasons: {
      type: DataTypes.STRING(100),
    },
    createdAt: {
      type: DataTypes.INTEGER,
    },
  },
  { sequelize, tableName: "mutes", timestamps: false }
);

export default Mute;