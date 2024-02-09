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
        console.log('loading plugin');

        //ICON
        this.addRibbonIcon("upload-cloud", "AWS Sync", () => {
            //put save function here
            const vaultFiles = this.app.vault.getMarkdownFiles();
            this.uploadToS3(vaultFiles[1], BUCKET_NAME, vaultFiles[1].name)
            // console.log(vaultFiles[1].name);

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

    private async uploadToS3(vaultFiles, bucketName, objName) {

        //setup aws s3
        const s3Client = new S3Client({
            region: REGION,
            credentials: {
                accessKeyId: S3_ACCESS_KEY_ID,
                secretAccessKey: S3_SECRET_ACCESS_KEY,
            },
        });
        
        const params = {
            Bucket: bucketName,
            Key: objName,
            Body: vaultFiles,
          };

          try {
            const command = new PutObjectCommand(params);
            const response = await s3Client.send(command);
            console.log('File uploaded successfully:', response);
          } catch (error) {
            console.error('Error uploading file to S3:', error);
          }
    }


    async onunload() {

        // Release any resources configured by the plugin.
        console.log('unloading plugin');

      }

      
}

