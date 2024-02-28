# Obsidian cloud storage and syncing
Plugin for Obsidian writing app which stores current vault in the cloud and syncs across devices.

<img src="img/Screenshot 2024-02-28 125840.png" alt="Banner">

## Features
This plugin saves your current vault files to AWS S3 using the cloud upload button as shown above and can sync files from S3 using the save command.
> Under development

- To upload click cloud button on sidebar after enabling plugin
- To download or sync fvault files in the cloud, use *ctrl + p* and type "save"
- Only supports syncing of one vault currently
- AWS cloud credentials need to be saved in credentials.js

### Features to be implemented
- Use SNS to auto notify/sync other divices of vault changes
- Support multiple vaults
- Add React UI to button for credential saving and cloud access
