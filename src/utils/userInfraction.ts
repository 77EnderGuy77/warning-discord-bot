import { Guild, EmbedBuilder, ColorResolvable } from "discord.js";
import { getModels } from "../database/guildDatabaseManager";
import { capitalizeFirst } from "./text";
import { getCfgField } from "./config";

export async function buildUserPage(
  guild: Guild,
  userID: string
): Promise<{ embed: EmbedBuilder }> {
  const { Infractions } = getModels(guild.id);

  const result = await Infractions.findAll({
    where: { userID },
    order: [["id", "ASC"]],
  });

  let hex = (await getCfgField(guild.id, "hexCode")) as string | undefined;
  if (!hex) {
    hex = "#515ddf";
  }

  const embed = new EmbedBuilder()
    .setColor(hex as ColorResolvable)
    .setTitle(`Infractions for <@${userID}>`);

  if (!result.length) {
    embed.setDescription("✅ No infractions found for this user.");
  } else {
    result.forEach((infraction) => {
      embed.addFields(
        { name: "Infraction ID", value: infraction.id.toString(), inline: true },
        { name: "Moderator", value: `<@${infraction.modID}>`, inline: true },
        { name: "Type", value: capitalizeFirst(infraction.type), inline: true }
      );
    });
  }

  return { embed };
}
