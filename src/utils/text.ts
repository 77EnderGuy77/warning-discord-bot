/**
 * Capitalizes the first character of a string.
 * @param {string} text - Text to capitalize
 * @returns {string} The text with the first character capitalized
 */
export function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
