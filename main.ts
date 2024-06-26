import { Notice, Plugin } from "obsidian";
import { Sync } from "./sync";

export default class Cloud extends Plugin {
    async onload() {
        const sync = new Sync(this.app.vault);

        // iocn button > upload
        this.addRibbonIcon("upload-cloud", "Vault Sync", () => {
            sync.SyncUp();
        });

        this.addCommand({
            id: "Save",
            name: "Save to cloud",
            callback: () => {
                sync.SyncUp();
            },
        });

        this.addCommand({
            id: "Sync",
            name: "Download vault from cloud",
            callback: () => {
                sync.SyncDown();
            },
        });
    }

    async onunload() {
        // Release any resources configured by the plugin.
    }
}
