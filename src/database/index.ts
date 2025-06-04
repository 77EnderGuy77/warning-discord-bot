const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./data/database.sqlite",
  logging: false
});

import User from "./models/users";
import Warning from "./models/warnings";
import Mute from "./models/mutes";

User.hasMany(Warning, { foreignKey: "user_id", as: "warnings" });
Warning.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(Mute, { foreignKey: "user_id", as: "mutes" });
Mute.belongsTo(User, { foreignKey: "user_id", as: "user" });

export {sequelize};