import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage:
    process.env.NODE_ENV === "test" ? ":memory:" : "./data/database.sqlite",
  logging: false,
});

import Infractions from "./models/infractions";
import Warns from "./models/warns";
import Mutes from "./models/mutes";

Warns.hasMany(Infractions, {
  foreignKey: "infractionID",
  constraints: false,
  onDelete: "CASCADE",
  scope: { type: "warn" },
});

Infractions.belongsTo(Warns, {
  foreignKey: "infractionID",
  constraints: false,
});

Mutes.hasMany(Infractions, {
  foreignKey: "infractionID",
  constraints: false,
  onDelete: "CASCADE",
  scope: { type: "mute" },
});

Infractions.belongsTo(Mutes, {
  foreignKey: "infractionID",
  constraints: false,
});

export { Infractions, Warns, Mutes };
