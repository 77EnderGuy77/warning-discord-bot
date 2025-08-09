// src/utils/ephemeral.ts
import {
  MessageFlags,
  type InteractionReplyOptions,
  type InteractionEditReplyOptions,
  type RepliableInteraction,
} from "discord.js";

const timers = new Map<string, NodeJS.Timeout>();
const lifetimes = new Map<string, number>(); // remember last timeout per interaction

function keyOf(interaction: RepliableInteraction) {
  // use interaction.id; if you prefer per-user, use `${interaction.guildId}:${interaction.user.id}`
  return interaction.id;
}

function ensureEphemeral<T extends InteractionReplyOptions | InteractionEditReplyOptions>(
  options: string | T
): T {
  if (typeof options === "string") {
    return { content: options, flags: MessageFlags.Ephemeral } as T;
  }
  return { flags: MessageFlags.Ephemeral, ...options } as T;
}

function armTimer(interaction: RepliableInteraction, seconds: number) {
  const k = keyOf(interaction);
  if (timers.has(k)) clearTimeout(timers.get(k)!);

  const handle = setTimeout(async () => {
    try {
      await interaction.deleteReply();
    } catch {
      // ignore if already gone
    } finally {
      timers.delete(k);
      lifetimes.delete(k);
    }
  }, Math.max(0, seconds) * 1000);

  timers.set(k, handle);
  lifetimes.set(k, seconds);
}

/**
 * Send an ephemeral reply that auto-deletes after `seconds`.
 */
export async function sendTempEphemeral(
  interaction: RepliableInteraction,
  options: string | InteractionReplyOptions,
  seconds = 10
) {
  await interaction.reply(ensureEphemeral<InteractionReplyOptions>(options));
  armTimer(interaction, seconds);
}

/**
 * Edit the ephemeral reply and reset the auto-delete timer.
 * If `seconds` is omitted, the previous lifetime is reused.
 */
export async function editTempEphemeral(
  interaction: RepliableInteraction,
  options: string | InteractionEditReplyOptions,
  seconds?: number
) {
  await interaction.editReply(ensureEphemeral<InteractionEditReplyOptions>(options));
  const s = seconds ?? lifetimes.get(keyOf(interaction)) ?? 10;
  armTimer(interaction, s);
}

/**
 * Cancel the auto-delete timer (keeps the ephemeral message until Discord expires it).
 */
export function cancelTempEphemeral(interaction: RepliableInteraction) {
  const k = keyOf(interaction);
  if (timers.has(k)) clearTimeout(timers.get(k)!);
  timers.delete(k);
  lifetimes.delete(k);
}
