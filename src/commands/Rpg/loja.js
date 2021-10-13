const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const { MessageButton, MessageActionRow } = require("discord.js");
const Collection = require("../../services/Collection");

module.exports = class RpgShop extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "rpg-shop";
    this.category = "RPG";
    this.description = "Comando para ver a loja do sistema de rpg.";
    this.usage = "";
    this.aliases = ["rs"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    

    const USER = this.client.users.cache.get(args[0]) || message.mentions.users.first() || message.author;
    const doc = await this.client.database.users.findOne({idU: USER.id});

    //let sort = doc.staff.list.map((x) => x);
    const array = {
        one: { name: "nat14", id: "1", function: "Aux.Streamer, Staff, Developer."},
        two: { name: "DanielC22", id: "2", function: "Streamer, Staff, CEO."},
        three: { name: "Malaguty95", id: "3", function: "Streamer, Staff, CEO."},
        four: { name: "Malaguty24", id: "4", function: "Aux.Streamer, Staff."},
        five: { name: "HeitorFra7", id: "5", function: "Streamer, Staff, CEO, Aposentado."}
    }
    

    const EMBED = new ClientEmbed(author);

    const ITENS = new Collection();

    let actualPage = 1;

    Object.entries(array).map(([, x]) => {
      ITENS.push(
        `> Nome: **${x.name}**\n> ID: **${x.id}**\n> Função no Projeto: **${x.function}**`
      );
    });

    const pages = Math.ceil(ITENS.length() / 1);

    let paginatedItens = ITENS.paginate(actualPage, 1);

    EMBED.setDescription(paginatedItens.join(" "));
    EMBED.setTitle(`Lista de Staff.`)

    let row = new MessageActionRow();

    const nextButton = new MessageButton()
      .setCustomId("next")
      .setStyle("SECONDARY")
      .setEmoji("⏩")
      .setDisabled(false);

    const backButton = new MessageButton()
      .setCustomId("back")
      .setStyle("SECONDARY")
      .setEmoji("⏪")
      .setDisabled(true);

    if (pages <= 1) nextButton.setDisabled(true);

    row.addComponents([nextButton, backButton]);

    const msg = await message.reply({ embeds: [EMBED], components: [row] });

    if (pages <= 1) return;

    const filter = (interaction) => {
      return interaction.isButton() && interaction.message.id === msg.id;
    };

    await msg
      .createMessageComponentCollector({
        filter: filter,
        time: 60000,
      })

      .on("end", async (r, reason) => {
        if (reason != "time") return;

        nextButton.setDisabled(true);
        backButton.setDisabled(true);

        row = new MessageActionRow().addComponents([nextButton, backButton]);

        await msg.edit({
          embeds: [EMBED.setFooter(`Tempo Acabado`)],
          components: [row],
        });
      })

      .on("collect", async (r) => {
        switch (r.customId) {
          case "next":
            if (message.guild.me.permissions.has("MANAGE_MESSAGES"))
              if (actualPage === pages) return;

            actualPage++;
            paginatedItens = ITENS.paginate(actualPage, 1);
            EMBED.setDescription(paginatedItens.join(" "));

            if (
              actualPage === pages &&
              message.guild.me.permissions.has("MANAGES_MESSAGES")
            )
              nextButton.setDisabled(true);

            if (
              actualPage === pages &&
              !message.guild.me.permissions.has("MANAGE_MESSAGES")
            ) {
              nextButton.setDisabled(true);
              backButton.setDisabled(true);
            }

            backButton.setDisabled(false);

            row = new MessageActionRow().addComponents([
              nextButton,
              backButton,
            ]);

            await r.deferUpdate();
            await msg.edit({ embeds: [EMBED], components: [row] });

            break;

          case "back": {
            if (message.guild.me.permissions.has("MANAGE_MESSAGES"))
              if (actualPage === 1) return;

            actualPage--;
            paginatedItens = ITENS.paginate(actualPage, 1);
            EMBED.setDescription(paginatedItens.join(" "));

            if (
              actualPage === 1 &&
              message.guild.me.permissions.has("MANAGES_MESSAGES")
            )
              backButton.setDisabled(true);

            if (
              actualPage === 1 &&
              !message.guild.me.permissions.has("MANAGE_MESSAGES")
            ) {
              nextButton.setDisabled(true);
              backButton.setDisabled(true);
            }

            nextButton.setDisabled(false);

            row = new MessageActionRow().addComponents([
              nextButton,
              backButton,
            ]);

            await r.deferUpdate();
            await msg.edit({ embeds: [EMBED], components: [row] });
          }
        }
      });
  }
};