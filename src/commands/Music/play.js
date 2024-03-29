const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class Play extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "play";
    this.category = "Music";
    this.description = "Comando para tocar música em seu servidor.";
    this.usage = "play <url/name>";
    this.aliases = ["p"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, author }) {
    const player2 = this.client.music.players.get(message.guild.id);

    try {
      if (player2) {
        if (message.member.voice.channelId != message.guild.me.voice.channelId)
          return message.reply(
            `${message.author}, você deve estar no mesmo canal de voz que eu.`
          );
      }

      if (!message.member.voice.channel)
        return message.reply(
          `${message.author}, você não está em nenhum canal de voz.`
        );
      const music = args.join(" ");

      if (!music)
        return message.reply(
          `${message.author}, você deve inserir o nome da música/url.`
        );

      const result = await this.client.music.search(music, message.author);

      if (result.loadType === "LOAD_FAILED")
        return message.reply(
          `${message.author}, não consegui tocar essa música.`
        );
      if (result.loadType === "NO_MATCHES")
        return message.reply(
          `${message.author}, não encontrei nenhum resultado para essa pesquisa.`
        );

      message.reply(`${message.author}, pesquisando **\`${music}\`**.`);

      const player = this.client.music.create({
        guild: message.guild.id,
        voiceChannel: message.member.voice.channel.id,
        textChannel: message.channel.id,
      });

      if (player.state === "DISCONNECTED") player.connect();

      if (result.loadType === "PLAYLIST_LOADED") {
        const playlist = result.playlist;

        for (const track of result.tracks) player.queue.add(track);

        if (!player.playing) player.play();

        const EMBED = new ClientEmbed(message.author)
          .setTitle(`PlayList Adicionada`)
          .addFields(
            {
              name: `Nome da PlayList`,
              value: playlist?.name,
              inline: false,
            },
            {
              name: `Quantidade de Músicas`,
              value: result.tracks.length.toString(),
              inline: true,
            },
            {
              name: `Duração`,
              value: this.formatTime(
                this.convertMilliseconds(result.playlist.duration),
                "hh:mm:ss").toString(),
              inline: true,
            }
          );

        message.reply({ embeds: [EMBED] });
      } else {
        const tracks = result.tracks;

        player.queue.add(tracks[0]);

        if (player2) {
          message.reply(
            `${message.author}, música **${tracks[0].title}** adicionada a PlayList.`
          );
        }

        if (!player.playing) player.play();
      }
    } catch (err) {
      if (err) console.log(err);
      return message.reply(`${message.author}, erro ao usar o comando.`);
    }
  }
  convertMilliseconds(ms) {
    const seconds = ~~(ms / 1000);
    const minutes = ~~(seconds / 60);
    const hours = ~~(minutes / 60);

    return { hours: hours % 24, minutes: minutes % 60, seconds: seconds % 60 };
  }

  formatTime(time, format, twoDigits = true) {
    const formats = {
      dd: "days",
      hh: "hours",
      mm: "minutes",
      ss: "seconds",
    };

    return format.replace(/dd|hh|mm|ss/g, (match) =>
      time[formats[match]].toString().padStart(twoDigits ? 2 : 0, "0")
    );
  }
};
