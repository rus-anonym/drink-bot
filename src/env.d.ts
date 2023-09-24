/* eslint-disable @typescript-eslint/naming-convention */

declare module "bun" {
    interface Env {
        TOKEN: string;
        DB_FILE: string;
        PREFIX?: string;
    }
}
