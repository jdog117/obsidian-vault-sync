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

        //iocn button > upload
        this.addRibbonIcon("upload-cloud", "AWS Sync", () => {
            const vaultFiles = this.app.vault.getMarkdownFiles();
            //this.uploadToS3(vaultFiles, BUCKET_NAME, s3Client)
            const s3ObjectList = this.listS3Objects(BUCKET_NAME, s3Client)
            .then(s3ObjectList => {
                console.log(s3ObjectList);
            });
            // console.log(s3ObjectList);

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

    async uploadToS3(vaultFiles, bucketName, s3Client) {
        
        //uploads all files in the vault to s3
        for (let i = 0; i < vaultFiles.length; i++) {
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

    async listS3Objects(bucketName, s3Client) {

        const command = new ListObjectsV2Command({ Bucket: bucketName });
        try {
            const response = await s3Client.send(command);
            //console.log("Number of items in the bucket:", response.Contents[0].LastModified);
            return response.Contents; 
        } catch (error) {
            console.error('Error downloading file from S3:', error);
            return null;
        }
        // {
        //     "Key": "my-image.jpg",
        //     "LastModified": "2020-11-20T20:18:16.000Z",
        //     "ETag": "\"70ee1738b6b21e2c8a43f3a5ab0eee71\"",
        //     "Size": 434234,
        //     "StorageClass": "STANDARD"
        //   }
    }

    // async getS3Objects(bucketName, s3Client) {
    //     const objectsList = this.listS3Objects(bucketName, s3Client);
    //     objectsList.contents.forEach((item) => {
    //         console.log(item);
    //     }

    //     const command = new GetObjectCommand({ Bucket: bucketName });
    //     try {
    //         const response = await s3Client.send(command);
    //         console.log("Number of items in the bucket:", response);
    //         return response;
    //     } catch (error) {
    //         console.error('Error downloading file from S3:', error);
    //         return null;
    //     }
    // }


    async onunload() {

        // Release any resources configured by the plugin.

      }

      
}

