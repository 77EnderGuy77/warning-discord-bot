// src/scripts/seed.ts
import { faker } from "@faker-js/faker";
import { initDatabase, getModels, getSequelize } from "../database/guildDatabaseManager";

interface SeedOptions {
  guildId: string;
  userCount: number;
  muteProbability?: number; // chance [0–1] of bundling 3 warns into a mute
  daysBack?: number;        // how far back to date them
  modID?: string;           // moderator ID to attribute actions to
}

export async function seed({
  guildId,
  userCount,
  muteProbability = 0.2,
  daysBack = 30,
  modID = "1161066818681716758",
}: SeedOptions) {
  console.log(`Seeding ${userCount} users into guild ${guildId}…`);

  // 1) Ensure DB is ready for this guild
  await initDatabase(guildId);
  const sequelize = getSequelize(guildId);
  const { Infractions, Warns, Mutes } = getModels(guildId);

  // 2) (Optional) wrap in a single transaction for speed
  const tx = await sequelize.transaction();
  try {
    for (let i = 0; i < userCount; i++) {
      // Discord-like 18–19 digit ID
      const userID = faker.number
        .bigInt({
          min: 1_000_000_000_000_000_000n,
          max: 9_999_999_999_999_999_999n,
        })
        .toString();

      if (Math.random() < muteProbability) {
        // Create one mute that represents 3 merged warns
        const reasons = Array.from({ length: 3 })
          .map(() => faker.lorem.sentence(5))
          .join(" | ");

        // If your models use Sequelize timestamps: true and expect Date,
        // either omit createdAt or pass a JS Date, not a number.
        const createdAt = Math.floor(faker.date.recent({ days: daysBack }).getTime() / 1000);

        const mute = await Mutes.create(
          { reasons, createdAt },
          { transaction: tx }
        );

        await Infractions.create(
          {
            infractionID: mute.getDataValue("id"),
            userID,
            modID,
            type: "mute",
          },
          { transaction: tx }
        );

        console.log(`→ ${userID} muted (3 warns): ${reasons}`);
      } else {
        // Create between 0 and 2 separate warning records
        const warnCount = faker.number.int({ min: 0, max: 2 });
        for (let w = 0; w < warnCount; w++) {
          const reason = faker.lorem.sentence(5);
          const createdAt = Math.floor(faker.date.recent({ days: daysBack }).getTime() / 1000);

          const warn = await Warns.create(
            { reasons: reason, createdAt },
            { transaction: tx }
          );

          await Infractions.create(
            {
              infractionID: warn.getDataValue("id"),
              userID,
              modID,
              type: "warn",
            },
            { transaction: tx }
          );
        }
        if (warnCount > 0) {
          console.log(`→ ${userID} got ${warnCount} warning(s)`);
        }
      }
    }

    await tx.commit();
    console.log("Done seeding ✔️");
  } catch (err) {
    await tx.rollback();
    console.error("Seeding failed:", err);
    process.exitCode = 1;
  }
}

// CLI usage:
//   ts-node src/scripts/seed.ts <guildId> [userCount=10] [muteProbability=0.2] [daysBack=30]
if (require.main === module) {
  const [guildId, countArg, probArg, daysArg] = process.argv.slice(2);
  if (!guildId) {
    console.error("Usage: ts-node src/scripts/seed.ts <guildId> [userCount] [muteProbability] [daysBack]");
    process.exit(1);
  }

  const userCount = Number.isFinite(Number(countArg)) ? parseInt(countArg, 10) : 10;
  const muteProbability = probArg !== undefined ? Math.max(0, Math.min(1, Number(probArg))) : 0.2;
  const daysBack = daysArg !== undefined ? parseInt(daysArg, 10) : 30;

  seed({ guildId, userCount, muteProbability, daysBack }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
