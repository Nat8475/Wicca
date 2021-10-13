const Command = require("../../structures/Command");
const Emojis = require("../../utils/Emojis");
const Util = require("../../utils/Util");
const { MessageButton, MessageActionRow } = require("discord.js");

module.exports = class Pay extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "pay";
    this.category = "Economy";
    this.description = "Comando para enviar dinheiro.";
    this.usage = "pay <user> <quantia>";
    this.aliases = ["pagar", "enviar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const user =
      this.client.users.cache.get(args[0]) || message.mentions.users.first();

    const doc = await this.client.database.users.findOne({
      idU: message.author.id,
    });

    if (!user)
      return message.reply(
        `${message.author}, Você deve Mencionar Alguém para Enviar Cristais.`
      );

    if (!args[1])
      return message.reply(
        `${message.author}, Você Não Inseriu a Quantia de Cristais que deseja Enviar.`
      );

    const money = await Util.notAbbrev(args[1]);

    if (String(money) === "NaN")
      return message.reply(`${message.author}, Quantia de Cristais Inválidos.`);

    if (money <= 10)
      return message.reply(`${message.author}, Insira uma Quantia de Cristal maior de 10.`);

    if (user.id === message.author.id)
      return message.reply(
        `${message.author}, Você não pode enviar Cristais para você mesmo.`
      );

    if (money > doc.bank)
      return message.reply(
        `${message.author}, Você está tentando enviar uma quantia de Cristais maior do que você Possui.`
      );

    const target = await this.client.database.users.findOne({ idU: user.id });

    const row = new MessageActionRow();

    const yesButton = new MessageButton()
      .setCustomId("yes")
      .setLabel("Enviar")
      .setStyle("SUCCESS")
      .setDisabled(false);

    const noButton = new MessageButton()
      .setCustomId("no")
      .setLabel("Cancelar")
      .setStyle("DANGER")
      .setDisabled(false);

    row.addComponents([yesButton, noButton]);

    const msg = await message.reply({
      content: `${message.author}, Você deseja Enviar **${Util.toAbbrev(money)} Cristais** Para o(a) ${user}?!`,
      components: [row],
    });

    let collect;

    const filter = (interaction) => {
      return interaction.isButton() && interaction.message.id === msg.id;
    };

    const collector = msg.createMessageComponentCollector({
      filter: filter,
      time: 60000,
    });

    collector.on("collect", async (x) => {
      if (x.user.id != message.author.id)
        return x.reply({
          content: `Uso restrito para o ${message.author}, Pois ele é o Author do Comando.`,
          ephemeral: true,
        });

      collect = x;

      switch (x.customId) {
        case "yes": { message.reply(`${message.author}, Cristais enviados com Sucesso.`);

          await this.client.database.users.findOneAndUpdate(
            { idU: message.author.id },
            { $set: { bank: doc.bank - money, }, }
          );

          await this.client.database.users.findOneAndUpdate(
            { idU: user.id },
            { $set: { bank: target.bank + money, }, }
          );

          msg.delete();
          break;
        }

        case "no": {
          msg.delete();

          return message.reply(`${message.author}, Envio de Cristais cancelado com Sucesso.`);

        }
      }
    });

    collector.on("end", (x) => {
      if (collect) return;
      //x.update({ components: [] });
    });
  }
};
