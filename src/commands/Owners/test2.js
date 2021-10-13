const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Youtube = new (require("simple-youtube-api"))(process.env.YOUTUBE_API);
const { MessageSelectMenu, MessageActionRow } = require("discord.js");
const parser = new (require("rss-parser"))();

module.exports = class youtubeNotification extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "youtubeNotification";
    this.category = "Config";
    this.description = "Comando para configurar o prefixo do bot no servidor";
    this.usage = "prefix <prefix>";
    this.aliases = ["ytn"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const max_size = this.client.youtubeChannels.filter((x) => x.guild === message.guild.id);

    //                || Adicionar Canais ||                \\

    if (["add", "adicionar"].includes(args[0].toLowerCase())) {
      const url = args[1];

      if (max_size.length > 3) return message.reply(`${message.author}, Este Servidor atingiu o Maximo de Servidor possiveis.`);

      if (!url) return message.reply(`${message.author}, Você não digitou a Url do Canal.`);

      const verify = await Youtube.getChannel(url).catch(() => {});

      if (!verify) return message.reply(`${message.author}, O Canal não foi Encontrado.`);

      const verify_array = this.client.youtubeChannels.filter((x) => x.guild === message.guild.id).find((x) => x.id === verify.id);

      if (verify_array) return message.reply(`${message.author}, O Canal já se encontra na Lista.`);

      const textChannel =
      message.guild.channels.cache.get(args[1]) ||
      message.mentions.channels.first();

    if (!textChannel || textChannel.type != "GUILD_TEXT")
      return message.reply(
        `${message.author}, Você não Inseriu o Canal dos Anúncios.`
      );

      //                || Collector Canal de Texto ||                \\

    const msg = await message.reply(`${message.author}, Digite a Mensagem que deseja Enviar no Anúncio.`)

    const filter = (m) => m.author.id === message.author.id;
    let collector = msg.channel.createMessageCollector({ filter: filter, max: 1, time: 60000 * 2 })

    .on("collect", async(collected) => {
        
        if (["cancelar", "cancel"].includes(collected.content.toLowerCase())) {
            message.reply(`${message.author}, Cancelado com Sucesso.`);

            msg.delete();
            return collector.stop();
          }

          await this.client.database.guilds.findOneAndUpdate(
            { idS: message.guild.id },
            {
              $push: {
                youtube: [
                  {
                    id: verify.id,
                    textChannel: textChannel.id,
                    guild: message.guild.id,
                    msg: collected.content,
                  },
                ],
              },
            }
          );
  
          this.client.youtubeChannels.push({
            id: verify.id,
            textChannel: textChannel.id,
            guild: message.guild.id,
            msg: collected.content,
          });
  
          message.reply(`${message.author}, canal inserido com sucesso.`);
  
          msg.delete();
          return collector.stop();
    })
    }
  }
}