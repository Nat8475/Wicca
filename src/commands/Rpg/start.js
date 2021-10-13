const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");
const moment = require("moment");
require("moment-duration-format");
const Utils = require("../../utils/Util");
module.exports = class Start extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "start";
    this.category = "Rpg";
    this.description = "Comando para Inciar o Rpg.";
    this.usage = "start";
    this.aliases = ["iniciar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const USER = this.client.users.cache.get(args[0]) || message.mentions.users.first() || message.author;
    const user = await this.client.database.users.findOne({idU: USER.id});

   
  }
};
