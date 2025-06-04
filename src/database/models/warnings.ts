import {sequelize} from "../index";

import { DataTypes, Model } from "sequelize";

class Warning extends Model {
  declare id: number;
  declare user_id: string;
  declare mod_id: string;
  declare reason: string;
  declare created_at: number;
}

Warning.init(
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
    reason: {
      type: DataTypes.STRING(100),
    },
    created_at: {
      type: DataTypes.INTEGER,
    },
  },
  { sequelize, tableName: "warnigns", timestamps: false }
);

export default Warning;