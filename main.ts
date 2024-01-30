import { Notice, Plugin } from 'obsidian';
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
        console.log('loading plugin')

        //ICON
        this.addRibbonIcon("upload-cloud", "AWS Sync", () => {
            //save function here
            const vaultFiles = this.app.vault.getMarkdownFiles();
            this.uploadToS3(vaultFiles, "bucketname","key");

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

    //s3 upload method
    private async uploadToS3(vaultFiles, bucketName, key) {

        //setup aws s3
        const s3Client = new S3Client({
            region: 'MYREGION',
            credentials: {
                accessKeyId: "MYACCESSKEYID",
                secretAccessKey: "MYSECRETACCESSKEY",
            },
        });
        
        const params = {
            Bucket: bucketName,
            Key: key,
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
        console.log('unloading plugin')

      }

      
} //end

