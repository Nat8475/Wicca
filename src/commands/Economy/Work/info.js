const Command = require("../../../structures/Command");

module.exports = class Info extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "info";
    this.category = "Economy";
    this.description = "Comando para trabalhar";
    this.usage = "work info";
    this.aliases = ["information"];
    this.reference = "Work"

    this.enabled = true;
    this.guildOnly = true;
    this.isSub = true;
  }

  async run({ message, args, prefix, author }, t) {
      return console.log("a")
  }
}