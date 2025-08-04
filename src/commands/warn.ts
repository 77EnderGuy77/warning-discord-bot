import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";

import { sequelize } from "../database";
const { Infractions, Warns, Mutes } = sequelize.models;

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
    await sequelize.sync();

    if (!interaction.guild) {
      await interaction.reply({
        content: "❌ This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
        withResponse: true,
      });

      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch (err) {
          console.error("Failed to delete ephemeral reply:", err);
        }
      }, 10 * 1000);

      return;
    }

    try {
      const user = interaction.options.getUser("user")!;
      const mod = interaction.user;
      const date = Math.floor(Date.now() / 1000);
      const reason = interaction.options.getString("reason")!;

      if (user.id === mod.id) {
        await interaction.reply({
          content: "❌ You cannot warn yourself.",
          flags: MessageFlags.Ephemeral,
          fetchReply: true,
        });

        setTimeout(async () => {
          try {
            await interaction.deleteReply();
          } catch (err) {
            console.error("Failed to delete ephemeral reply:", err);
          }
        }, 10 * 1000);

        return;
      }

      const warnCount = await Infractions.findAndCountAll({
        where: { userID: user.id, type: "warn" },
      });

      if (warnCount.count < 2) {
        const warn = await Warns.create({ reasons: reason, createdAt: date });

        await Infractions.create({
          infractionID: warn.getDataValue("id"),
          userID: user.id,
          modID: mod.id,
          type: "warn",
        });

        if (interaction.replied && warnCount.count + 1 < 2) {
          await interaction.editReply(
            `<@${user.id}> was muted for ${warnCount.count} time/s`
          );

          setTimeout(async () => {
            try {
              await interaction.deleteReply();
            } catch (err) {
              console.error("Failed to delete ephemeral reply:", err);
            }
          }, 60 * 1000);
        } else {
          await interaction.reply({
            content: `<@${user.id}> was muted for ${
              warnCount.count + 1
            }  time/s`,
            flags: MessageFlags.Ephemeral,
            withResponse: true,
          });

          setTimeout(async () => {
            try {
              await interaction.deleteReply();
            } catch (err) {
              console.error("Failed to delete ephemeral reply:", err);
            }
          }, 10 * 1000);
        }
        
        console.log(`${user.displayName} was warnned by ${mod.displayName}`)
      } else {
        const warnInfractions = await Infractions.findAll({
          where: { userID: user.id, type: "warn" },
          attributes: ["infractionID"],
        });

        const warnIds = warnInfractions.map((inf: any) => inf.infractionID);

        const warns = await Warns.findAll({
          where: { id: warnIds },
          attributes: ["reasons"],
        });

        const reasons = [
          ...warns.map((warn: any) => warn.reasons),
          reason,
        ].join(" | ");

        const mute = await Mutes.create({ reasons, createdAt: date });

        await Infractions.create({
          infractionID: mute.getDataValue("id"),
          userID: user.id,
          modID: mod.id,
          type: "mute",
        });

        const muteCount = await Infractions.findAndCountAll({
          where: { userID: user.id, type: "mute" },
        });

        const modChatID = "1309290018707341414";

        const channel = interaction.client.channels.cache.get(modChatID);

        const warnRows = await Infractions.findAll({
          where: { userID: user.id, type: "warn" },
          attributes: ["infractionID"],
        });
        const warningIds = warnRows.map((r: any) => r.infractionID);

        await Warns.destroy({
          where: { id: warningIds },
          force: true,
        });

        if (channel?.isTextBased()) {
          channel.send(
            `<@${user.id}> has 3 warns. Now They need to be Muted. Total number of Mutes: ${muteCount.count}`
          );
        } else {
          console.warn(
            `Mod-log channel ${modChatID} not found or not text-based`
          );
        }

        // send a *public* confirmation in the command channel
        if (!interaction.replied) {
          await interaction.reply({
            content: `<@${user.id}> has reached 3 warnings and has been muted. Total mutes: ${muteCount.count}`,
            flags: MessageFlags.Ephemeral, // ← omit ephemeral flag so it’s visible
          });
        }
        
        console.log(`${user.displayName} needs to be muted by ${mod.displayName}`)
      }
    } catch (error: any) {
      console.error(error);
      if (interaction.replied) {
        await interaction.editReply(`⚠️ DB error: ${error}`);
      } else {
        await interaction.reply({
          content: `⚠️ DB error: ${error}`,
          flags: MessageFlags.Ephemeral,
          withResponse: true,
        });

        setTimeout(async () => {
          try {
            await interaction.deleteReply();
          } catch (err) {
            console.error("Failed to delete ephemeral reply:", err);
          }
        }, 10 * 1000);
      }
    }
  },
};
