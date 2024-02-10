import { Notice, Plugin } from 'obsidian';
import { BUCKET_NAME, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, REGION } from './credentials';
import { 
    DeleteObjectCommand,
    GetObjectCommand,
    HeadBucketCommand,
    HeadObjectCommand,
    HeadObjectCommandOutput,
    ListObjectsV2Command,
    ListObjectsV2CommandInput,
    S3Client, 
    PutObjectCommand 
} from '@aws-sdk/client-s3';

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

        //ICON button
        this.addRibbonIcon("upload-cloud", "AWS Sync", () => {
            const vaultFiles = this.app.vault.getMarkdownFiles();
            this.uploadToS3(vaultFiles, BUCKET_NAME, s3Client)

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

    private async uploadToS3(vaultFiles, bucketName, s3Client) {
        
        for (let i = 0; vaultFiles.length ; i++) {
            console.log(vaultFiles[i]);
            try {
                const command = new PutObjectCommand(
                    {
                        Bucket: bucketName,
                        Key: vaultFiles[i].path,
                        Body: vaultFiles[i]
                    }
                );
                const response = await s3Client.send(command);
                console.log('File uploaded successfully:', response);
              } catch (error) {
                console.error('Error uploading file to S3:', error);
              }
              
        }
    }


    async onunload() {

        // Release any resources configured by the plugin.
        console.log('unloading plugin');

      }

      
}

