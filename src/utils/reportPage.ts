import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { Infractions, Mutes, Warns } from "../database";
import { getUserCache } from "./getUserCache";

type Report = {
    userID: string,
    modID: string,
    reason: string,
    type: string,
    createdAt: string
}

export const buildReportPage = async (page: number, selectedIndex: number) => {
    const infractionIndex = page + selectedIndex + 1; // discord counts from 0 and SQLite from 1

    const userInfo = await Infractions.findOne({where: {id: infractionIndex}})
    if(!userInfo) return;
    
    var userReport: Report[] = []
    
    if(userInfo.type === "warn"){
        const userInfoPlus = await Warns.findOne({where: {id: userInfo.infractionID}})
        
        if(!userInfoPlus) return;

        userReport.push({
          userID: userInfo.userID,
          modID: userInfo.modID,
          reason: userInfoPlus.reasons,
          type: "Warning",
          createdAt: userInfoPlus.createdAt,
        });

    } else if(userInfo.type === "mute"){
        const userInfoPlus = await Mutes.findOne({where: {id: userInfo.infractionID}})
        
        if(!userInfoPlus) return;
        
        userReport.push({
          userID: userInfo.userID,
          modID: userInfo.modID,
          reason: userInfoPlus.reasons,
          type: "Mute",
          createdAt: userInfoPlus.createdAt,
        });
    }
    
    const embed = new EmbedBuilder().setColor("#b7b402").setTitle("The Full Report")

    const report = userReport[0]
    embed.addFields({name: "User", value: `<@${report.userID}>`})
         .addFields({name: "Moderator", value: `<@${report.modID}>`})
         .addFields({name: "Reason", value: `${report.reason}`})
         .addFields({name: "Type", value: report.type})
         .addFields({name: "Created At", value: `<t:${report.createdAt}:f>`})

    const components = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId("goBack")
            .setLabel("Go Back")
            .setStyle(ButtonStyle.Secondary)
    )

    return {embed, components: [components]};
}