import { Vault } from 'obsidian';
import { getS3Objects } from './s3';
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

export class Sync {
    vault: Vault;

    constructor(vault: Vault) {
        this.vault = vault;
    }

    async writeVaultFiles () {
        const pulledFiles = await getS3Objects(BUCKET_NAME, s3Client);
        for (const obj of pulledFiles) {
            console.log('trying to write', obj.name);
            this.vault.adapter.write(obj.name, obj.content);
        }
    }

    mainSyncButton () {
        this.writeVaultFiles();
    }

}