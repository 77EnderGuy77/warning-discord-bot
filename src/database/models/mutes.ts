import {sequelize} from "../index";

import { DataTypes, Model } from "sequelize";

class Mute extends Model {
  declare id: number;
  declare user_id: string;
  declare mod_id: string;
  declare reasons: string;
  declare created_at: number;
}

Mute.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING(19),
      allowNull: false,
    },
    mod_id: {
      type: DataTypes.STRING(19),
      allowNull: false,
    },
    reasons: {
      type: DataTypes.STRING(100),
    },
    created_at: {
      type: DataTypes.INTEGER,
    },
  },
  { sequelize, tableName: "mutes", timestamps: false }
);

export default Mute;