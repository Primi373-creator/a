require("dotenv").config();
let gg = process.env.SUDO;
global.owner = gg.split(",");
global.author = process.env.AUTHOR || "By: Cipher";
global.packname = process.env.PACKNAME || `SHADOW-MD`;
global.openAiAPI = process.env.OPENAI_API || ""; //Put your openai API key here
module.exports = {
  gurl: process.env.GURL || "", //your group invite link
  mongodb: process.env.MONGODB_URL || "",
  SESSION_ID: process.env.SESSION_ID || "",
  AUTO_VIEW_STATUS: process.env.AUTO_VIEW_STATUS || "true",
  AUTOBIO: process.env.AUTOBIO || "",
  readmessage:  process.env.READ_MESSAGE || "",
  author: global.author,
  packname: global.packname,
  disablepm:  process.env.DISABLE_PM || "",
  antilink:  process.env.ANTILINK_VALUES || "https://",
  ALIVE_MESSAGE:  process.env.ALIVE_MESSAGE || "",
  alwaysonline: process.env.ALWAYS_ONLINE || "",
  WORKTYPE: process.env.WORKTYPE || "",
  TENORAPI: process.env.TENOR_API_KEY || "AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c",
  PORT: process.env.PORT || "9000",
  PREFIX: process.env.PREFIX || ".",
  ANTILINK_MSG: process.env.ANTILINK_MSG || '',
};
