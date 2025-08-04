import { faker } from "@faker-js/faker";
import { sequelize, Infractions, Warns, Mutes } from "./index";

interface SeedOptions {
  userCount: number;
  muteProbability?: number; // chance [0–1] of bundling 3 warns into a mute
  daysBack?: number;        // how far back to date them
}

async function seed({
  userCount,
  muteProbability = 0.2,
  daysBack = 30,
}: SeedOptions) {
  console.log(`Seeding ${userCount} users…`);

  // 1) Verify DB connection
  await sequelize.authenticate();
  
  // 2) Create any missing tables (won’t drop existing ones)
  await sequelize.sync();

  const modID = "1161066818681716758";

  for (let i = 0; i < userCount; i++) {
    // Generate a Discord‐style 18–19 digit ID
    const userId = faker.number
      .bigInt({ min: 1_000_000_000_000_000_000n, max: 9_999_999_999_999_999_999n })
      .toString();

    // Decide on a mute bundle or individual warnings
    if (Math.random() < muteProbability) {
      // Bundle 3 warns into one mute record
      const reasons = Array.from({ length: 3 })
        .map(() => faker.lorem.sentence(5))
        .join(" | ");
      const ts = Math.floor(faker.date.recent({ days: daysBack }).getTime() / 1000).toString();
      
      // Create the mute detail record
      const mute = await Mutes.create({ reasons, createdAt: ts });
      // Link in infractions table
      await Infractions.create({
        infractionID: mute.id,
        userID: userId,
        modID,
        type: "mute",
      });

      console.log(`→ ${userId} muted (3 warns): ${reasons}`);
    } else {
      // Create between 0 and 2 separate warning records
      const warnCount = faker.number.int({ min: 0, max: 2 });
      for (let w = 0; w < warnCount; w++) {
        const reason = faker.lorem.sentence(5);
        const when = Math.floor(faker.date.recent({ days: daysBack }).getTime() / 1000).toString();

        // Create the warning detail record
        const warn = await Warns.create({ reasons: reason, createdAt: when });
        // Link in infractions table
        await Infractions.create({
          infractionID: warn.id,
          userID: userId,
          modID,
          type: "warn",
        });
      }
      if (warnCount > 0) {
        console.log(`→ ${userId} got ${warnCount} warning(s)`);
      }
    }
  }

  console.log("Done seeding ✔️");
  process.exit(0);
}

if (require.main === module) {
  const n = parseInt(process.argv[2] || "10", 10);
  seed({ userCount: n }).catch(err => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
}
