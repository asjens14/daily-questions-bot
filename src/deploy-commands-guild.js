import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

dotenv.config();

const commands = [];
const foldersPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "commands",
);
const commandFolders = fs.readdirSync(foldersPath);

// List of command names to deploy (match the 'name' property in each command)
const commandsToDeploy = ["yourcommand1", "yourcommand2", "anothercommand"];

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = (await import(pathToFileURL(filePath).href)).default;
    if (
      "data" in command &&
      "execute" in command &&
      commandsToDeploy.includes(command.data.name)
    ) {
      commands.push(command.data.toJSON());
    } else if ("data" in command && "execute" in command) {
      console.log(
        `[INFO] Skipping command ${command.data.name} (not in deploy list)`,
      );
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

// Deploy commands to a specific guild
const rest = new REST().setToken(process.env.BOT_TOKEN);
const guildId = process.env.DEPLOY_GUILD_ID; // Set this in your .env file
const clientId = process.env.APPLICATION_ID;

(async () => {
  try {
    console.log(
      `Started refreshing application (/) commands for guild ${guildId}.`,
    );

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });

    console.log(
      `Successfully reloaded application (/) commands for guild ${guildId}.`,
    );
  } catch (error) {
    console.error(error);
  }
})();
