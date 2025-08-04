import { sequelize } from "../database";
const { User } = sequelize.models;
import readline from "readline";

async function getUsers() {
  return await User.findAll();
}

async function main() {
  const users = await getUsers();
  const pageSize = 4;
  let offset = 0;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const showNext = () => {
    const chunk = users.slice(offset, offset + pageSize);
    if (chunk.length === 0) {
      console.log("⚡ No more users. Exiting.");
      rl.close();
      process.exit(0);
    }

    console.log(`\n📋 Users ${offset + 1}-${offset + chunk.length} of ${users.length}:`);
    chunk.forEach((u: any, i: number) => {
      // adjust this to whatever fields you want to print
      console.log(
        `${offset + i + 1}. id = ${u.get("id")}, warnTotal = ${u.get("warnTotal")}, muteTotal = ${u.get("muteTotal")}`
      );
    });
    offset += pageSize;
    console.log(`\nPress [Enter] to see next ${pageSize} users, or type "q" + [Enter] to quit.`);
  };

  rl.on("line", (input) => {
    if (input.trim().toLowerCase() === "q") {
      console.log("👋 Goodbye!");
      rl.close();
      process.exit(0);
    }
    showNext();
  });

  // kick it off
  showNext();
}

main().catch((err) => {
  console.error("Error in pagination:", err);
  process.exit(1);
});
