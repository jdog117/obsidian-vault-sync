import { Vault } from "obsidian";
import { getS3Objects, uploadToS3 } from "./s3";
import { S3Client } from "@aws-sdk/client-s3";
import {
    BUCKET_NAME,
    S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY,
    REGION,
} from "./credentials";

//setup s3 client
const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
});

interface IVault {
    adapter: {
        write: (name: string, content: any) => Promise<void>;
        read: (path: string) => Promise<any>;
    };
}

interface IStorageClient {
    getObjects: (bucketName: string) => Promise<any>;
    upload: (filesWithContent: any, bucketName: string) => void;
}

// adapter for vault interface
class VaultAdapter implements IVault {
    adapter: {
        write: (name: string, content: any) => Promise<void>;
        read: (path: string) => Promise<any>;
    };

    constructor(private vault: Vault) {
        this.adapter = {
            write: (name: string, content: any) =>
                vault.adapter.write(name, content),
            read: (path: string) => vault.adapter.read(path),
        };
    }
}

// adapter for storage interface
class S3ClientAdapter implements IStorageClient {
    getObjects: (bucketName: string) => Promise<any>;
    upload: (filesWithContent: any, bucketName: string) => void;

    constructor(private s3Client: S3Client) {
        this.getObjects = (bucketName: string) =>
            getS3Objects(bucketName, s3Client);
        this.upload = (filesWithContent: any, bucketName: string) =>
            uploadToS3(filesWithContent, bucketName, s3Client);
    }
}

export class Sync {
    vault: IVault;
    storageClient: IStorageClient;

    constructor(vault: IVault, storageClient: IStorageClient) {
        this.vault = vault;
        this.storageClient = storageClient;
    }

    async writeVaultFiles() {
        const pulledFiles = await this.storageClient.getObjects(BUCKET_NAME);
        console.log(pulledFiles);
        for (const obj of pulledFiles) {
            await this.vault.adapter.write(obj.name, obj.content);
        }
    }

    async uploadVault(vaultFiles) {
        Promise.all(
            vaultFiles.map(async (file) => {
                const content = await this.vault.adapter.read(file.path);
                console.log("content", content);
                return { path: file.path, content };
            })
        ).then((filesWithContent) => {
            this.storageClient.upload(filesWithContent, BUCKET_NAME);
        });
    }

    async mainSyncButton(vaultFiles) {
        // create save logic, only use upload or wite once at a time for now
        await this.uploadVault(vaultFiles);
        await this.writeVaultFiles();
    }
}

const vault = new VaultAdapter(new Vault());
const storageClient = new S3ClientAdapter(s3Client);

const sync = new Sync(vault, storageClient);
