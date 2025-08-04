import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";

import { buildInfractionsPage } from "../utils/paginateInfractions";

export default {
  data: new SlashCommandBuilder()
    .setName("warn-list")
    .setDescription("Shows warnings and mutes to people")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("Show the user's warns/mutes")
    ),

  async execute(interaction: any) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "❌ This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const optionUser = interaction.options.getUser("user");

      if (!optionUser) {
        const { embed, components } = await buildInfractionsPage(0, interaction.guild);
        await interaction.reply({
          embeds: [embed],
          components: components ?? [],
        });
      } else {
        const { embed } = await buildInfractionsPage(
          0,
          interaction.guild,
          optionUser.id
        );
        await interaction.reply({
          embeds: [embed],
        });
      }
    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: `⚠️ Error: ${err}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
