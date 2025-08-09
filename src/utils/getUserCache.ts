import { Guild } from "discord.js";

type HasUserID = { userID: string };

export const getUserCache = async (
  infraction: HasUserID | undefined,
  userId: string | undefined,
  guild: Guild
): Promise<string> => {
  const userID = userId ?? infraction?.userID;
  if (!userID) return "Unknown user";

  let member = guild.members.cache.get(userID);
  if (!member) {
    try {
      member = await guild.members.fetch(userID);
    } catch {
      /* probably left */
    }
  }
  return member ? `<@${userID}>` : `${userID} (left server)`;
};
