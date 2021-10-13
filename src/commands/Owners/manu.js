const CommandC = require("../../database/Schemas/Command"),
  ClientS = require("../../database/Schemas/Client");
const Command = require("../../structures/Command");

module.exports = class Manu extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "manu";
    this.category = "Owner";
    this.description = "Comando para colocar outros comandos em manutenção";
    this.usage = "eval <código>";
    this.aliases = ["manu"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const USER = this.client.users.cache.get(args[0]) || message.mentions.users.first() || message.author;
    const doc = await this.client.database.users.findOne({ idU: USER.id });
    const client = await this.client.database.clientUtils.findOne({ _id: this.client.user.id });

    //if(!doc.staff) return message.reply(`${message.author}, Você Não é um Staff para Utilizar este Comando.`)

    let re = args[2]

    if (args[0] == "bot") {
      if(["remover", "r"].includes(args[1].toLowerCase())) {
        await this.client.database.clientUtils.findOneAndUpdate(
          { _id: this.client.user.id },
          { $set: { manutenção: false, reason: "" } }
        );

        return message.reply(`${message.author}, Fui retirado da Manutenção com Sucesso.`)
      } else {
        message.reply(`${message.author}, Fui colocado em Manutenção com Sucesso, Pelo motivo de: ${re}`)

        await this.client.database.clientUtils.findOneAndUpdate(
          { _id: this.client.user.id },
          { $set: { manutenção: true, reason: re } }
        );
      }


      return;
    }

  }
};
