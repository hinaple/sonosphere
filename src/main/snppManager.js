//SNPP : SoNosPhere Project

import { emptyDir } from "fs-extra";
import { create, extract } from "tar";

export default class SnppManager {
    constructor({ projectDir, beforeImport = null, afterImport = null }) {
        this.projectDir = projectDir;
        this.beforeImport = beforeImport;
        this.afterImport = afterImport;

        this.importing = false;
    }
    createStream() {
        return create({ cwd: this.projectDir }, ["."]);
    }
    async extractStream() {
        if (this.importing) return;

        this.importing = true;
        this.beforeImport?.();
        await emptyDir(this.projectDir);
        return extract({ cwd: this.projectDir }).on("close", () => {
            this.importing = false;
            this.afterImport?.();
        });
    }
}
