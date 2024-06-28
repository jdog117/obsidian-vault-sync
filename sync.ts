import { Notice, Vault } from "obsidian";
import { getS3Objects, uploadToS3, deleteS3Objects, listS3Objects } from "./s3";
import { S3Client } from "@aws-sdk/client-s3";
import {
    BUCKET_NAME,
    S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY,
    REGION,
} from "./credentials";
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
});

export class Sync {
    private vault: Vault;
    private syncCheckFileName = "lastSyncedBy.json";
    private deviceId = uuidv4();

    constructor(vault: Vault) {
        this.vault = vault;
    }

    private async updateDeviceId() {
        const syncCheckFile = [{ path: this.syncCheckFileName, content: this.deviceId }];
        await uploadToS3(syncCheckFile, BUCKET_NAME, s3Client);
    }

    // checks if another device has synced to the cloud
    public async checkForCollision(){
        const s3Objects = await getS3Objects(BUCKET_NAME, s3Client);
        const syncedByFile = s3Objects.find(obj => obj.name === this.syncCheckFileName);
        
        let localDeviceId: string | null = localStorage.getItem(this.syncCheckFileName);

        if (localDeviceId != null) {
            this.deviceId = localDeviceId;
        } else {
            localStorage.setItem(this.syncCheckFileName, this.deviceId);
        }
        if (syncedByFile?.name === this.syncCheckFileName) { // if file exists
            if (syncedByFile.content != this.deviceId) { // then see if id's match
                new Notice("Warning, your vault is out of sync. Download vault to avoid losing data")
            } else {
                new Notice("Vault is up to date with cloud")
            }
        } else {
            new Notice("Vault needs to be uploaded")
        }
    }

    private async downloadVault() {
        let pulledFiles;

        // s3 dowload
        try {
            pulledFiles = await getS3Objects(BUCKET_NAME, s3Client);
            // console.log(pulledFiles); // for dev
        } catch (error) {
            console.error("Error during downloadVault: ", error);
        }

        // write vault files
        let writeSuccess = true;
        for (const obj of pulledFiles) {
            try {
                await this.vault.adapter.write(obj.name, obj.content);
            } catch (error) {
                console.error(`Error writing file ${obj.name} to the vault: `, error);
                new Notice(`Error writing vault files, check console for more info`);
                writeSuccess = false;
            }
        }
        if (writeSuccess = true) {
            new Notice("Successfully synced vault");
            this.updateDeviceId();
        }
    }

    private async uploadVault(vaultFiles) {
        try {
            const filesWithContent = await Promise.all(
                vaultFiles.map(async (file) => {
                    const content = await this.vault.adapter.read(file.path);
                    return { path: file.path, content };
                })
            );
    
            const response = await uploadToS3(filesWithContent, BUCKET_NAME, s3Client);
            if (response === false) {
                new Notice("Error uploading vault files, check console for more info");
            } else {
                new Notice("Vault successfully uploaded");
            }
        } catch (error) {
            console.error("Error during uploadVault: ", error);
        }

        this.updateDeviceId();
    }

    // removes any files in s3 that arent in the current vault
    private async deleteOldVaultFilesS3(vaultFiles) {
        try {
            const s3Objects = await getS3Objects(BUCKET_NAME, s3Client);

            const vaultFilePaths = vaultFiles.map(file => file.path);
            const filteredObjects = s3Objects.filter(obj => !vaultFilePaths.includes(obj.name) && obj.name !== this.syncCheckFileName);
            const objectsToDelete = filteredObjects.map(obj => ({ Key: obj.name }));

            const deleteSuccess = await deleteS3Objects(BUCKET_NAME, objectsToDelete, s3Client);
            if (!deleteSuccess) {
                new Notice("Error syncing vault, see console for more info");
            }
        } catch (error) {
            console.error("Error during deleteExtraS3Objects: ", error);
        }
    }

    public async pushVault() {
        const vaultFiles = this.vault.getMarkdownFiles();
        await this.uploadVault(vaultFiles);
        await this.deleteOldVaultFilesS3(vaultFiles);
    }

    public async pullVault() {
        await this.downloadVault();
    }
}
