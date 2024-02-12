require("./config");
const config = require("./config")
const {
  default: shadowConnect,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadContentFromMessage,
  makeInMemoryStore,
  jidDecode,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const figlet = require("figlet");
const { join } = require("path");
const got = require("got");
const pino = require("pino");
const mongodb = config.mongodb
const path = require("path");
const FileType = require("file-type");
const { Boom } = require("@hapi/boom");
const { serialize, WAConnection } = require("./lib/whatsapp.js");
const { smsg, getBuffer, getSizeMedia } = require("./lib/Function2");
const welcomeLeft = require("./lib/Welcome.js");
const { readcommands, commands } = require("./lib/ReadCommands.js");
commands.prefix = config.prefix;
const mongoose = require("mongoose");
const { AUTO_VIEW_STATUS } = require("./config")
const qrcode = require("qrcode-terminal");
const {
  getPluginURLs,
} = require("./lib/MongoDB/MongoDb_Core.js");
const chalk = require("chalk");
const connect = require('./lib/server.js');
const PORT = config.PORT;
connect(PORT);
const store = makeInMemoryStore({
  logger: pino().child({
    level: "silent",
    stream: "store",
  }),
});


let QR_GENERATE = "invalid";
let status;
const startshadow = async () => {
  try {
    await mongoose.connect(mongodb).then(() => {
      console.log(
        chalk.greenBright("Establishing secure connection with MongoDB...\n"),
      );
    });
  } catch (err) {
    console.log(
      chalk.redBright(
        "Error connecting to MongoDB ! Please check MongoDB URL or try again after some minutes !\n",
      ),
    );
    console.log(err);
  }
    const {  state, saveCreds, saveState, clearState } =  await useMultiFileAuthState(`./lib/auth_info_baileys`)
  console.log(
    figlet.textSync("SHADOW", {
      font: "Standard",
      horizontalLayout: "default",
      vertivalLayout: "default",
      width: 70,
      whitespaceBreak: true,
    }),
  );
  console.log(`\n`);

  await installPlugin();

  const { version, isLatest } = await fetchLatestBaileysVersion();

  const shadow = shadowConnect({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    browser: ["SHADOW"],
    auth: state,
    version,
  });

  store.bind(shadow.ev);

  shadow.public = true;

  async function installPlugin() {
    console.log(chalk.yellow("Checking for plugins...\n"));
    let plugins = [];
    try {
      plugins = await getPluginURLs();
    } catch (err) {
      console.log(
        chalk.redBright(
          "Error connecting to MongoDB ! Please re-check MongoDB URL or try again after some minutes !\n",
        ),
      );
      console.log(err);
    }

    if (!plugins.length || plugins.length == 0) {
      console.log(
        chalk.redBright("No Extra plugins Installed ! Starting Shadow...\n"),
      );
    } else {
      console.log(
        chalk.greenBright(plugins.length + " plugins found ! Installing...\n"),
      );
      for (let i = 0; i < plugins.length; i++) {
        pluginUrl = plugins[i];
        var { body, statusCode } = await got(pluginUrl);
        if (statusCode == 200) {
          try {
            var folderName = "plugins";
            var fileName = path.basename(pluginUrl);

            var filePath = path.join(folderName, fileName);
            fs.writeFileSync(filePath, body);
          } catch (error) {
            console.log("Error:", error);
          }
        }
      }
      console.log(
        chalk.greenBright(
          "All plugins Installed Successfully ! Starting shadow...\n",
        ),
      );
    }
  }

  await readcommands();

  shadow.ev.on("creds.update", saveState);
  shadow.serializeM = (m) => smsg(shadow, m, store);
  shadow.ev.on("connection.update", async (update) => {
    const { lastDisconnect, connection, qr } = update;
    if (connection) {
      console.info(`{ SHADOW } Server Status => ${connection}`);
    }

    if (connection === "close") {
      let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      if (reason === DisconnectReason.badSession) {
        console.log(
          `{ SHADOW }  Bad Session File, Please Delete Session and Scan Again.\n`,
        );
        process.exit();
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log("{ SHADOW } Connection closed, reconnecting....\n");
        startshadow();
      } else if (reason === DisconnectReason.connectionLost) {
        console.log(
          "{ SHADOW } Connection Lost from Server, reconnecting...\n",
        );
        startshadow();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(
          "{ SHADOW } Connection Replaced, Another New Session Opened, Please Close Current Session First!\n",
        );
        process.exit();
      } else if (reason === DisconnectReason.loggedOut) {
        clearState();
        console.log(
          `{ SHADOW } Device Logged Out, Please Delete Session and Scan Again.\n`,
        );
        process.exit();
      } else if (reason === DisconnectReason.restartRequired) {
        console.log("{ SHADOW } Server Restarting...\n");
        startshadow();
      } else if (reason === DisconnectReason.timedOut) {
        console.log(
          "{ SHADOW } Connection Timed Out, Trying to Reconnect...\n",
        );
        startshadow();
      } else {
        console.log(
          `{ SHADOW } Server Disconnected: "It's either safe disconnect or WhatsApp Account got banned !\n"`,
        );
      }
    }
  });

  shadow.ev.on("group-participants.update", async (m) => {
    welcomeLeft(shadow, m);
  });

 shadow.ev.on("messages.upsert", async (chatUpdate) => {
 m = serialize(shadow, chatUpdate.messages[0]);
    if (!m.message) return;
    m.message = (Object.keys(m.message)[0] === 'ephemeralMessage') ? m.message.ephemeralMessage.message : m.message
      if (m.key && m.key.remoteJid === 'status@broadcast'){
      if (config.AUTO_VIEW_STATUS) {
     shadow.readMessages([m.key]) 
      }
      }
    if (m.key.id.startsWith("BAE5") && m.key.id.length == 16) return;

    require("./shadow.js")(shadow, m, commands, chatUpdate);
  });

  shadow.getName = (jid, withoutContact = false) => {
    id = shadow.decodeJid(jid);
    withoutContact = shadow.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us"))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {};
        if (!(v.name || v.subject)) v = shadow.groupMetadata(id) || {};
        resolve(
          v.name ||
            v.subject ||
            PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber(
              "international",
            ),
        );
      });
    else
      v =
        id === "0@s.whatsapp.net"
          ? {
              id,
              name: "WhatsApp",
            }
          : id === shadow.decodeJid(shadow.user.id)
            ? shadow.user
            : store.contacts[id] || {};
    return (
      (withoutContact ? "" : v.name) ||
      v.subject ||
      v.verifiedName ||
      PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber(
        "international",
      )
    );
  };

  shadow.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (
        (decode.user && decode.server && decode.user + "@" + decode.server) ||
        jid
      );
    } else return jid;
  };

  shadow.ev.on("contacts.update", (update) => {
    for (let contact of update) {
      let id = shadow.decodeJid(contact.id);
      if (store && store.contacts)
        store.contacts[id] = {
          id,
          name: contact.notify,
        };
    }
  });

  shadow.downloadAndSaveMediaMessage = async (
    message,
    filename,
    attachExtension = true,
  ) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype
      ? message.mtype.replace(/Message/gi, "")
      : mime.split("/")[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await FileType.fromBuffer(buffer);
    trueFileName = attachExtension ? filename + "." + type.ext : filename;
    // save to file
    await fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
  };

  shadow.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype
      ? message.mtype.replace(/Message/gi, "")
      : mime.split("/")[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    return buffer;
  };

  shadow.parseMention = async (text) => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
      (v) => v[1] + "@s.whatsapp.net",
    );
  };

  shadow.sendText = (jid, text, quoted = "", options) =>
    shadow.sendMessage(
      jid,
      {
        text: text,
        ...options,
      },
      {
        quoted,
      },
    );

  shadow.getFile = async (PATH, save) => {
    let res;
    let data = Buffer.isBuffer(PATH)
      ? PATH
      : /^data:.*?\/.*?;base64,/i.test(PATH)
        ? Buffer.from(PATH.split`,`[1], "base64")
        : /^https?:\/\//.test(PATH)
          ? await (res = await getBuffer(PATH))
          : fs.existsSync(PATH)
            ? ((filename = PATH), fs.readFileSync(PATH))
            : typeof PATH === "string"
              ? PATH
              : Buffer.alloc(0);

    let type = (await FileType.fromBuffer(data)) || {
      mime: "application/octet-stream",
      ext: ".bin",
    };
    filename = path.join(
      __filename,
      "../src/" + new Date() * 1 + "." + type.ext,
    );
    if (data && save) fs.promises.writeFile(filename, data);
    return {
      res,
      filename,
      size: await getSizeMedia(data),
      ...type,
      data,
    };
  };

  shadow.setStatus = (status) => {
    shadow.query({
      tag: "iq",
      attrs: {
        to: "@s.whatsapp.net",
        type: "set",
        xmlns: "status",
      },
      content: [
        {
          tag: "status",
          attrs: {},
          content: Buffer.from(status, "utf-8"),
        },
      ],
    });
    return status;
  };

  shadow.sendFile = async (jid, PATH, fileName, quoted = {}, options = {}) => {
    let types = await shadow.getFile(PATH, true);
    let { filename, size, ext, mime, data } = types;
    let type = "",
      mimetype = mime,
      pathFile = filename;
    if (options.asDocument) type = "document";
    if (options.asSticker || /webp/.test(mime)) {
      let { writeExif } = require("./lib/sticker.js");
      let media = {
        mimetype: mime,
        data,
      };
      pathFile = await writeExif(media, {
        packname: global.packname,
        author: global.packname,
        categories: options.categories ? options.categories : [],
      });
      await fs.promises.unlink(filename);
      type = "sticker";
      mimetype = "image/webp";
    } else if (/image/.test(mime)) type = "image";
    else if (/video/.test(mime)) type = "video";
    else if (/audio/.test(mime)) type = "audio";
    else type = "document";
    await shadow.sendMessage(
      jid,
      {
        [type]: {
          url: pathFile,
        },
        mimetype,
        fileName,
        ...options,
      },
      {
        quoted,
        ...options,
      },
    );
    return fs.promises.unlink(pathFile);
  };
};

startshadow();
