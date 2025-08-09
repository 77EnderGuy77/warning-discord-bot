// src/database/GuildDB.ts
import { Sequelize } from "sequelize";
import path from "path";
import fs from "fs";

import Infractions from "./models/infractions";
import Warns from "./models/warns";
import Mutes from "./models/mutes";

type Models = {
  Infractions: typeof Infractions;
  Warns: typeof Warns;
  Mutes: typeof Mutes;
};

type Bundle = {
  sequelize: Sequelize;
  models: Models;
};

class GuildDatabaseManager {
  private bundles: Map<string, Bundle> = new Map();

  private createBundle(guildId: string): Bundle {
    const dbPath = path.join(__dirname, `../../data/${guildId}/database.sqlite`);
    if (!fs.existsSync(path.dirname(dbPath))) {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }

    const sequelize = new Sequelize({
      dialect: "sqlite",
      storage: dbPath,
      logging: false,
    });

    // Initialize models on this Sequelize
    Warns.initModel(sequelize);
    Infractions.initModel(sequelize);
    Mutes.initModel(sequelize);

    // Associations (only set once per Sequelize)
    // Warns <-> Infractions (type='warn')
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

    // Mutes <-> Infractions (type='mute')
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

    const models: Models = { Infractions, Warns, Mutes };
    const bundle: Bundle = { sequelize, models };
    this.bundles.set(guildId, bundle);
    return bundle;
  }

  /** Ensure bundle exists and return it */
  private ensureBundle(guildId: string): Bundle {
    return this.bundles.get(guildId) ?? this.createBundle(guildId);
  }

  /** Return Sequelize for a guild (initializes if missing) */
  getSequelize(guildId: string): Sequelize {
    return this.ensureBundle(guildId).sequelize;
  }

  /** Return initialized models for a guild (initializes if missing) */
  getModels(guildId: string): Models {
    return this.ensureBundle(guildId).models;
  }

  /** Kept for convenience: authenticate + sync */
  async initDatabase(guildId: string): Promise<Sequelize> {
    const { sequelize } = this.ensureBundle(guildId);
    await sequelize.authenticate();
    await sequelize.sync();
    return sequelize;
  }

  async dispose(guildId: string) {
    const bundle = this.bundles.get(guildId);
    if (bundle) {
      await bundle.sequelize.close();
      this.bundles.delete(guildId);
    }
  }
}

export const GuildDB = new GuildDatabaseManager();

/** Handy named exports if you prefer function imports */
export const getSequelize = (guildId: string) => GuildDB.getSequelize(guildId);
export const getModels = (guildId: string) => GuildDB.getModels(guildId);
export const initDatabase = (guildId: string) => GuildDB.initDatabase(guildId);
