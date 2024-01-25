import { Notice, Plugin } from 'obsidian';
require('dotenv').config();

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
console.log(accessKeyId)

export default class Sync extends Plugin {

    async onload() {
        console.log('loading plugin')

        this.addRibbonIcon("upload-cloud", "AWS Sync", () => {
            //save function here
            this.copyFiles

        })

        this.addCommand({
            id:"save",
            name: "Save to cloud",
            callback: () => {
                new Notice("Working!");
                //can bind commands to keyboard shortcut

                //If you want checking peek below
                //https://www.youtube.com/live/Hn-ozsctckQ?si=G9oLYFirOOzDJ2WC
            }
        })

    }

    async onunload() {
        // Release any resources configured by the plugin.
        console.log('unloading plugin')
      }


      //save
      copyFiles() {
        console.log("burv")
        const getVaultFiles = this.app.vault.getFiles();
        if(getVaultFiles) {
            console.log(getVaultFiles)
        }

      }
}