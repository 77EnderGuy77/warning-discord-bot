import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const token = process.env.DISCORD_TOKEN!;
const clientId = process.env.CLIENT_ID!;

export async function registerCommands(guildId: string) {
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

  console.log(`Refreshing application commands for guild ${guildId}...`);
  
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.log(`✅ Commands registered for guild ${guildId}`);
  } catch (error: any) {
    if (error.status === 403) {
      console.warn(`⚠️ Skipping guild ${guildId} — Forbidden (403)`);
      return;
    }
    console.error(`❌ Failed to register commands for guild ${guildId}`, error);
  }

  console.log("Command registration process finished.\n");
}
