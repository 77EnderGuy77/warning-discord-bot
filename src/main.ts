import {
  Client,
  Events,
  GatewayIntentBits,
  CommandInteraction,
  Collection,
  MessageFlags,
} from "discord.js";
import { loadCommandsFrom, CommandModule } from "./utils/commandLoader";
import dotenv from "dotenv";
import { sequelize } from "./database";
import { registerCommands } from "./deploy-commands";
import handleButton from "./events/interactionbutton";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Extend the Client interface to include commands
client.commands = new Collection<string, CommandModule>();

// Load commands from the specified directory
loadCommandsFrom(client, __dirname + "/commands");

client.once(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user!.tag}!`);

  await sequelize.authenticate();
  console.log("✅ Database connection established.");
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction as CommandInteraction);
  } catch (err) {
    console.error(`Error executing ${interaction.commandName}:`, err);
    await interaction.reply({
      content: "❌ There was an error while executing this command.",
      flags: MessageFlags.Ephemeral,
    });
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()){
    await handleButton(interaction)
  }
});

client.login(process.env.DISCORD_TOKEN!);
