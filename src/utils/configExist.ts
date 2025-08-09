import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export const ensureGuildConfigExists = (guildId: string): boolean => {
  const configPath = path.join(__dirname, `../../data/${guildId}/config.yml`);
  if (!fs.existsSync(configPath)) return false;

  try {
    const fileContents = fs.readFileSync(configPath, "utf8");
    const config = yaml.load(fileContents) as Record<string, unknown>;
    return config && typeof config === "object" && Object.keys(config).length >= 3;
  } catch {
    return false;
  }
};
