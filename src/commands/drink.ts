import utils from "@rus-anonym/utils";
import { stripIndents } from "common-tags";
import TextCommand from "../Command";
import { IDrink } from "../DB";

export default new TextCommand({
    regex: /^(drink|выпить)(?<drink> .*)?$/,
    handler: async ({ db, ctx, user, args }): Promise<unknown> => {
        let drink: IDrink | undefined = undefined;
        let drinkName: string | undefined;

        if (args.groups!.drink !== undefined) {
            drinkName = args.groups!.drink;
        }

        const defaultDrink = user.getDefaultDrink();
        if (defaultDrink !== null) {
            drink = defaultDrink;
        }

        if (drinkName === undefined && drink === undefined) {
            return ctx.reply("Вы не указали напиток");
        }

        if (drink === undefined && drinkName !== undefined) {
            drinkName = drinkName.toLowerCase().trim();

            drink = db.data.drinks.find(
                (x) => x.name.toLowerCase() === drinkName!
            );
        }

        if (drink === undefined) {
            const maybeDrinks = db.data.drinks.filter((x) => {
                return x.name.toLowerCase().startsWith(drinkName!);
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

        const lastDrink = user.getLastDrinkEntry();
        const now = Date.now();

        if (lastDrink !== undefined && lastDrink.date > now - 30 * 60 * 1000) {
            return ctx.reply("Пить можно только раз в полчаса");
        }

        const total = utils.array.number.total(
            user.getLastDayDrinkEntries().map((x) => x.drink.volume)
        );

        if (total + drink.volume > 10) {
            return ctx.reply("В день нельзя пить больше 10 литров");
        }

        const isSettedDefaultDrink = user.defaultDrinkId === null;
        if (isSettedDefaultDrink) {
            user.defaultDrinkId = drink.id;
            await user.save();
        }

        user.history.push({
            drinkId: drink.id,
            date: now,
        });

        return Promise.allSettled([
            ctx.reply(stripIndents`
            Вы выпили ${drink.name} (${drink.volume.toFixed(3)} л)
            За день выпито: ${(total + drink.volume).toFixed(3)} л
        `),
            db.write(),
        ]);
    },
});
