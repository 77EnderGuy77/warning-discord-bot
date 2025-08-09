import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export function buildSetupModal(channelId: string, values?: { numWarns?: string; hexCode?: string }) {
  const modal = new ModalBuilder()
    .setCustomId(`myModal:${channelId}`)
    .setTitle("Setup the bot");

  const numWarns = new TextInputBuilder()
    .setCustomId("numWarns")
    .setLabel('Number of warnings before mute')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("e.g. 3")
    .setRequired(true);

  const hexCode = new TextInputBuilder()
    .setCustomId("hexCode")
    .setLabel("Embed hex color")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("#BADA55")
    .setRequired(true);

  if (values?.numWarns) numWarns.setValue(values.numWarns);
  if (values?.hexCode)  hexCode.setValue(values.hexCode);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(numWarns),
    new ActionRowBuilder<TextInputBuilder>().addComponents(hexCode),
  );
  return modal;
}
