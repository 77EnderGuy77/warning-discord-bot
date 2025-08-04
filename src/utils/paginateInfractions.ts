// src/utils/paginateInfractions.ts
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Guild,
} from "discord.js";
import { sequelize } from "../database";
import { showUserInfo } from "../commands/hendlers/embed";

const { Infractions } = sequelize.models;
const pageSize = 5;

/**
 * Build an embed and buttons for infractions.
 * @param page       - Current page (ignored if userID is provided)
 * @param guild      - Guild context
 * @param userID     - Optional Discord user ID; if provided, only this user's infractions are shown
 */
export async function buildInfractionsPage(
  page: number,
  guild: Guild,
  selectedIndex: number = 0,
  userID?: string
) {
  let result;

  if (userID) {
    // Filter infractions for a specific user (no pagination)
    result = await Infractions.findAndCountAll({
      where: { userID },
      order: [["id", "ASC"]],
    });
  } else {
    // Get all infractions with pagination
    result = await Infractions.findAndCountAll({
      limit: pageSize,
      offset: page * pageSize,
      order: [["id", "ASC"]],
    });
  }

  const totalPages = Math.max(1, Math.ceil(result.count / pageSize));

  // Build embed
  const embed = await showUserInfo(pageSize, page, guild, selectedIndex);

  // Build button row only if userID is NOT specified
  let components: ActionRowBuilder<ButtonBuilder>[] = [];

  if (!userID) {
    const prevDisabled = page <= 0;
    const nextDisabled = page >= totalPages - 1;

    const buttonRow1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`prevPage:${page - 1}`)
        .setLabel("Previous")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(prevDisabled),
      new ButtonBuilder()
        .setCustomId(`prevUser:${page}:${selectedIndex - 1}`)
        .setLabel("Up")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(selectedIndex == 0),
      new ButtonBuilder()
        .setCustomId(`nextPage:${page + 1}`)
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(nextDisabled)
    );

    const buttonRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`fullInfo:${page}:${selectedIndex}`)
        .setLabel("Full report")
        .setStyle(ButtonStyle.Success)
        .setDisabled(false),
      new ButtonBuilder()
        .setCustomId(`nextUser:${page}:${selectedIndex + 1}`)
        .setLabel("Down")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(selectedIndex == 4),
      new ButtonBuilder()
        .setCustomId(`deleteInfr:${page}:${selectedIndex}`)
        .setLabel("🗑 Infractions")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true)
    );

    components = [buttonRow1, buttonRow2];
  }

  return { embed, components };
}
