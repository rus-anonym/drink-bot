import TextCommand from "../Command";

export default new TextCommand({
    regex: /^profile$/,
    handler: ({ ctx, user }): Promise<unknown> => {
        const now = Date.now();

        const dayStats = user.getMostPopularDrinks(
            now - 24 * 60 * 60 * 1000,
            now
        );
        const totalStats = user.getMostPopularDrinks(undefined, now);

        const res = ["Профиль:", `ID: ${user.id}`];

        const defaultDrink = user.getDefaultDrink();
        if (defaultDrink !== null) {
            res.push(
                `Напиток по умолчанию: ${defaultDrink.name} (${defaultDrink.volume}л)`
            );
        }

        res.push("Дневная статистика:");
        if (dayStats.length === 0) {
            res.push("Ещё ничего не выпито");
        } else {
            for (const drink of dayStats.slice(0, 5)) {
                res.push(
                    `${drink.name} - ${drink.count} раз, всего: ${(
                        drink.volume * drink.count
                    ).toFixed(3)}л`
                );
            }
        }

        res.push("\n");

        res.push("Статистика за всё время:");
        if (totalStats.length === 0) {
            res.push("Ещё ничего не выпито");
        } else {
            for (const drink of totalStats.slice(0, 5)) {
                res.push(
                    `${drink.name} - ${drink.count} раз, всего: ${(
                        drink.volume * drink.count
                    ).toFixed(3)}л`
                );
            }
        }

        return ctx.reply(res.join("\n"));
    },
});
