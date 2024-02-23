import { Vault } from 'obsidian';
import { listS3Objects, getS3Objects } from './s3';
import { S3Client } from '@aws-sdk/client-s3';
import { BUCKET_NAME, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, REGION } from './credentials';

       //setup s3 client
       const s3Client = new S3Client({
        region: REGION,
        credentials: {
            accessKeyId: S3_ACCESS_KEY_ID,
            secretAccessKey: S3_SECRET_ACCESS_KEY,
        },
    });
    const fileContent = getS3Objects(BUCKET_NAME, s3Client);
    //make sure this is getting an array or somtin

export class Sync {
    vault: Vault;

    constructor(vault: Vault) {
        this.vault = vault;
    }
    writeVaultFiles (filePath: string, fileContent: string) {
        this.vault.adapter.write(filePath, fileContent);
      }
}