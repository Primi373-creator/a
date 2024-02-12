const fs = require("fs");
const Collections = require("./Collections");
const commands = new Collections();
const config = require("../config");
commands.prefix = config.PREFIX;;

 async function readcommands(){
    const cmdfile = fs
      .readdirSync("./plugins")
      .filter((file) => file.endsWith(".js"));
    for (const file of cmdfile) {
      const cmdfiles = require(`../plugins/${file}`);
      commands.set(cmdfiles.name, cmdfiles);
    }
  };

  module.exports = {readcommands, commands};
