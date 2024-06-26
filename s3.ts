import { Readable } from "stream";
import { Notice } from "obsidian";
import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadBucketCommand,
    HeadObjectCommand,
    HeadObjectCommandOutput,
    ListObjectsV2Command,
    ListObjectsV2CommandInput,
    PutObjectCommand,
} from "@aws-sdk/client-s3";

// uploads an array of vault files (file.md) to the s3 bucket
export async function uploadToS3(vaultFiles, bucketName, s3Client): Promise<boolean> {
    let uploadStatus = true;
    for (const file of vaultFiles) {
        try {
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: file.path,
                Body: file.content,
            });
            const response = await s3Client.send(command);
            console.log("File uploaded successfully:", response);
        } catch (error) {
            console.error("Error uploading file to S3:", error);
            uploadStatus = false;
        }
    }
    return uploadStatus;
}

// returns an array of objects that each contain the name and last modified date of the s3 file
export async function listS3Objects(bucketName, s3Client) {
    const command = new ListObjectsV2Command({ Bucket: bucketName });
    try {
        const response = await s3Client.send(command);
        //console.log("Number of items in the bucket:", response.Contents[0].LastModified);
        return response.Contents;
    } catch (error) {
        console.error("Error downloading file from S3: ", error);
        new Notice("Error downloading vault files, check console for more info");
    }
    // what is returned:
    // {
    //     "Key": "my-image.jpg",
    //     "LastModified": "2020-11-20T20:18:16.000Z",
    //     "ETag": "\"70ee1738b6b21e2c8a43f3a5ab0eee71\"",
    //     "Size": 434234,
    //     "StorageClass": "STANDARD"
    //   }
}

// returns an array of objects that each contain the name and content of the s3 file
export async function getS3Objects(bucketName, s3Client) {
    const pulledFiles: { name: string; content: string }[] = [];
    const objectsList = await listS3Objects(bucketName, s3Client);

    for (const obj of objectsList) {
        //console.log('OBJECT:', obj);
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: obj.Key,
        });
        const response = await s3Client.send(command);
        const fileContent = await streamToString(response.Body);
        //console.log('FILE CONTENT:',fileContent); FOR DEBUG
        pulledFiles.push({ name: obj.Key, content: fileContent });
    }
    //console.log('returned pulled files: ', pulledFiles);
    return pulledFiles;
}

// converts s3 content stream to a string
async function streamToString(
    stream: Readable | ReadableStream | Blob | undefined
): Promise<string> {
    return await new Promise(async (resolve, reject) => {
        if (stream instanceof Readable) {
            const chunks: Uint8Array[] = [];
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("error", reject);
            stream.on("end", () =>
                resolve(Buffer.concat(chunks).toString("utf-8"))
            );
        } else if (stream instanceof ReadableStream) {
            const reader = stream.getReader();
            let result = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                result += new TextDecoder("utf-8").decode(value);
            }
            resolve(result);
        } else if (stream instanceof Blob) {
            const reader = new FileReader();
            reader.onloadend = function () {
                resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsText(stream);
        } else if (stream === undefined) {
            throw new Error(`Stream is undefined: ${stream}`);
        }
    });
}
