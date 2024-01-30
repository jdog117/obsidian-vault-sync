import { Notice, Plugin } from 'obsidian';


export default class Sync extends Plugin {

    async onload() {
        console.log('loading plugin')

        this.addRibbonIcon("upload-cloud", "AWS Sync", () => {
            //save function here
            const getVaultFiles = this.app.vault.getMarkdownFiles();
            this.copyFiles(getVaultFiles)

        })

        this.addCommand({
            id:"save",
            name: "Save to cloud",
            callback: () => {
                new Notice("Working!");

            }
        })

    }

    async onunload() {

        // Release any resources configured by the plugin.
        console.log('unloading plugin')

      }


    //save
    private copyFiles(vaultFiles?) {

        console.log(vaultFiles[1])
        //vaultFiles[1].copy()

      }

      
} //end

