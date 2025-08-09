import { Guild } from "discord.js";
import { getModels } from "../database/guildDatabaseManager";

/**
 * Deletes an infraction and its associated Warn or Mute record.
 * @param infractionId The ID of the Infraction to delete.
 */
export const removeInfraction = async (guild: Guild, infractionId: number) => {
  try {
    const { Infractions, Mutes, Warns } = getModels(guild.id)

    const infraction = await Infractions.findOne({ where: { id: infractionId } });

    if (!infraction) {
      console.warn(`No infraction found with ID ${infractionId}.`);
      return;
    }

    switch (infraction.type) {
      case "warn":
        await Warns.destroy({ where: { id: infraction.infractionID } });
        break;
      case "mute":
        await Mutes.destroy({ where: { id: infraction.infractionID } });
        break;
      default:
        console.warn(`Unexpected infraction type: ${infraction.type}`);
        break;
    }

    await Infractions.destroy({ where: { id: infractionId } });

    console.log(`Deleted infraction #${infractionId} and its ${infraction.type} record.`);
  } catch (error) {
    console.error(`Failed to delete infraction #${infractionId}:`, error);
  }
};
