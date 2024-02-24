import { Vault } from 'obsidian';
import { getS3Objects, uploadToS3 } from './s3';
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

    //writes all files from s3 to the vault
    async writeVaultFiles () {
        const pulledFiles = await getS3Objects(BUCKET_NAME, s3Client);
        console.log(pulledFiles);
        for (const obj of pulledFiles) {
            console.log('trying to write', obj.name, '++++',obj.content);
            await this.vault.adapter.write(obj.name, obj.content);
        }
    }

    //uploads all files from the vault to s3
    async uploadeee (vaultFiles) {
        Promise.all(vaultFiles.map(async file => {
            //const content = await this.vault.read(file);
            const content = await this.vault.adapter.read(file.path);
            console.log('content', content);
            return { path: file.path, content };
        })).then(filesWithContent => {
            uploadToS3(filesWithContent, BUCKET_NAME, s3Client);
            console.log('files uploaded');
        });
    }

    async mainSyncButton () {
        const vaultFiles = this.vault.getMarkdownFiles();
        //await this.uploadeee(vaultFiles);
        this.writeVaultFiles();
    }

}