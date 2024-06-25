import { Notice, Plugin } from "obsidian";
import { Sync } from "./sync";

export default class Cloud extends Plugin {
    async onload() {
        console.log("loading successful");

        const vaultAdapterInstance = new VaultAdapter(this.app.vault);
        const sync = new Sync(vaultAdapterInstance /* storageClientInstance */);

        //iocn button > upload
        this.addRibbonIcon("upload-cloud", "AWS Sync", () => {
            sync.mainSyncButton();
        });

        //COMMAND
        this.addCommand({
            id: "save",
            name: "Save to cloud",
            callback: () => {
                new Notice("Working!");
            },
        });
    }

    async onunload() {
        // Release any resources configured by the plugin.
    }
}
