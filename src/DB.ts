import utils from "@rus-anonym/utils";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

interface IDrink {
    id: number;
    name: string;
    volume: number;
}

interface IUser {
    id: number;
    role: "user" | "root";
    defaultDrinkId: number | null;
    history: {
        drinkId: number;
        date: number;
    }[];
}

type TStructure = {
    drinks: IDrink[];
    users: IUser[];
};

const defaultData: TStructure = {
    drinks: [
        {
            id: 1,
            name: "RedBull Big Can",
            volume: 0.473,
        },
        {
            id: 2,
            name: "Adrenaline Rush",
            volume: 0.449,
        },
        {
            id: 3,
            name: "Burn",
            volume: 0.449,
        },
    ],
    users: [
        {
            id: 675114166,
            role: "root",
            history: [],
            defaultDrinkId: 1,
        },
    ],
};

class DB extends Low<TStructure> {
    constructor(path: string) {
        super(new JSONFile(path), defaultData);
    }
}

class User implements IUser {
    private readonly _raw: IUser;
    private readonly _db: DB;

    public static async get(db: DB, id: number): Promise<User> {
        const user = db.data.users.find((x) => x.id === id);

        if (user) {
            return new User(db, user);
        }

        const newUser: IUser = {
            id,
            role: "user",
            history: [],
            defaultDrinkId: null,
        };

        db.data.users.push(newUser);
        await db.write();

        return new User(db, newUser);
    }

    constructor(db: DB, data: IUser) {
        this._db = db;

        this._raw = data;
    }

    public get id(): IUser["id"] {
        return this._raw.id;
    }

    public get role(): IUser["role"] {
        return this._raw.role;
    }

    public get history(): IUser["history"] {
        return this._raw.history;
    }

    public get defaultDrinkId(): IUser["defaultDrinkId"] {
        return this._raw.defaultDrinkId;
    }

    public set role(value: IUser["role"]) {
        this._raw.role = value;
    }

    public set history(value: IUser["history"]) {
        this._raw.history = value;
    }

    public set defaultDrinkId(value: IUser["defaultDrinkId"]) {
        this._raw.defaultDrinkId = value;
    }

    public getMostPopularDrinks(
        start: number = 0,
        end: number = Date.now()
    ): (IDrink & {
        count: number;
    })[] {
        const stats: Map<number, number> = new Map();

        for (const entry of this.history) {
            if (entry.date < start || entry.date > end) {
                continue;
            }

            if (stats.has(entry.drinkId) === false) {
                stats.set(entry.drinkId, 1);
            } else {
                stats.set(entry.drinkId, stats.get(entry.drinkId)! + 1);
            }
        }

        const response: (IDrink & {
            count: number;
        })[] = [];

        for (const [drinkId, value] of stats) {
            response.push({
                ...this._db.data.drinks.find((x) => x.id === drinkId)!,
                count: value,
            });
        }

        return response.sort((a, b) => {
            if (a.count > b.count) {
                return 1;
            } else if (a.count < b.count) {
                return -1;
            } else {
                return 0;
            }
        });
    }

    public getLastDayDrinkEntries(): (IUser["history"][number] & {
        drink: IDrink;
    })[] {
        const lastDrinksEntries = this.history.filter(
            (x) => x.date > Date.now() - 24 * 60 * 60 * 1000
        );

        return lastDrinksEntries.map((entry) => {
            return {
                ...entry,
                drink: this._db.data.drinks.find(
                    (x) => x.id === entry.drinkId
                )!,
            };
        });
    }

    public getLastDrinkEntry():
        | (IUser["history"][number] & { drink: IDrink })
        | undefined {
        if (this.history.length === 0) {
            return undefined;
        }

        const entry = utils.array.last(this.history);

        return {
            ...entry,
            drink: this._db.data.drinks.find((x) => x.id === entry.drinkId)!,
        };
    }

    public getDefaultDrink(): IDrink | null {
        if (this.defaultDrinkId === null) {
            return null;
        }

        return this._db.data.drinks.find((x) => x.id === this.defaultDrinkId)!;
    }

    public save(): Promise<void> {
        return this._db.write();
    }
}

export { User };

export type { IDrink, IUser };

export default DB;
