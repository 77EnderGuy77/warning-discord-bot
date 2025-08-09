import { removeInfraction } from "../commands/removeInfraction";
import { getModels } from "../database/guildDatabaseManager";
import { buildInfractionsPage } from "../utils/paginateInfractions";
import { buildReportPage } from "../utils/reportPage";
import { Guild } from 'discord.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { sendTempEphemeral } from "../utils/tempEphem";

const pageSize = 5;

export default async function handleButton(guild: Guild, interaction: any) {
  if (!interaction.isButton()) return;

  const { Infractions } = getModels(guild.id)

  const parts = interaction.customId.split(":");
  const action = parts[0];
  const page = parseInt(parts[1] ?? "0", 10);
  const selectedIndex = parseInt(parts[2] ?? "0", 10);

  if (action === "nextPage" || action === "prevPage") {
    const { embed, components } = await buildInfractionsPage(
      page,
      interaction.guild!
    );
    await interaction.update({ embeds: [embed], components });
  }

  if (action === "nextUser" || action === "prevUser") {
    const { embed, components } = await buildInfractionsPage(
      page,
      interaction.guild!,
      selectedIndex
    );
    await interaction.update({ embeds: [embed], components });
  }

  if (action === "fullInfo") {
    const result = await buildReportPage(guild, page, selectedIndex);
    if (!result) {
      return interaction.reply({
        content: "⚠️ Could not load the report. The infraction might be missing.",
        ephemeral: true,
      });
    }
    const { embed, components } = result;
    await interaction.update({ embeds: [embed], components });
  }

  if (action === "goBack") {
    const { embed, components } = await buildInfractionsPage(
      page,
      interaction.guild!
    );
    await interaction.update({ embeds: [embed], components });
  }

  if (action === "deleteInfr") {
    const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`confirmDelete:${page}:${selectedIndex}`)
        .setLabel("Yes, delete")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`cancelDelete:${page}:${selectedIndex}`)
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.update({
      content: "⚠️ Are you sure you want to delete this infraction?",
      embeds: [],
      components: [confirmRow],
    });
  }

  if (action === "cancelDelete") {
    const { embed, components } = await buildInfractionsPage(
      page,
      interaction.guild!,
      selectedIndex
    );
    await interaction.update({
      content: "❎ Deletion cancelled.",
      embeds: [embed],
      components,
    });
  }

  if (action === "confirmDelete") {
    const result = await Infractions.findAll({
      limit: 1,
      offset: page * pageSize + selectedIndex,
      order: [["id", "ASC"]],
    });

    const infraction = result[0];
    if (!infraction) {
      return sendTempEphemeral(interaction, `⚠️ Could not find the infraction to delete.`, 10)
    }

    await removeInfraction(guild, infraction.id);

    const { embed, components } = await buildInfractionsPage(
      page,
      interaction.guild!,
      Math.max(0, selectedIndex - 1)
    );

    await interaction.update({
      content: "✅ Infraction deleted.",
      embeds: [embed],
      components,
    });
  }
}
