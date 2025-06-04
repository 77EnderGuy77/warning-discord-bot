import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";

import { sequelize } from "../database";
const { Warning, User, Mutes } = sequelize.models;

export default {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Gives a warning to a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) // Requires Ban Members permission
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to warn")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the warning (100 characters max)")
        .setMaxLength(100)
        .setRequired(true)
    ),

  async execute(interaction: any) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "❌ This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const user = interaction.options.getUser("user")!;
      const mod = interaction.user;
      const date = Math.floor(Date.now() / 1000);
      const reason = interaction.options.getString("reason")!;

      if (user.id === mod.id) {
        return interaction.reply({
          content: "❌ You cannot warn yourself.",
          flags: MessageFlags.Ephemeral,
        });
      }

      // Check if the user is already warned
      await User.findOrCreate({ where: { id: user.id } });

      await Warning.create({
        user_id: user.id,
        mod_id: mod.id,
        reason,
        created_at: date,
      });

      await User.increment("warn_total", {
        by: 1,
        where: { id: user.id },
      });

      await interaction.reply({
        content: `✅ User ${user.username} has been warned by ${mod.username} at <t:${date}> for: ${reason}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error: any) {
      if (interaction.replied) {
        await interaction.editReply(`⚠ DB error: ${error}`);
        console.error(error);
      } else {
        await interaction.reply({
          content: `⚠ DB error: ${error}`,
          flags: MessageFlags.Ephemeral,
        });
        console.error(error);
      }
    }
  },
};
