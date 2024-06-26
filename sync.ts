import { Notice, Vault } from "obsidian";
import { getS3Objects, uploadToS3 } from "./s3";
import { S3Client } from "@aws-sdk/client-s3";
import {
    BUCKET_NAME,
    S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY,
    REGION,
} from "./credentials";
import { validateHeaderName } from "http";

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

    private async downloadVault() {
        let pulledFiles;

        // s3 dowload
        try {
            pulledFiles = await getS3Objects(BUCKET_NAME, s3Client);
            console.log(pulledFiles); // for dev
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
            new Notice("Successfully synced vault")
        }
    }

    private async uploadVault(vaultFiles) {
        console.log(vaultFiles[1].name)
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
    }

    async pushVault() {
        const vaultFiles = this.vault.getMarkdownFiles();
        await this.uploadVault(vaultFiles);
    }

    async pullVault() {
        await this.downloadVault();
    }
}
