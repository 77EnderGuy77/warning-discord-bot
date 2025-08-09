import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
} from "discord.js";
import { sendTempEphemeral } from "../utils/tempEphem";

export default {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("This command is needed to setup the bot")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: any) {
    if (!interaction.guild) {
      return await sendTempEphemeral(interaction, `❌ This command can only be used in a server.`, 10)
    }

    try {
      const modChannelRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
        new ChannelSelectMenuBuilder()
          .setCustomId("modChannel")
          .setPlaceholder("Select a moderation channel")
          .setChannelTypes(ChannelType.GuildText)
          .setMinValues(1)
          .setMaxValues(1)
      );

      await interaction.reply({
        content: "📥 Select a channel for moderation logs:",
        components: [modChannelRow],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("❌ Setup failed:", error);
      return sendTempEphemeral(interaction, `❌ Failed to show select menu: ${error}`, 10)
    }
  },
};
