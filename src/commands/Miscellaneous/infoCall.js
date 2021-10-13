const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const moment = require("moment");
require("moment-duration-format");
const Collection = require("../../services/Collection");
const Emojis = require("../../utils/Emojis");

module.exports = class infoCall extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "infoCall";
    this.category = "Miscellaneous";
    this.description = "Configure e Veja suas informações do contador de tempo em Call";
    this.usage = "infocall";
    this.aliases = ["info-call", "i-c", "infocall", "ic"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const USER = this.client.users.cache.get(args[0]) || message.mentions.users.first() || message.author;

    const doc = await this.client.database.users.findOne({ idU: USER.id, });

    if (args[0] == "status" || args[0] == "stts") {
      const doc1 = await this.client.database.users.findOne({ idU: message.author.id, });

      if (doc1.infoCall.status) {
        message.reply(`${message.author}, O Sistema estava Ligado na sua Conta portanto eu Desativei.`);
        await this.client.database.users.findOneAndUpdate(
          { idU: message.author.id },
          { $set: { "infoCall.status": false } }
        );

      } else {
        message.reply(`${message.author}, O Sistema estava Desligado na sua Conta portanto eu Ativei.`);
        await this.client.database.users.findOneAndUpdate(
          { idU: message.author.id },
          { $set: { "infoCall.status": true } }
        );
      }

      return;
    }


    if (doc.infoCall.lastRegister <= 0)
      return message.reply(`${message.author}, O Membro nunca Ficou em Call.`)
    const EMBED = new ClientEmbed(USER)
      .setAuthor(`${USER.username} - Contador de Tempo em Call.`, USER.displayAvatarURL({ dynamic: true }))
      .setThumbnail(USER.displayAvatarURL({ dynamic: true, format: "jpg", size: 2048 }))
      .setDescription(`${message.author}, Você está vendo as Informações da Conta: **${USER.tag}**.`)
      .addFields(
        {
          name: `Status do Sistema na Conta`,
          value: `O Sistema se encontra **${doc.infoCall.status ? "Ativado" : "Desativado"}**.`,
        },
        {
          name: `Tempo na Última Call:`,
          value: `**${moment
            .duration(doc.infoCall.lastRegister)
            .format("d [Dias] h [Horas] m [Minutos] e s [Segundos]")
            .replace("minsutos", "minutos")}**`,
        },
        {
          name: `Tempo Total de Call:`,
          value: `**${moment
            .duration(doc.infoCall.totalCall)
            .format("M [Meses] d [Dias] h [Horas] m [minutos] e s [Segundos]")
            .replace("minsutos", "minutos")}**`,
        },
        {
          name: `Como Ativar/Desativar o Sistema:`,
          value: `> Para Ativar ou Desativar o Sistema na sua Conta use **${prefix}infocall status**.`,
        }
      );

    message.reply({embeds: [EMBED]})
  }
  async PUSH(call, members) {
    for (const member of call) {
      const doc = await this.client.database.users.findOne({ idU: member });

      members.push({
        user: await this.client.users.fetch(member).then((user) => {
          return user;
        }),
        callTime: doc.infoCall.totalCall,
      });
    }
  }
};
