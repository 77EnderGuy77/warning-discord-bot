import { ColorResolvable, EmbedBuilder, Guild } from "discord.js";
import { getModels } from "../../database/guildDatabaseManager";
import { capitalizeFirst } from "../../utils/text";
import { getCfgField } from "../../utils/config";

export const showUserInfo = async (
  pageSize: number,
  offset: number,
  guild: Guild,
  selectedIndex: number
): Promise<EmbedBuilder> => {
  const { Infractions } = getModels(guild.id)

  const result = await Infractions.findAndCountAll({
    limit: pageSize,
    offset: offset * pageSize,
    order: [["id", "ASC"]],
  });

  const rows = result.rows;

  const numPage = Math.floor(result.count / pageSize);

  var hex = (await getCfgField(guild.id, "hexCode")) as string;

  if(typeof hex === undefined){
    hex = "#515ddf"
  }

  const embed = new EmbedBuilder()
    .setColor(hex as ColorResolvable)
    .setTitle(`Users Infractions (Page: ${offset + 1}/${numPage + 1})`);

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
