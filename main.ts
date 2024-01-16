import { Plugin } from 'obsidian';

export default class AWSSync extends Plugin {

    async onLoad() {
        // Configure resources needed by the plugin.
        console.log('loading plugin')
        const openFile = this.app.workspace.getActiveFile();
        if(openFile) {
            console.log(openFile.name)
            console.log(openFile.path)
            //console.log(openFile.stat.mtime)
        }
    }

    async onunload() {
        // Release any resources configured by the plugin.
        console.log('unloading plugin')
      }

}