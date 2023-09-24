import TextCommand from "../Command";

export default new TextCommand({
    regex: /^setdrink (?<name>.*)/,
    handler: ({ ctx, args, user, db }): unknown => {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { name: _name } = args.groups!;

        const name = _name.toLowerCase();

        const drink = db.data.drinks.find((x) => x.name.toLowerCase() === name);

        if (drink === undefined) {
            const maybeDrinks = db.data.drinks.filter((x) => {
                return x.name.toLowerCase().startsWith(name);
            });

            const res = [
                "Такого напитка нет, чтобы его добавили, напишите команду !request <name> <volume>",
            ];

            if (maybeDrinks.length !== 0) {
                res.push(
                    `Возможно вы имели ввиду один из этих напитков: ${maybeDrinks
                        .slice(0, 3)
                        .map((x) => x.name)
                        .join(", ")}`
                );
            }

            return ctx.reply(res.join("\n\n"));
        }

        user.defaultDrinkId = drink.id;

        return Promise.allSettled([
            ctx.reply(
                `Установлен напиток по умолчанию ${drink.name} (${drink.volume}л)`
            ),
            db.write(),
        ]);
    },
});
