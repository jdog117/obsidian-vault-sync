import { Notice, Plugin } from 'obsidian';
import { BUCKET_NAME, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, REGION } from './credentials';
import { S3Client } from '@aws-sdk/client-s3';
import { listS3Objects, getS3Objects } from './s3';

export default class Sync extends Plugin {

    async onload() {
        console.log('loading successful');

        //setup s3 client
        const s3Client = new S3Client({
            region: REGION,
            credentials: {
                accessKeyId: S3_ACCESS_KEY_ID,
                secretAccessKey: S3_SECRET_ACCESS_KEY,
            },
        });

        //iocn button > upload
        this.addRibbonIcon("upload-cloud", "AWS Sync", () => {
            const vaultFiles = this.app.vault.getMarkdownFiles();
            //this.uploadToS3(vaultFiles, BUCKET_NAME, s3Client)
            // const s3ObjectList = listS3Objects(BUCKET_NAME, s3Client)
            // .then(s3ObjectList => {
            //     console.log(s3ObjectList);
            // });
            getS3Objects(BUCKET_NAME, s3Client);
            console.log('donloading done');

        })

        //COMMAND
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

      }

      
}

