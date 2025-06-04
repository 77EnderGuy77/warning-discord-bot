import {sequelize} from "../index";

import { DataTypes, Model } from "sequelize";

class User extends Model {
  declare id: number;
  declare warn_total: number;
  declare mute_total: number;
}

User.init(
  {
    id: {
      type: DataTypes.STRING(19),
      primaryKey: true,
      allowNull: false
    },
    warn_total: {
      type: DataTypes.NUMBER,
      defaultValue: 0,
    },
    mute_total: {
      type: DataTypes.NUMBER,
      defaultValue: 0,
    },
  }, 
  { sequelize, tableName: "user", timestamps: false }
);

export default User;