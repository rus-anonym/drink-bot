import TextCommand from "../Command";

export default new TextCommand({
    regex: /^drinks$/,
    handler: ({ ctx, db }): Promise<unknown> => {
        const drinks = db.data.drinks.map(
            (x) => `${x.id}. ${x.name} (${x.volume}л)`
        );

        return ctx.reply(drinks.join("\n"));
    },
});
