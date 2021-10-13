const Command = require("../../structures/Command");

module.exports = class Eval extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "eval";
    this.category = "Owner";
    this.description = "Comando para testar códigos";
    this.usage = "eval <código>";
    this.aliases = ["testar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    //if (message.author.id !== "600804786492932101") return;
    const USER = this.client.users.cache.get(args[0]) || message.mentions.users.first() || message.author;
    const doc = await this.client.database.users.findOne({ idU: USER.id });

    if(!doc.staff) return message.reply(`${message.author}, Você Não é um Staff para Utilizar este Comando.`)

    if (!args[0]) return;

    let litchdelicia = args.join(" ");
    let litchtotoso = eval(litchdelicia);
    let token = this.client.token

    //if(litchdelicia != token)  return message.reply(`${message.author}, Essa linha de cmd foi bloqueado.`)
    if (typeof litchtotoso !== "string")
      litchtotoso = require("util").inspect(litchtotoso, { depth: 0 });
    message.reply(
      `Entrada: \`\`\`js\n${litchdelicia}\`\`\`\n Saída: \`\`\`js\n${litchtotoso}\`\`\``
    );
  }
};
