const Command = require("../../structures/Command");
const ms = require("ms");
const Emojis = require("../../utils/Emojis");
const moment = require("moment");
require("moment-duration-format");

module.exports = class DevSet extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "DevSet";
    this.category = "Owner";
    this.description = "Comando para Setar Informações dos Usuários.";
    this.usage = "devset";
    this.aliases = ["ds", "dv"];
    this.reference = "Dev";

    this.enabled = true;
    this.guildOnly = true;

  }

  async run({ message, args, prefix, author }, t) {
    moment.locale("pt-BR");

    const USER =
      this.client.users.cache.get(args[0]) ||
      message.mentions.users.first();

    const doc = await this.client.database.users.findOne({ idU: message.author.id });
    const doc2 = await this.client.database.users.findOne({ idU: USER.id });

    const vip = doc.vip;

    if (!doc.staff) 
      return message.reply(
        `${message.author}, Você não é um Staff para Utilizar este Comando!`
      );
    

    if (!args[0])
      return message.reply(
        "Utilize da seguinte Forma: ```e.devset <variaveis>```.\n\nVariaveis Disponiveis:\n>Staff\n>Dev\n>Vip>Divorcio\n>Casar."
      );

    if (["money", "coins"].includes(args[0].toLowerCase())) {

        if (["remove", "remover", "r"].includes(args[1].toLowerCase())) {
          if (!USER) {
            return message.reply(
              `${Emojis.Errado} - ${message.author}, Você deve Mencionar quem Deseja Remover os Coins..`
            );
          } else {
            message.reply(`${message.author}, Coins removidos com Sucesso.`);
            return await this.client.database.users.findOneAndUpdate(
                { idU: USER.id },
                { $set: { coins: 0 }}
            )
          }
        
      }

      if(!USER) {
        return message.reply(
            `${Emojis.Errado} - ${message.author}, Você deve Mencionar quem Deseja Adicionar os Coins..`
          );
      } else {
        let coins = args[2]

        if(!coins) { return message.reply(`${message.author}, Insira as coins que deseja adicionar.`)}

        message.reply(`${message.author}, Coins adicionadas com Sucesso.`)
        return await this.client.database.users.findOneAndUpdate(
            { idU: USER.id },
            { $set: { coins: doc.coins + coins } }
          );
      }
    }
    if(["reset", "resetar"].includes(args[0].toLowerCase())) {
      if(!USER) {
        return message.reply(
            `${Emojis.Errado} - ${message.author}, Você deve Mencionar quem Deseja dar Reset..`
          );
      } else {

        message.reply(`${message.author}, Reset feito com Sucesso.`)
        return await this.client.database.users.findOneAndUpdate(
            { idU: USER.id },
            { $set: { 
              coins: 0, 
              bank: 0
             } }
          );
      }
    }

    if (["vip", "v"].includes(args[0].toLowerCase())) {
      if (["remove", "remover", "r"].includes(args[1].toLowerCase())) {
        if (!USER) {
          return message.reply(
            `${Emojis.Errado} - ${message.author}, Você deve Mencionar quem Deseja Remover Vip.`
          );
        } else {
          if (vip.hasVip) {
            message.reply(
              `${Emojis.Certo} - ${message.author}, Vip Removido Com Sucesso!`
            );
            return await this.client.database.users.findOneAndUpdate(
              { idU: USER.id },
              { $set: { "vip.date": vip.date - vip.date, "vip.hasVip": false } }
            );
          }
        }
      }

      if (!USER) {
        return message.reply(
          `${Emojis.Errado} - ${message.author}, Você deve Mencionar quem Deseja Adicionar Vip.`
        );
      } else if (!args[1]) {
        return message.reply(
          `${Emojis.Errado} - ${message.author}, Você não Inseriu o Tempo de Vip.`
        );
      }

      let time = ms(args[2]);

      if (String(time) == "undefined") {
        return message.reply(
          `${Emojis.Errado} - ${message.author}, A Data digita é Inválida.`
        );
      } else {
        if (vip.hasVip) {
          message.reply(
            `${Emojis.Certo} - ${message.author}, Tempo de Vip Adicionado com Sucesso, Para ${USER.tag}!`
          );

          return await this.client.database.users.findOneAndUpdate(
            { idU: USER.id },
            { $set: { "vip.date": vip.date + time } }
          );
        } else {
          message.reply(
            `${Emojis.Certo} - ${message.author}, Agora o Membro Possui Vip.`
          );

          await this.client.database.users.findOneAndUpdate(
            { idU: USER.id },
            { $set: { "vip.date": Date.now() + time, "vip.hasVip": true } }
          );
        }
      }
    }

    if (["staff", "s"].includes(args[0].toLowerCase())) {
      if (["remove", "remover"].includes(args[1].toLowerCase())) {
        if (!USER) {
          return message.reply(`Você deve mencionar alguém.`);
        } else {
          message.reply(`Staff Removido com Sucesso!`);

          return await this.client.database.users.findOneAndUpdate(
            { idU: USER.id },
            { $set: { staff: false } }
          );
        }
      }

      if (!USER) {
        return message.reply(`Você deve mencionar alguém.`);
      } else {
        message.reply(`Staff Definido com Sucesso!`);

        return await this.client.database.users.findOneAndUpdate(
          { idU: USER.id },
          { $set: { staff: true } }
        );
      }
    }

    if (["dev", "devs", "d"].includes(args[0].toLowerCase())) {
      if (["remove", "remover"].includes(args[1].toLowerCase())) {
        if (!USER) {
          return message.reply(`Você deve mencionar alguém.`);
        } else {
          message.reply(`Dev Removido com Sucesso!`);

          return await this.client.database.users.findOneAndUpdate(
            { idU: USER.id },
            { $set: { devs: false } }
          );
        }
      }

      if (!USER) {
        return message.reply(`Você deve mencionar alguém.`);
      } else {
        message.reply(`Dev definido com sucesso.`);

        return await this.client.database.users.findOneAndUpdate(
          { idU: USER.id },
          { $set: { devs: true } }
        );
      }
    }

    if (["divorciar", "divorcio", "di"].includes(args[0].toLowerCase())) {
      if (!USER) {
        return message.reply("Você deve mencionar alguém.");
      } else {
        message.reply("Divorcio concluido.");

        await this.client.database.users.findOneAndUpdate(
          { idU: USER.id },
          {
            $set: {
              "marry.user": "null",
              "marry.has": false,
              "marry.time": 0,
            },
          }
        );
        await this.client.database.users.findOneAndUpdate(
          { idU: doc.marry.user },
          {
            $set: {
              "marry.user": "null",
              "marry.has": false,
              "marry.time": 0,
            },
          }
        );
      }
    }

    if (["casar", "marry", "ca"].includes(args[0].toLowerCase())) {
      if (!USER) {
        return message.reply("Você deve marcar alguém para Casar");
      } else {
        message.reply(`Casamento concluido.`);

        await this.client.database.users.findOneAndUpdate(
          { idU: message.author.id },
          {
            $set: {
              "marry.user": USER.id,
              "marry.has": true,
              "marry.time": Date.now(),
            },
          }
        );
        await this.client.database.users.findOneAndUpdate(
          { idU: USER.id },
          {
            $set: {
              "marry.user": message.author.id,
              "marry.has": true,
              "marry.time": Date.now(),
            },
          }
        );
      }
    }
  }
};
