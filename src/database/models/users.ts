import {sequelize} from "../index";

import { DataTypes, Model } from "sequelize";

class User extends Model {
  declare id: number;
  declare warnTotal: number;
  declare muteTotal: number;
}

User.init(
  {
    id: {
      type: DataTypes.STRING(19),
      primaryKey: true,
      allowNull: false
    },
    warnTotal: {
      type: DataTypes.NUMBER,
      defaultValue: 0,
    },
    muteTotal: {
      type: DataTypes.NUMBER,
      defaultValue: 0,
    },
  }, 
  { sequelize, tableName: "user", timestamps: false }
);

export default User;