const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");
const moment = require("moment");
require("moment-duration-format");
const Utils = require("../../utils/Util");
module.exports = class Daily extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "daily";
    this.category = "Economy";
    this.description = "Comando para pegar seus coins diário";
    this.usage = "daily";
    this.aliases = ["diario"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const USER = this.client.users.cache.get(args[0]) || message.mentions.users.first() || message.author;
    const user = await this.client.database.users.findOne({
      idU: message.author.id,
    });

    //================= Imports =================//

    const give = Math.floor(Math.random() * 1500);
    let cooldown = 8.64e7;
    let coins = user.vip.hasVip ? give + Math.floor(Math.random() * 2000) : give;
    let daily = user.daily;
    let atual = user.coins;
    let time = cooldown - (Date.now() - daily);

    //================= Verifcação do Tempo =================//

    if (daily !== null && cooldown - (Date.now() - daily) > 0) {
      return message.reply(`${message.author}, Você deve Aguardar: **${moment.duration(time).format("h [Horas] m [Minutos] e s [Segundos]")}** para Resgatar sua Recompensa Diária Novamente.`);
    } else {
      message.reply(`${message.author}, Você ganhou **${coins}** Cristais na Recompensa Diária, Agora você Posssui: **${Utils.toAbbrev(atual + coins)} Cristais.**`)

      return await this.client.database.users.findOneAndUpdate(
        { idU: USER.id },
        { $set: { coins: coins + atual, daily: Date.now() }}
    )
    }
  }
};
