// src/types/discord.d.ts
import { Collection, SlashCommandBuilder, CommandInteraction, Client as BaseClient } from "discord.js";

type CommandModule = {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<unknown>;
};

declare module "discord.js" {
  interface Client {
    commands: Collection<string, CommandModule>;
  }
}
