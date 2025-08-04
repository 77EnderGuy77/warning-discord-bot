import { buildInfractionsPage } from "../utils/paginateInfractions";
import { buildReportPage } from "../utils/reportPage";

const pageSize = 5;

export default async function handleButton(interaction: any) {
  if (!interaction.isButton()) return;

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

  if(action === "nextUser" || action === "prevUser"){
    const { embed, components } = await buildInfractionsPage(
      page,
      interaction.guild!,
      selectedIndex
    );

    await interaction.update({ embeds: [embed], components });
  }

  if (action === "fullInfo") {
    const result = await buildReportPage(page, selectedIndex);

    if (!result) {
      return interaction.reply({
        content: "⚠️ Could not load the report. The infraction might be missing.",
        ephemeral: true
      });
    }

    const { embed, components } = result;

    await interaction.update({ embeds: [embed], components });
  }

  if (action === "goBack"){
    const { embed, components } = await buildInfractionsPage(
      page,
      interaction.guild!
    );

    await interaction.update({ embeds: [embed], components });
  }
}
