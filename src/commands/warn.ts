import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} from "discord.js";
import { getModels } from "../database/guildDatabaseManager";
import { getCfgField } from "../utils/config";
import { editTempEphemeral, sendTempEphemeral } from "../utils/tempEphem";
import { ensureGuildConfigExists } from "../utils/configExist";

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
      return await sendTempEphemeral(interaction, "❌ This command can only be used in a server.", 10);
    }

    if(!ensureGuildConfigExists(interaction.guild!.id)){
      return await sendTempEphemeral(interaction, "⚠️ Bot not configured yet. Please run `/setup` first.", 20)
    }

    try {
      const { Infractions, Warns, Mutes } = getModels(interaction.guild.id)

      const rawNumWarn = await getCfgField(interaction.guild!.id, "numWarns")

      var numWarn: number
      if (typeof rawNumWarn == "number") {
        numWarn = rawNumWarn
      } else {
        numWarn = (rawNumWarn as unknown) as number
      }

      const user = interaction.options.getUser("user")!;
      const mod = interaction.user;
      const date = Math.floor(Date.now() / 1000);
      const reason = interaction.options.getString("reason")!;

      if (user.id === mod.id) {
        await sendTempEphemeral(interaction, "You can't warn yourself", 10)
        return;
      }

      const warnCount = await Infractions.findAndCountAll({
        where: { userID: user.id, type: "warn" },
      });

      if (warnCount.count < (numWarn - 1)) {
        const warn = await Warns.create({ reasons: reason, createdAt: date });

        await Infractions.create({
          infractionID: warn.getDataValue("id"),
          userID: user.id,
          modID: mod.id,
          type: "warn",
        });

        if (interaction.replied && warnCount.count + 1 < 2) {
          await editTempEphemeral(interaction,
            `<@${user.id}> was warned for ${warnCount.count} time/s`);
        } else {
          await sendTempEphemeral(interaction,
            `<@${user.id}> was warned for ${warnCount.count + 1} time/s`,
            10)
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

        const modChatID = await getCfgField(interaction.guild!.id, "modChannelId");

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
            `<@${user.id}> has ${numWarn} warns. Now They need to be Muted. Total number of Mutes: ${muteCount.count}`
          );
        } else {
          console.warn(
            `Mod-log channel ${modChatID} not found or not text-based`
          );
        }

        if (!interaction.replied) {
          await sendTempEphemeral(interaction,
            `<@${user.id}> has reached 3 warnings and has been muted. Total mutes: ${muteCount.count}`,
            10)
        }

        console.log(`${user.displayName} needs to be muted by ${mod.displayName}`)
      }
    } catch (error) {
      console.error(error);
      if (interaction.replied) {
        await editTempEphemeral(interaction, `⚠️ DB error: ${error}`)
      } else {
        await sendTempEphemeral(interaction, `⚠️ DB error: ${error}`, 10)
      }
    }
  },
};
