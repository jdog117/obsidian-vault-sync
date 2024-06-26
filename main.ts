import { Plugin } from "obsidian";
import { Sync } from "./sync";

export default class Cloud extends Plugin {
    async onload() {
        const sync = new Sync(this.app.vault);

        // iocn button > upload
        this.addRibbonIcon("upload-cloud", "Vault Sync", () => {
            sync.pushVault();
        });

        this.addCommand({
            id: "Save",
            name: "Save vault to cloud",
            callback: () => {
                sync.pullVault();
            },
        });

        this.addCommand({
            id: "Sync",
            name: "Download vault from cloud",
            callback: () => {
                sync.pullVault();
            },
        });
    }

    async onunload() {
        // Release any resources configured by the plugin.
    }
}
