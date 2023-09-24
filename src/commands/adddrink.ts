import TextCommand from "../Command";

export default new TextCommand({
    regex: /^adddrink (?<volume>[+-]?[0-9]*[.]?[0-9]+) (?<name>.*)/,
    handler: ({ ctx, args, user, db }): unknown => {
        if (user.role !== "root") {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { name, volume: _volume } = args.groups!;
        const volume = Number(_volume);

        db.data.drinks.push({
            id: db.data.drinks.length + 1,
            name,
            volume,
        });

        return Promise.allSettled([
            ctx.reply(`Добавлен напиток ${name} (${volume}л)`),
            db.write(),
        ]);
    },
});
