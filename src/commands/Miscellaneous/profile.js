const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");
const { loadImage, registerFont, createCanvas } = require("canvas");
registerFont("src/assets/fonts/Montserrat-Black.ttf", { family: "Montserrat" });
registerFont("src/assets/fonts/Segoe Print.ttf", { family: "Segoe Print" });
registerFont("src/assets/fonts/Segoe UI.ttf", { family: "Segoe UI" });
registerFont("src/assets/fonts/Segoe UI Black.ttf", {
  family: "Segoe UI Black",
});
const Utils = require("../../utils/Util");
const Emojis = require("../../utils/Emojis");
const moment = require("moment")
const { MessageAttachment, Util } = require("discord.js");

module.exports = class Profile extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "profile";
    this.category = "Miscellaneous";
    this.description = "Veja seu perfil com este comando";
    this.usage = "profile <@user>";
    this.aliases = ["perfil", "p"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const USER =
      this.client.users.cache.get(args[0]) ||
      message.mentions.users.first() ||
      message.author;

      const user = await this.client.database.users.findOne({ idU: USER.id });
      const canvas = createCanvas(900, 600);
      const ctx = canvas.getContext("2d");
      let nextLevel = user.Exp.nextLevel * user.Exp.level;
  
      //========================// Import Avatar //========================//
  
      const avatar = await loadImage(
        USER.displayAvatarURL({ format: "jpeg", size: 2048 })
      );
      ctx.drawImage(avatar, 20, 90, 195, 180);
  
      //========================// Import Background //========================//
  
      const bg = user.backgrounds.active;
  
      const backgrounds = {
        one: {
          id: 1,
          background: "./src/assets/img/png/Profile_Card_Green.png",
        },
        two: {
          id: 2,
          background: "./src/assets/img/png/Profile_Card_Purple.png",
        },
        three: {
          id: 3,
          background: "./src/assets/img/png/Profile_Card_Different.png",
        },
      };
  
      let back_img = "";
      if (bg === 0) back_img = "./src/assets/img/png/Profile_Card.png";
      else {
        back_img = Object.entries(backgrounds).find(([, x]) => x.id === bg)[1]
          .background;
      }
  
      const back = await loadImage(back_img);
      ctx.drawImage(back, 0, 0, 900, 600);
      //========================// Texts //========================//
  
      // Username
  
      ctx.textAlign = "left";
      ctx.font = '50px "Segoe UI Black"';
      ctx.fillStyle = "rgb(253, 255, 252)";
      await Utils.renderEmoji(ctx, this.shorten(USER.username, 20), 230, 190);
  
      // Badges
  
      let list = [];
  
      
      const flags = USER.flags === null ? "" : USER.flags.toArray()
      list.push(flags)
  
      if (user.vip.hasVip) list.push("VIP");
      if(user.staff) list.push("STAFF")
      if(user.marry.has) list.push("CASADO")
      if(user.devs) list.push("DEVS")
  
      list = list
        .join(",")
      .replace("HOUSE_BRAVERY", Emojis.Bravery)
      .replace("HOUSE_BRILLIANCE", Emojis.Brilliance)
      .replace("HOUSE_BALANCE", Emojis.Balance)
      .replace("VERIFIED_BOT", Emojis.Verified_Bot)
      .replace("VIP", Emojis.Vip)
      .replace("STAFF", Emojis.Staff)
      .replace("CASADO", Emojis.Anel)
      .replace("DEVS", Emojis.Devs)
  
      ctx.font = `30px "Segoe Print"`;
  
      await Utils.renderEmoji(ctx, list.split(",").join(" "), 230, 240);
  
      // Titles
  
      
      /*ctx.textAlign = "left";
      ctx.font = '30px "Segoe UI Black"';
      ctx.fillStyle = "rgb(253, 255, 252)";
      ctx.fillText("Coins", 190, 90);
      ctx.fillText("XP", 190, 155);*/
      ctx.textAlign = "center";
      ctx.font = '15px "Segoe UI Black"';
      if (user.marry.has) {
        ctx.fillText("Casado com o(a)", 80, 550);
        ctx.fillText(
          await this.client.users.fetch(user.marry.user).then((x) => x.tag),
          65,
          570
        );
      }
  
      ctx.textAlign = "center";
      ctx.font = '15px "Segoe UI Black"';
      if (user.vip.hasVip) {
        ctx.fillText("Vip", 300, 550);
        ctx.fillText(`${moment
          .duration(user.vip.date - Date.now())
          .format("y [A] M [M] d [D] h [H] m [m] e s [s]")}`, 300, 570);
      }
      
      ctx.textAlign = "center";
      ctx.font = '15px "Segoe UI Black"';
      if (user.reps) {
        ctx.fillText("Reps", 500, 550);
        ctx.fillText(user.reps.size, 500, 570);
      }
  
  
      // Coins/XP
      ctx.textAlign = "left";
      ctx.font = '30px "Segoe UI"';
      ctx.fillStyle = "rgb(253, 255, 252)";
      ctx.fillText(`${Utils.toAbbrev(user.coins + user.bank)}`, 70, 390);
      ctx.fillText(`#${user.Exp.level} | ${Utils.toAbbrev(user.Exp.xp)}/${Utils.toAbbrev(nextLevel)}`, 65, 440);
  
      // Sobre
  
      ctx.font = '20px "Montserrat"';
      ctx.fillText(user.about == "null" ? `Use ${prefix}sobremim <msg> para alterar essa mensagem` : user.about.match(/.{1,78}/g).join("\n"), 65, 333);
  
      //========================// Create Image //========================//
  
      const attach = new MessageAttachment(
        canvas.toBuffer(),
        `Profile_${USER.tag}_.png`
      );
  
      message.reply({files: [attach]});
    }
    shorten(text, len) {
      if (typeof text !== "string") return "";
      if (text.length <= len) return text;
      return text.substr(0, len).trim() + "...";
    }
};
