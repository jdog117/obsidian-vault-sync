import { Notice, Plugin } from "obsidian";
import { Sync } from "./sync";

export default class Cloud extends Plugin {
    async onload() {
        console.log("loading successful");

        const sync = new Sync(this.app.vault);

        //download
        this.addRibbonIcon("upload-cloud", "AWS Sync", () => {
            sync.mainSyncButton();
        });

        //upload
        this.addCommand({
            id: "save",
            name: "Save vault to cloud",
            callback: async () => {
                await sync.saveToCloud();
                new Notice("Uploaded");
            },
        });
    }

    async onunload() {
        // Release any resources configured by the plugin.
    }
}
