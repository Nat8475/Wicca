const Command = require("../../structures/Command");
const Emojis = require("../../utils/Emojis");
const Util = require("../../utils/Util");
const { MessageButton, MessageActionRow, MessageSelectMenu } = require("discord.js");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class Teste extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "test";
    this.category = "Owner";
    this.description = "Comando para enviar dinheiro.";
    this.usage = "test";
    this.aliases = ["testar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const user = this.client.users.cache.get(args[0]) || message.mentions.users.first();

    const doc = await this.client.database.users.findOne({
      idU: message.author.id,
    });

    const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
				.setCustomId(LINK)
				.set
			);

      const embed = new ClientEmbed(author)
      .setTitle(`Teste`)
      .setDescription(`teste`)

      message.reply({embeds: [embed], components: [row]})
    
  }
};
