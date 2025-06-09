const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./data/database.sqlite",
  logging: false
});

import User from "./models/users";
import Warning from "./models/warnings";
import Mute from "./models/mutes";

User.hasMany(Warning, { foreignKey: "userId", as: "warnings" });
Warning.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Mute, { foreignKey: "userId", as: "mutes" });
Mute.belongsTo(User, { foreignKey: "userId", as: "user" });

export {sequelize};