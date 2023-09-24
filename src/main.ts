import Bot from "./Bot";
import DB from "./DB";

if (Bun.env.TOKEN === undefined) {
    throw new Error("Token not specified");
}

if (Bun.env.DB_FILE === undefined) {
    throw new Error("DB file path not specified");
}

void (async function main(): Promise<void> {
    const db = new DB(Bun.env.DB_FILE);
    await db.read();
    const bot = new Bot({ db, token: Bun.env.TOKEN });

    return bot.start().then(() => {
        console.log("Drink Bot running");
    });
})();
