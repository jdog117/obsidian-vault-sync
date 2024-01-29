import { Notice, Plugin } from 'obsidian';

export interface DataAdapter {
    copy(normalizedPath: string, normalizedNewPath: string);
    //copy(normalizedPath: "TODO.md", normalizedNewPath: "C:\\Users\\jspca\\Desktop\\");
}

export default class Sync extends Plugin implements DataAdapter{

    //implement copy method from DataAdapter implementation
    copy(normalizedPath: string, normalizedNewPath: string): void {
    }

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
    private copyFiles(vaultFiles?) {

        console.log(vaultFiles[1])
        //vaultFiles[1].copy()
        
        this.copy("~\TODO.md", "C:/Users/jspca/Desktop/TODO.md");

      }

      
} //end

