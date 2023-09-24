import { stripIndents } from "common-tags";
import TextCommand from "../Command";

export default new TextCommand({
    regex: /^about$/,
    handler: ({ ctx }): Promise<unknown> => {
        return ctx.reply(stripIndents`
            DrinkBot:
            Repo: https://github.com/rus-anonym/drink-bot
            Powered by @rus_anonym_team
        `);
    },
});
