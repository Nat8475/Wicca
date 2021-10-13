const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");
const moment = require("moment");
require("moment-duration-format");
const { MessageAttachment } = require("discord.js");
const { loadImage, registerFont, createCanvas } = require("canvas");
registerFont("src/assets/fonts/Montserrat-Black.ttf", { family: "Montserrat" });
registerFont("src/assets/fonts/Segoe Print.ttf", { family: "Segoe Print" });
registerFont("src/assets/fonts/Segoe UI.ttf", { family: "Segoe UI" });
registerFont("src/assets/fonts/Segoe UI Black.ttf", {
  family: "Segoe UI Black",
});
const Utils = require("../../utils/Util");

module.exports = class Work extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "work";
    this.category = "Economy";
    this.description = "Comando para trabalhar";
    this.usage = "";
    this.aliases = ["trabalhar"];
    this.subCommands = ["info", "name"];
    this.reference = "Work";

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const subs =args[0] &&this.client.subcommands.get(this.reference).find((cmd) => cmd.name.toLowerCase() === args[0].toLowerCase() || cmd.aliases.includes(args[0].toLowerCase()));
    let subcmd;
    let sub;
    if (!subs) {sub = "null";this.client.subcommands.get(this.reference).find((cmd) => cmd.name.toLowerCase() === sub.toLowerCase() || cmd.aliases.includes(sub.toLowerCase()));
    } else subcmd = subs;

    if (subcmd != undefined) return subcmd.run({ message });

    if (!args[0]) {
      User.findOne({ idU: message.author.id }, async (err, user) => {
        let xp = Math.floor(Math.random() * 50) + 1;
        let work = user.work.cooldown;
        let cooldown = 2.88e7;
        let money = Math.ceil(user.work.level * 2 * user.work.coins + 200);
        let nextlevel = user.work.nextLevel * user.work.level;

        if (work !== null && cooldown - (Date.now() - work) > 0) {
          return message.reply(
            `${message.author}, você deve esperar **${moment
              .duration(cooldown - (Date.now() - work))
              .format("h [horas], m [minutos] e s [segundos]")
              .replace("minsutos", "minutos")}** até poder trabalhar novamente`
          );
        } else {
          if (user.work.exp + xp > nextlevel) {
            message.reply(
              `${
                message.author
              }, e parabéns sua empresa acaba de subir para o level **${
                user.work.level + 1
              }**.`
            );
            await User.findOneAndUpdate(
              { idU: message.author.id },
              {
                $set: {
                  "work.cooldown": Date.now(),
                  "work.exp": 0,
                  coins: user.coins + money,
                  "work.level": user.work.level + 1,
                },
              }
            );
          } else {
            message.reply(
              `${
                message.author
              }, você trabalhou com sucesso e obteve **${money.toLocaleString()} coins** e **${xp} de XP**.`
            );
            await User.findOneAndUpdate(
              { idU: message.author.id },
              {
                $set: {
                  "work.cooldown": Date.now(),
                  "work.exp":
                    user.work.exp + xp > nextlevel ? 0 : user.work.exp + xp,
                  coins: user.coins + money,
                },
              }
            );
          }
        }
      });
      return;
    }

    if (["name", "nome"].includes(args[0].toLowerCase())) {
      User.findOne({ idU: message.author.id }, async (err, user) => {
        const work = user.work;
        let name = args.slice(1).join(" ");
        if (!name) {
          return message.reply(
            `${message.author}, você deve escrever um nome para setar na sua empresa.`
          );
        } else if (name == work.name) {
          return message.reply(
            `${message.author}, o nome inserido é o mesmo setado atualmente, tenta novamente.`
          );
        } else if (name.length > 25) {
          return message.reply(
            `${message.author}, o nome inserido é muito grande, por favor diminua o tamanho e tente novamente.`
          );
        } else {
          message.reply(
            `${message.author}, o nome da sua empresa foi alterado com sucesso!`
          );
          await User.findOneAndUpdate(
            { idU: message.author.id },
            { $set: { "work.name": name } }
          );
        }
      });
      return;
    }
  }
};
