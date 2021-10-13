const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");
const Utils = require("../../utils/Util");

module.exports = class Deposit extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "deposit";
    this.category = "Economy";
    this.description = "Comando para depositar seu dinheiro";
    this.usage = "deposit <quantia>";
    this.aliases = ["depositar", "dep", "deep"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const USER = message.author;
    const doc = await this.client.database.users.findOne({ idU: USER.id });

    let coins = parseInt(args[0]);

      if (!args[0]) return message.reply(`${message.author}, Maneira correta de Utilizar: ${prefix}depoistar <Quantia/All>.`);

      if (["all", "tudo"].includes(args[0].toLowerCase())) {

        if (doc.coins == 0) {
          return message.reply(`${message.author}, Você Não tem Nenhum Cristal para Depositar.`);

        } else {

          message.reply(`${message.author}, Você Depositou **${Utils.toAbbrev(doc.coins)} Cristais** com Sucesso.`);

          return await this.client.database.users.findOneAndUpdate(
            { idU: USER.id },
            { $set: { coins: 0, bank: doc.coins + doc.bank }}
        )

        }
        return;

      }
      if (coins < 100) {
        return message.reply(`${message.author}, Você Não pode Depostar Menos de 100 Cristais.`);

      } else if (isNaN(coins)) {
        return message.reply(`${message.author}, Maneira correta de Utilizar: ${prefix}depoistar <Quantia/All>.`);

      } else if (coins > doc.coins) {
        return message.reply( `${message.author}, Você Não possui todos esses Cristais.`);

      } else {
        message.reply(`${message.author}, Você Depositou **${Utils.toAbbrev(coins)} Cristais** com Sucesso.`);

        return await this.client.database.users.findOneAndUpdate(
          { idU: USER.id },
          { $set: { coins: doc.coins - coins, bank: doc.bank + coins }}
      )
      }
  }
};
