const Command = require("../../structures/Command");

module.exports = class Ping extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "ping";
    this.category = "Information";
    this.description = "Comando para olhar o ping da host do bot";
    this.usage = "ping";
    this.aliases = ["pong"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    message.reply(`Meu Ping: **${this.client.ws.ping}ms**`)
      .then(x => setTimeout(() => x.delete(), 5000))

  }
};
