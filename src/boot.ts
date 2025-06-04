import { sequelize } from "./database";
const { User } = sequelize.models;

const userID = "1350814028116525136"; // note: must be a string, since id is DataTypes.STRING(19)

(async () => {
  // 1) If you stored warn_total on the User row:
  const user = await User.findOne({ where: { id: userID } });
  if (user) {
    console.log("Stored warn_total:", user.get("warn_total"));
  } else {
    console.log("User not found—no warns yet.");
  }

  // 2) Or, if you want to count actual Warning rows instead:
  const { Warning } = sequelize.models;
  const count = await Warning.count({ where: { user_id: userID } });
  console.log("Total Warning records for user:", count);
})();
