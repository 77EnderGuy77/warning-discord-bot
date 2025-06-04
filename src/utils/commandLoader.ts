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

  const files = fs.readdirSync(commandsFolder).filter((f) => f.endsWith(".js"));

  for (const file of files) {
    const fullPath = path.join(commandsFolder, file);
    const imported = require(fullPath);
    const command: CommandModule = imported.default ?? imported;

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
      console.log(`Loaded command module: ${command.data.name}`);
    } else {
      console.warn(`Skipping ${file}: missing .data or .execute`);
    }
  }
}
