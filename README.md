# Warning Discord Bot

A Discord moderation bot built with TypeScript, [`discord.js`](https://discord.js.org/), and [`sequelize`](https://sequelize.org/). It tracks user warnings and mutes in a SQLite database, offering interactive moderation commands.

## Features

- **Warn users:** `/warn` issues a warning with a reason. After 3 warnings, mods will be notified to mute user and their warnings are bundled.
- **View infractions:** `/warn-list` displays all warnings and mutes, with user filtering (in works), interactive pagination, and detailed reports.
- **Interactive moderation:** Paginate infractions and view full reports using buttons.
- **Persistent storage:** Uses SQLite via Sequelize models: `Infractions`, `Warns`, and `Mutes`.
- **Easy deployment:** Slash command registration script.
- **Database seeding:** Generate fake users and infractions ([src/database/fakeUsers.ts](src/database/fakeUsers.ts)).
- **Command management:** Delete commands ([src/deleteOneCommand.ts](src/deleteOneCommand.ts)).

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   Copy `.env.example` to `.env` and set:
   - `DISCORD_TOKEN` – Bot token from Discord Developer Portal
   - `CLIENT_ID` – Application client ID
   - `GUILD_ID` – Guild ID for slash command registration

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Register slash commands**  
   Run after each build if commands change:
   ```bash
   npm run register
   ```

   Or use [build.bat](build.bat) to combine build and registration:
   ```cli
   ./build
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

## Development

- **Source:** [`src/`](src/)
- **Database:** SQLite file at [`data/database.sqlite`](data/database.sqlite)
- **Sequelize config:** [`src/database/index.ts`](src/database/index.ts)
- **Commands:** [`src/commands/`](src/commands/)
- **Interaction events:** [`src/events/interactionbutton.ts`](src/events/interactionbutton.ts)

## Plans
- [ ] Create a form to modify every changeable part of the database and bot's logging
- [ ] Optimize code for faster changes
- [ ] Add function annotations

## License

Licensed under the MIT License. See [LICENSE](LICENSE) for details.
