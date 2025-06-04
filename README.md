# Warning Discord Bot

A simple Discord moderation bot written in TypeScript using [`discord.js`](https://discord.js.org/) and [`sequelize`](https://sequelize.org/). The bot provides a `/warn` command that allows moderators to keep track of user warnings in a SQLite database.

## Features

- `/warn` &ndash; give a user a warning with a reason (stored in the database).
- Persists data using SQLite via Sequelize models: `User`, `Warning` and `Mute`.
- Slash command registration script for easy deployment.

Commands such as `remove_warn` and `warn_list` are present in the codebase but are not yet implemented. Additional moderation commands may be added as the project evolves.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create an environment file**

   Copy `.env.example` to `.env` and fill in the required variables:

   - `DISCORD_TOKEN` – your bot token from the Discord Developer Portal.
   - `CLIENT_ID` – the application client ID.
   - `GUILD_ID` – the guild ID to register slash commands in.

3. **Build the project**

   ```bash
   npm run build
   ```

4. **Register slash commands** (run after every build when commands change)

   ```bash
   npm run register
   ```

5. **Start the bot**

   ```bash
   npm start
   ```

The compiled files will be placed in the `dist/` directory and the bot will connect to Discord using the token provided in your `.env` file.

## Development

The TypeScript source lives in the `src/` folder. Database files are created under `data/` (ignored by Git). You can adjust the Sequelize configuration in `src/database/index.ts` if you wish to use a different database.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
