import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";

import { sequelize } from "../database";
const { Warning, User, Mute } = sequelize.models;

export default {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Gives a warning to a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
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

      // ensure the user exists in the User table
      await User.findOrCreate({ where: { id: user.id } });

      // fetch existing warnings for this user
      const existingWarns = await Warning.findAll({
        where: { user_id: user.id },
      });

      if (existingWarns.length < 2) {
        // fewer than 2 existing warns → just add one more warning
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
          content: `✅ User ${user.username} has been warned by ${mod.username} at <t:${date}:F> for: ${reason}`,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        // this will be the 3rd warning → combine all reasons into a mute
        const allReasons = [
          ...existingWarns.map((w: { reason: string; }) => w.reason),
          reason,
        ].join(" | ");

        await Mute.create({
          user_id: user.id,
          mod_id: mod.id,
          reasons: allReasons,
          created_at: date,
        });

        // remove the 2 existing warnings
        await Warning.destroy({ where: { user_id: user.id } });

        // reset warn_total to 0 and increment mute_total by 1
        await User.update(
          { warn_total: 0 },
          { where: { id: user.id } }
        );
        await User.increment("mute_total", {
          by: 1,
          where: { id: user.id },
        });

        await interaction.reply({
          content: `🔇 User ${user.username} needs to been muted by ${mod.username} at <t:${date}:F>. Reasons: ${allReasons}`,
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (error: any) {
      console.error(error);
      if (interaction.replied) {
        await interaction.editReply(`⚠️ DB error: ${error}`);
      } else {
        await interaction.reply({
          content: `⚠️ DB error: ${error}`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
