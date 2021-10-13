const Command = require("../../structures/Command");


module.exports = class forceSKip extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "forceskip";
    this.category = "Music";
    this.description = "Comando para pular para próxima música.";
    this.usage = "forceskip";
    this.aliases = ["fs"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message }) {
    const player = this.client.music.players.get(message.guild.id);

    if (!player)
      return message.reply(
        `${message.author}, Não estou Tocando nenhuma Musica nesse Servidor.`
      );

    if (
      !message.member.voice.channel ||
      message.member.voice.channel.id != message.guild.me.voice.channel.id
    )
      return message.reply(
        `${message.author}, Você não está no Mesmo canal que eu.`
      );

    if (message.member.voice.selfDeaf)
      return message.reply(
        `${message.author}, Você está com seu Fone Mutado portante não pode Pular a Musica..`
      );

      player.stop();
      message.react("👍");
  }
};
