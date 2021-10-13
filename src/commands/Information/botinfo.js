const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");
const moment = require("moment");
require("moment-duration-format");
const fetch = require("node-fetch");

module.exports = class BotInfo extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "botinfo";
    this.category = "Information";
    this.description = "Comando para olhar as informações do Bot.";
    this.usage = "botinfo";
    this.aliases = ["b-info"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    //=============>== Imports <===============//

    const users = this.client.users.cache.size;
    const servers = this.client.guilds.cache.size;
    const commands = this.client.commands.size;
    const uptime = moment
      .duration(process.uptime() * 1000)
      .format("d[d] h[h] m[m] e s[s]");
    const memory =
      (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + "MB";
    const ping = Math.ceil(this.client.ws.ping) + "ms";
    const version = process.version;
    const owner = await this.client.users.fetch(process.env.OWNER_ID);

    //=============>== Start Request DB <===============//

    const startDB = process.hrtime();
    await User.findOne({ idU: message.author.id }, async (err, user) => {
      const coins = user.coins;
    });

    //=============>== Finish Request DB <===============//

    const stopDB = process.hrtime(startDB);
    const pingDB = Math.round((stopDB[0] * 1e9 + stopDB[1]) / 1e6) + "ms";


    //=============>== Finish <===============//

    const EMBED = new ClientEmbed(author)

      .setAuthor(`Minhas Informações`, this.client.user.displayAvatarURL())
      .addFields(
        {
          name: `${Emojis.Devs} | Meu Dono:`,
          value: `**${owner.tag}** || **[${owner.username}](-x-)**.\nㅤ`,
        },
        {
          name: `${Emojis.infoBot} | Informações Principais:`,
          value: `${Emojis.Usuários} | Usuários do Bot: **${users.toLocaleString()}**.\n${Emojis.Servidores} | Servidores do Bot: **${servers.toLocaleString()}**.\n${Emojis.TComandos} | Total de Comandos: **${commands}**.\n${Emojis.Online} | Tempo Online: **\`${uptime}\`**.\nㅤ`,
        },
        {
          name: `${Emojis.InfoAdicional} | Mais Informações`,
          value: `${Emojis.Ping} | Ping do Bot: **${ping}**.\n${Emojis.MongoDB} | Ping da DataBase: **${pingDB}**.\n${Emojis.Memória} | Total de Memória Usada: **${memory}**.\n${Emojis.NodeJS} | Versão do Node.JS: **${version}**.\nㅤ`,
        },
        {
          name: `Meus Links`,
          value: `[Meu Convite.](-x-)\n[Servidor de Suporte.](https://discord.gg/DpcV3GGmwC)`,
        }
      )
      .setFooter(`${message.guild.name}`, message.guild.iconURL({ dynamic: true}))
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true, format: "jpg", size: 2048 }));
      
    message.reply({ embeds: [EMBED] });
  }
};
