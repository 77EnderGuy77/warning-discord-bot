import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";

import { buildInfractionsPage } from "../utils/paginateInfractions";
import { buildUserPage } from "../utils/userInfraction";
import { sendTempEphemeral } from "../utils/tempEphem";
import { ensureGuildConfigExists } from "../utils/configExist";
import { getCfgField } from "../utils/config";

export default {
  data: new SlashCommandBuilder()
    .setName("warn-list")
    .setDescription("Shows warnings and mutes to people")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((opt) =>
      opt
        .setName('user')
        .setDescription("Select a user from Infractions")
        .setAutocomplete(true)
    ),

  async execute(interaction: any) {
    if (!interaction.guild) {
      return await sendTempEphemeral(interaction, "❌ This command can only be used in a server.", 10)
    }

    if (!ensureGuildConfigExists(interaction.guild!.id)) {
      return await sendTempEphemeral(interaction, "⚠️ Bot not configured yet. Please run `/setup` first.", 20)
    }

    const modChannelId = await getCfgField(interaction.guild!.id, "modChannelId")

    if (interaction.channelId !== modChannelId) {
      return await sendTempEphemeral(interaction,
        `❌ This command can only be used in <#${modChannelId}>.`,
        20)
    }

    try {
      const userId = interaction.options.getString("user");

      if (!userId) {
        const { embed, components } = await buildInfractionsPage(0, interaction.guild);
        await interaction.reply({
          embeds: [embed],
          components: components ?? [],
        });
      } else {
        const { embed } = await buildUserPage(interaction.guild, userId);
        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
      }

    } catch (error) {
      console.error(error);
      return sendTempEphemeral(interaction, `Error happened: ${error}`)
    }
  },
};
