import TextCommand from "../Command";

export default new TextCommand({
    regex: /^id$/,
    handler: ({ ctx }): Promise<unknown> => {
        const ids = [`Your ID: ${ctx.senderId}`];

        if (ctx.hasReplyMessage && ctx.replyMessage) {
            ids.push(`Target ID: ${ctx.replyMessage.senderId}`);
        }

        if (ctx.chatId !== undefined) {
            ids.push(`Chat ID: ${ctx.chatId}`);
        } else {
            ids.push(`Peer ID: ${ctx.peerId}`);
        }

        return ctx.reply(ids.join("\n"));
    },
});
