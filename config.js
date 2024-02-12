require("dotenv").config();
let gg = process.env.MODS;
if (!gg) { gg = "2349049640547"; }  // You can replace this number with yours //
global.author = process.env.AUTHOR || "By: Cipher";
global.packname = process.env.PACKNAME || `SHADOW-MD`;
global.openAiAPI = process.env.OPENAI_API || ""; //Put your openai API key here
module.exports = {
  gurl: process.env.GURL || "", //your group invite link
  mongodb: process.env.MONGODB_URL || "mongodb+srv://pobasuyi69:9UW3Yra6HZFUCT0B@cluster0.lum7yrw.mongodb.net/?retryWrites=true&w=majority",
  SESSION_ID: process.env.SESSION_ID || "",
  AUTO_VIEW_STATUS: process.env.AUTO_VIEW_STATUS || "true",
  AUTOBIO: process.env.AUTOBIO || "",
  readmessage:  process.env.READ_MESSAGE || "",
  author: global.author,
  packname: global.packname,
  disablepm:  process.env.DISABLE_PM || "",
  antilink:  process.env.ANTILINK_VALUE || "https://", //currently supports only one value
  ALIVE_MESSAGE:  process.env.ALIVE_MESSAGE || "",
  welcomemsg:  process.env.WELCOME_MSG || "",
  goodbyemsg:  process.env.GOODBYE_MSG || "",
  alwaysonline: process.env.ALWAYS_ONLINE || "",
  WORKTYPE: process.env.WORKTYPE || "",
  TENORAPI: process.env.TENOR_API_KEY || "AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c",
  PORT: process.env.PORT || "9000",
  PREFIX: process.env.PREFIX || ".",
  logmsg: process.env.LOGMSG || "true",
  antilinkmsg: process.env.ANTILINK_MSG || '',
};
