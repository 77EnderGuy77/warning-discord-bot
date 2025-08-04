import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const token    = process.env.DISCORD_TOKEN!;
const clientId = process.env.CLIENT_ID!;

if (!token) {
  throw new Error('⚠️ BOT_TOKEN is not set. Add it to your .env');
}
if (!clientId) {
  throw new Error('⚠️ CLIENT_ID is not set. Add it to your .env');
}

const guildId  = process.env.GUILD_ID!;

const rest = new REST({ version: '10' }).setToken(token);

async function deleteSlashCommand(commandName: string) {
  // 1) Fetch existing commands
  const commands = guildId
    ? await rest.get(Routes.applicationGuildCommands(clientId, guildId))
    : await rest.get(Routes.applicationCommands(clientId));

  const list = commands as Array<{ id: string; name: string }>;
  const cmd  = list.find(c => c.name === commandName);

  if (!cmd) {
    console.log(`❌ Command "${commandName}" not found.`);
    return;
  }

  // 2) Delete it
  const route = guildId
    ? Routes.applicationGuildCommand(clientId, guildId, cmd.id)
    : Routes.applicationCommand(clientId, cmd.id);

  await rest.delete(route);
  console.log(`✅ Deleted slash-command "${commandName}" (ID ${cmd.id}).`);
}

// Usage: change 'warn' to whatever command you want to delete
deleteSlashCommand('warn').catch(console.error);
