import {
  Client,
  Events,
  GatewayIntentBits,
  CommandInteraction,
  Collection,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import dotenv from "dotenv";

import { loadCommandsFrom, CommandModule } from "./utils/commandLoader";
import handleButton from "./events/interactionbutton";
import { getModels, GuildDB } from "./database/guildDatabaseManager";
import { registerCommands } from "./deployCommands";
import { buildSetupModal } from "./utils/buildSetupModal";
import { addCfgField } from "./utils/config";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection<string, CommandModule>();
loadCommandsFrom(client, __dirname + "/commands");

client.once(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user!.tag}!`);

  const guilds = await client.guilds.fetch();
  for (const [id] of guilds) {
    try {
      await GuildDB.initDatabase(id);
      console.log(`🗄️ DB ready for guild ${id}`);
      await registerCommands(id);
    } catch (e) {
      console.error(`DB init failed for guild ${id}:`, e);
    }
  }
  console.log("✅ Database connection established.");
});

client.on(Events.GuildCreate, async (guild) => {
  try {
    await GuildDB.initDatabase(guild.id);
    console.log(`🆕 Joined guild ${guild.id} — DB created & synced`);
    await registerCommands(guild.id);
  } catch (e) {
    console.error(`DB init failed for new guild ${guild.id}:`, e);
  }
});

client.on(Events.GuildDelete, async (guild) => {
  await GuildDB.dispose(guild.id);
  console.log(`👋 Left guild ${guild.id} — DB connection closed`);
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
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith("retrySetup:")) {
    const key = interaction.customId.slice("retrySetup:".length);

    const cached = retryCache.get(key);
    if (!cached) {
      await interaction.reply({ content: "❌ Nothing to retry.", flags: MessageFlags.Ephemeral });
      return;
    }
    const modal = buildSetupModal(cached.channelId, cached.values);
    await interaction.showModal(modal);
    return;
  }

  await handleButton(interaction.guild!, interaction);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isAutocomplete()) return;
  if (interaction.commandName !== "warn-list") return;

  const { Infractions } = getModels(interaction.guild!.id);
  const focusedValue = interaction.options.getFocused();

  try {
    const all = (await Infractions.findAll({
      attributes: ["userID"],
      group: ["userID"],
      raw: true,
      limit: 25,
    })) as { userID: string }[];

    const ids = all.map((row) => row.userID);
    const members = await interaction.guild!.members.fetch({ user: ids });

    const filtered = members
      .filter((member) =>
        member.user.username.toLowerCase().startsWith(focusedValue.toLowerCase())
      )
      .map((member) => ({
        name: `${member.user.username}`,
        value: member.id,
      }));

    await interaction.respond(filtered.slice(0, 25));
  } catch (err) {
    console.error("❌ Autocomplete error:", err);
  }
});

// Channel select -> show modal
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChannelSelectMenu()) return;
  if (interaction.customId !== "modChannel") return;

  const selectedChannelId = interaction.values[0];
  const modal = buildSetupModal(selectedChannelId);
  await addCfgField(interaction.guild!.id, "modChannelId", selectedChannelId)
  await interaction.showModal(modal);
});

// Modal submit -> validate; on invalid, reply with a retry button that reopens modal
const retryCache = new Map<
  string,
  { channelId: string; values: { numWarns?: string; hexCode?: string } }
>();

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (!interaction.customId.startsWith("myModal:")) return;

  const channelId = interaction.customId.split(":")[1];
  const numWarns = interaction.fields.getTextInputValue("numWarns")?.trim();
  const hexCode = interaction.fields.getTextInputValue("hexCode")?.trim();

  const makeRetryRow = (key: string) =>
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`retrySetup:${key}`)
        .setLabel("Fix inputs")
        .setStyle(ButtonStyle.Primary)
    );

  if (!/^\d+$/.test(numWarns)) {
    const key = `${interaction.guildId}:${interaction.user.id}`;
    retryCache.set(key, { channelId, values: { numWarns, hexCode } });
    await interaction.reply({
      content: "❌ `numWarns` must be a whole number.",
      components: [makeRetryRow(key)],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (!/^#?[0-9a-f]{6}$/i.test(hexCode)) {
    const key = `${interaction.guildId}:${interaction.user.id}`;
    retryCache.set(key, { channelId, values: { numWarns, hexCode } });
    await interaction.reply({
      content: "❌ Invalid hex color. Use 6 hex digits (e.g. #BADA55).",
      components: [makeRetryRow(key)],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const normalizedHex = hexCode!.startsWith("#") ? hexCode : `#${hexCode}`;
  await interaction.reply({
    content: `✅ Saved. Channel: <#${channelId}>, warns: ${numWarns}, color: ${normalizedHex}`,
    flags: MessageFlags.Ephemeral,
  });

  await addCfgField(interaction.guild!.id, "numWarns", numWarns)
  await addCfgField(interaction.guild!.id, "hexCode", normalizedHex)
});


client.login(process.env.DISCORD_TOKEN!);