import { Command } from "@rus-anonym/commands-manager";
import { MessageContext } from "vk-io";
import DB, { User } from "./DB";

type TTextCommandHandler = (params: {
    ctx: MessageContext;
    db: DB;
    user: User;
    args: RegExpMatchArray;
}) => unknown;

class TextCommand extends Command<TTextCommandHandler> {
    public readonly regex: RegExp;

    constructor({
        regex,
        handler,
    }: {
        regex: RegExp;
        handler: TTextCommandHandler;
    }) {
        super({
            func: handler,
        });
        this.regex = regex;
    }

    public check(cmd: string): boolean {
        return this.regex.test(cmd);
    }
}

export default TextCommand;
