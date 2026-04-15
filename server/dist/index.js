"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const app_1 = require("./app");
async function main() {
    await (0, db_1.connectDb)();
    const app = (0, app_1.createApp)();
    const port = env_1.env.PORT ?? 4000;
    app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`Server listening on :${port}`);
    });
}
main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map