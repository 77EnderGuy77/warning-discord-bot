// utils/commandLoader.ts
import {
  Client,
  Collection,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import fs from "fs";
import path from "path";

export type CommandModule = {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<unknown>;
};

export function loadCommandsFrom(
  client: Client & { commands: Collection<string, CommandModule> },
  commandsFolder: string
) {
  if (!fs.existsSync(commandsFolder)) {
    console.warn(`Warning: ${commandsFolder} does not exist.`);
    return;
  }

  const files = fs
    .readdirSync(commandsFolder)
    .filter((f) => f.endsWith(".js") || f.endsWith(".ts"));

  for (const file of files) {
    const fullPath = path.join(commandsFolder, file);

    // Clear require cache to ensure fresh reload
    delete require.cache[require.resolve(fullPath)];

    const imported = require(fullPath);
    const command: CommandModule = imported.default ?? imported;

    if (
      command &&
      typeof command === "object" &&
      "data" in command &&
      "execute" in command
    ) {
      const name = (command.data as SlashCommandBuilder).name;
      client.commands.set(name, command);
      console.log(`Loaded command module: ${name}`);
    } else {
      console.warn(`Skipping ${file}: missing .data or .execute`);
    }
  }

  console.log(`Total commands loaded: ${client.commands.size}`);
}
