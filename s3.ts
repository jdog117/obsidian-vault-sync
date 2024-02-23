import { Readable } from 'stream';
import { Plugin } from 'obsidian';
import { 
    DeleteObjectCommand,
    GetObjectCommand,
    HeadBucketCommand,
    HeadObjectCommand,
    HeadObjectCommandOutput,
    ListObjectsV2Command,
    ListObjectsV2CommandInput,
    PutObjectCommand
} from '@aws-sdk/client-s3';


export async function uploadToS3(vaultFiles, bucketName, s3Client) {
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

export async function listS3Objects(bucketName, s3Client) {

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

export async function getS3Objects(bucketName, s3Client) {
    const objectsList = await listS3Objects(bucketName, s3Client);
    //console.log('objectsList:', objectsList);
    return objectsList;

    // objectsList.forEach(async (obj) => {
    //     const command = new GetObjectCommand({ Bucket: bucketName, Key: obj.Key });
    //     const response = await s3Client.send(command);
    //     const fileContent = await streamToString(response.Body as Readable);
    //     //console.log(JSON.stringify(fileContent, null, 2)); //DEBUGGING
    //     //writeVaultFiles(obj.Key, fileContent);
    // });
}

async function streamToString (stream: Readable | ReadableStream | Blob | undefined): Promise<string> {
    return await new Promise((resolve, reject) => {
        if (stream instanceof Readable) {
            const chunks: Uint8Array[] = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        } else if (stream instanceof ReadableStream) {
            console.log('stream is readableStream');
            const reader = stream.getReader();
            const chunks: Uint8Array[] = [];
            reader.read().then(function processText({ done, value }) {
                if (done) {
                    resolve(Buffer.concat(chunks).toString('utf-8'));
                    return;
                }
                chunks.push(value);
                return reader.read().then(processText);
            });
        } else if (stream instanceof Blob) {
            const reader = new FileReader();
            reader.onloadend = function() {
                resolve(reader.result as string);
            }
            reader.onerror = reject;
            reader.readAsText(stream);
        } else if (stream === undefined) {
            throw new Error (`Stream is undefined: ${stream}`);
        }
    });
}