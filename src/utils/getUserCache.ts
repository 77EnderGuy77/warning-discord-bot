import { Guild } from "discord.js";
import { Infractions } from "../database";

/**
 * Tries to resolve a user mention or fallback text from guild cache or fetch.
 * @param infraction Optional infraction containing a userID
 * @param userId Optional direct userID
 * @param guild Discord guild context
 * @returns A mention string if the user is in guild, otherwise plain ID with note
 */
export const getUserCache = async (
  infraction: Infractions | undefined,
  userId: string | undefined,
  guild: Guild
): Promise<string> => {
  const userID = userId ?? infraction?.userID;

  if (!userID) return "Unknown user";

  // Try cache first
  let member = guild.members.cache.get(userID);

  // Fallback to fetch
  if (!member) {
    try {
      member = await guild.members.fetch(userID);
    } catch (err) {
      console.warn(`Could not fetch member ${userID} (probably left)`);
    }
  }

  return member ? `<@${userID}>` : `${userID} (left server)`;
};
