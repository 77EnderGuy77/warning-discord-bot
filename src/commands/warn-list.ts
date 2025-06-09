import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

import { sequelize } from "../database";
const { Warning, User, Mute } = sequelize.models;

export default {
  data: new SlashCommandBuilder()
    .setName("warn-list")
    .setDescription("Shows warnings and mutes to people")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("Show the user's warns/mutes")
    ),

  async execute(interaction: any) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "❌ This command can only be used in a server.",
        ephemeral: true, // you can use ephemeral: true instead of flags
      });
    }

    // build your button
    const button = new ButtonBuilder()
      .setLabel("Test")
      .setCustomId("test")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    const baseEmbed = new EmbedBuilder()
      .setTitle("Problem List")
      .setColor("#8bb2bc");


    const infoRow = [
      {name: ``, value: ``},
      {name: ``, value: ``},
      {name: ``, value: ``}
    ]


    try {
      const user = interaction.options.getUser("user");

      if (!user) {
        // await interaction.reply({
        //   embeds: [baseEmbed],
        //   components: [row],
        // });

        // const filter = (i: any) =>
        //   i.customId === "test" && i.user.id === interaction.user.id;
        // const collector =
        //   interaction.channel.createMessageComponentCollector({
        //     filter,
        //     time: 15_000,
        //     max: 1,
        //   });

        // collector.on("collect", async (i: any) => {
        //   await i.reply({ content: "Button was clicked!" });
        // });

        return;
      } else {
        console.log(`showing list of ${user.username}`);
        return;
      }
    } catch (error) {
      console.error(error);
      const replyFn = interaction.replied ? interaction.followUp : interaction.reply;
      await replyFn.call(interaction, {
        content: `⚠️ Error: ${error}`,
        ephemeral: true,
      });
    }
  },
};
