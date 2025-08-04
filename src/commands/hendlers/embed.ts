import { EmbedBuilder, Guild } from "discord.js";
import { Infractions } from "../../database";
import { getUserCache } from "../../utils/getUserCache";
import { capitalizeFirst } from "../../utils/text";

export const showUserInfo = async (
  pageSize: number,
  offset: number,
  guild: Guild,
  selectedIndex: number
): Promise<EmbedBuilder> => {
  const embed = new EmbedBuilder()
    .setColor("#b7b402")
    .setTitle("Users Infractions");

  const result = await Infractions.findAndCountAll({
    limit: pageSize,
    offset: offset * pageSize,
    order: [["id", "ASC"]],
  });

  const rows = result.rows;

  rows.forEach((infraction, idx) => {
    const isSelected = idx === selectedIndex;
    const prefix = isSelected ? ":arrow_right: " : "";
  
    const displayName = `${prefix}<@${infraction.userID}>`;
    const moderatorName = `<@${infraction.modID}>`;
  
    embed.addFields(
      { name: "User", value: displayName, inline: true },
      { name: "Moderator", value: moderatorName, inline: true },
      { name: "Type", value: capitalizeFirst(infraction.type), inline: true }
    );
  });

  return embed;
};
