import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const token = process.env.DISCORD_TOKEN!;
const clientId = process.env.CLIENT_ID!;
const guildId = process.env.GUILD_ID!;

export async function registerCommands() {
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  const commands = [];

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    const imported = require(filePath);
    const command = imported.default ?? imported;
    if (!command.data) {
      console.warn(`Skipping ${file} (no .data export).`);
      continue;
    }
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: "10" }).setToken(token);

  console.log("Refreshing application commands...");
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: commands,
  });
  console.log("Commands registered successfully.");
}

// Call it immediately when you run `node dist/deploy-commands.js`
registerCommands().catch((err) => {
  console.error("Failed to register commands:", err);
  process.exit(1);
});
