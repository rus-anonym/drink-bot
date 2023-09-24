import { Manager } from "@rus-anonym/commands-manager";
import { MessageContext, VK } from "vk-io";
import TextCommand from "./Command";
import DB, { User } from "./DB";

import adddrink from "./commands/adddrink";
import drink from "./commands/drink";
import drinks from "./commands/drinks";
import id from "./commands/id";
import profile from "./commands/profile";
import setdrink from "./commands/setdrink";

const commandsManager = new Manager<TextCommand>([
    id,
    drink,
    profile,
    adddrink,
    setdrink,
    drinks,
]);

class Bot {
    private readonly _db: DB;
    private readonly _instance: VK;

    constructor({ db, token }: { db: DB; token: string }) {
        this._db = db;
        this._instance = new VK({ token });

        this._instance.updates.on("message_new", this.onNewMessage.bind(this));
    }

    public async onNewMessage(
        ctx: MessageContext,
        next: () => unknown
    ): Promise<unknown> {
        if (ctx.isOutbox || ctx.isFromGroup || ctx.text === undefined) {
            return next();
        }

        if (
            Bun.env.PREFIX !== undefined &&
            ctx.text.startsWith(Bun.env.PREFIX) === false
        ) {
            return next();
        } else if (Bun.env.PREFIX !== undefined) {
            ctx.text = ctx.text.slice(Bun.env.PREFIX.length);
        }

        const cmd = commandsManager.find(ctx.text);

        if (cmd === undefined) {
            return next();
        }

        void cmd.execute({
            ctx,
            db: this._db,
            user: await User.get(this._db, ctx.senderId),
            args: ctx.text.match(cmd.regex)!,
        });

        return next();
    }

    public start(): Promise<void> {
        return this._instance.updates.start();
    }
}

export default Bot;
