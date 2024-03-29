const Command = require("../../structures/Command");
const ms = require("ms");
const moment = require("moment");
require("moment-duration-format");
const Collection = require("../../services/Collection");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");

module.exports = class Mute extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "mute";
    this.category = "Moderation";
    this.description = "Comando dê mutar membros.";
    this.usage = "mute <membro> <tempo> <motivo>";
    this.aliases = ["mutar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, author }) {
    

    const doc = await this.client.database.guilds.findOne({
      idS: message.guild.id,
    });

    if (args[0] == "list") {
      const EMBED = new ClientEmbed(author);

      const LIST = new Collection();

      let actualPage = 1;

      let sort = doc.mutes.list.map((x) => x).sort((x, f) => x.time - f.time);

      if (!sort.length)
        return message.reply(
          `${message.author}, não tem ninguém mutado neste servidor.`
        );

      sort.map((x) => {
        LIST.push(
          `Usuário: <@${x.user}> \`( ${x.user} )\`\nTempo: **${moment
            .duration(x.time - Date.now())
            .format("M[M] d[d] h[h] m[m] s[s]")}**\nMotivo: **${
            x.reason.length > 20 ? x.reason.slice(0, 20) + "..." : x.reason
          }**`
        );
      });

      const pages = Math.ceil(LIST.length() / 10);

      let paginated = LIST.paginate(actualPage, 10);

      EMBED.setDescription(paginated.join("\n\n"));

      message.reply({embeds: [EMBED]}).then((msg) => {
        if (pages <= 1) return;

        msg.react(Emojis.Next);

        const collector = msg.createReactionCollector(
          (r, u) =>
            [Emojis.Next, Emojis.Back].includes(r.emoji.name) &&
            u.id === message.author.id
        );

        collector.on("collect", async (r, u) => {
          switch (r.emoji.name) {
            case Emojis.Next:
              if (message.guild.me.permissions.has("MANAGE_MESSAGES"))
                r.users.remove(message.author.id);

              if (actualPage === pages) return;

              actualPage++;
              paginated = LIST.paginate(actualPage, 10);

              EMBED.setDescription(paginated.join("\n\n"));

              await msg.edit({embeds: [EMBED]});
              await msg.react(Emojis.Back);
              if (
                actualPage === pages &&
                message.guild.me.permissions.has("MANAGE_MESSAGES")
              )
                r.remove(Emojis.Next);
              if (
                actualPage === pages &&
                !message.guild.me.permissions.has("MANAGE_MESSAGES")
              )
                r.users.remove(this.client.user.id);

              break;

            case Emojis.Back:
              if (message.guild.me.permissions.has("MANAGE_MESSAGES"))
                r.users.remove(message.author.id);

              if (actualPage === 1) return;

              actualPage--;

              paginated = LIST.paginate(actualPage, 10);
              EMBED.setDescription(paginated.join("\n\n"));
              await msg.edit({embeds: [EMBED]});

              if (
                actualPage === 1 &&
                message.guild.me.permissions.has("MANAGE_MESSAGES")
              )
                r.remove(Emojis.Next);
              if (
                actualPage === 1 &&
                !message.guild.me.permissions.has("MANAGE_MESSAGES")
              )
                r.users.remove(this.client.user.id);
              msg.react(Emojis.Next);
          }
        });
      });

      return;
    }

    const user = message.mentions.users.first() || this.client.users.cache.get(args[0])
    const user2 =message.guild.members.cache.get(user.id)

    if (!user2)
      return message.reply(
        `${message.author}, você deve mencionar quem deseja mutar primeiro.`
      );

    if (!args[1])
      return message.reply(
        `${message.author}, você deve inserir quanto tempo deseja mutar o membro.`
      );

    let time = ms(args[1]); // Tempo do Mute
    let reason = !args[2] ? "Não Informado" : args.slice(2).join(" "); // Motivo do Mute

    if (!time)
      return message.reply(`${message.author}, tempo inválido.`);

    if (!user2.manageable)
      return message.reply(
        `${message.author}, não posso mutar o membro poís ele tem um cargo maior que o meu.`
      );

    if (doc.mutes.list.find((x) => x.user === user2.user.id))
      return message.reply(
        `${message.author}, o membro já se encontra mutado em minha DataBase.`
      );

    let role = message.guild.roles.cache.find((x) => x.name === "Mutado");

    if (!role)
      role = await message.guild.roles
        .create({ data: { name: "Mutado", color: "#000000" } })
        .then((x) => {
          message.guild.channels.cache.forEach((f) => {
            f.createOverwrite(x.id, {
              SEND_MESSAGES: false,
              ADD_REACTIONS: false,
              SPEAK: false,
              STREAM: false,
            });
          });
        });

    message.reply(
      `${
        message.author
      }, o(a) ${user2} foi mutado pelo tempo de **${moment
        .duration(time)
        .format(
          "d[d] h[h] m[m] s[s]"
        )}** pelo motivo: **${reason}** com sucesso.`
    );
    user2.roles.add(role.id, `Mutado por ${message.author.tag} - ${reason}`);

    await this.client.database.guilds.findOneAndUpdate(
      { idS: message.guild.id },
      {
        $push: {
          "mutes.list": [
            { user: user2.user.id, reason: reason, time: time + Date.now() },
          ],
        },
      }
    );

    await this.client.database.guilds.findOneAndUpdate(
      { idS: message.guild.id },
      { $set: { "mutes.has": 5 } }
    );
  }
};
