import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export async function addCfgField(
    guildId: string,
    fieldName: string,
    fieldData: string | number
): Promise<void> {
    try {
        const dirPath = path.join(__dirname, `../../data/${guildId}`);
        const filePath = path.join(dirPath, "config.yml");

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        let config: Record<string, any> = {};
        if (fs.existsSync(filePath)) {
            const fileContents = fs.readFileSync(filePath, "utf8");
            config = yaml.load(fileContents) as Record<string, any> || {};
        }

        config[fieldName] = fieldData;

        fs.writeFileSync(filePath, yaml.dump(config), "utf8");

    } catch (error) {
        console.error("❌ Error writing YAML config:", error);
    }
}

export async function getCfgField(guildId: string, fieldName: string): Promise<string | undefined> {
    try {
        const filePath = path.join(__dirname, `../../data/${guildId}/config.yml`);

        if (!fs.existsSync(filePath)) {
            console.warn(`Config file for guild ${guildId} does not exist.`);
            return undefined;
        }

        const fileContent = fs.readFileSync(filePath, "utf8");
        const config = yaml.load(fileContent) as Record<string, any>;

        return config[fieldName];
    } catch (error) {
        console.error("Error reading config field:", error);
        return undefined;
    }
}