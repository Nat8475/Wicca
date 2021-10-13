const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");
const Utils = require("../../utils/Util");
const Emojis = require("../../utils/Emojis");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class Atm extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "atm";
    this.category = "Economy";
    this.description = "Comando para olhar seus coins/do usuário";
    this.usage = "atm <@user>";
    this.aliases = ["money", "coins"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const USER = this.client.users.cache.get(args[0]) || message.mentions.users.first() || message.author;
    const doc = await this.client.database.users.findOne({ idU: USER.id });

    const EMBED = new ClientEmbed(author)
    .setAuthor(`${USER.username} - Cristais.`, USER.displayAvatarURL({ dynamic: true }))
    .setColor("#000000")
        .addFields(
          {
            name: `${Emojis.Coins} - Cristais na Carteira:`,
            value: `**${Utils.toAbbrev(doc.coins)}** ( ${doc.coins} )`.toString(),
          },

          {
            name: `${Emojis.Bank} - Cristais no Banco:`,
            value: `**${Utils.toAbbrev(doc.bank)}** ( ${doc.bank} )`.toString(),
          },
          {
            name: `${Emojis.Economy} - Total de Cristais:`,
            value: `**${Utils.toAbbrev(doc.coins + doc.bank)}** ( ${doc.coins + doc.bank} )`.toString(),
          }
        )
        .setFooter(`${message.guild.name}`, message.guild.iconURL({ dynamic: true}))
        .setTimestamp()
        .setThumbnail(USER.displayAvatarURL({ dynamic: true, size: 2048, format: "jpg" }));


      message.reply({embeds: [EMBED]})
  }
};
