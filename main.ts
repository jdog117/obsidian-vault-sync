import { Plugin } from 'obsidian';

export default class Sync extends Plugin {

    async onload() {
        console.log('loading plugin')
        const openFile = this.app.vault.getFiles();
        if(openFile) {
            console.log(openFile)
        }
    }

    async onunload() {
        // Release any resources configured by the plugin.
        console.log('unloading plugin')
      }

}