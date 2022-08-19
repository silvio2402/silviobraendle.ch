---
layout: ../../layouts/post.astro
title: Signing Git Commits
client: Self
publishDate: 2022-08-14 00:00:00
img: /assets/signing-git-commits/github-commits-verified.png
description: |
  Quickstart guide for signing git commits.
tags:
  - instructions
---

## Quickstart Guide

### Generating a new GPG key

If you want to sign your git commits, you will need a GPG certificate. It is possible to sign commits using S/MIME certificates, but I won't go into that in this post.

**If you're using Windows**, install [GPG4Win](https://www.gpg4win.org/) first.

1. Open Bash (PowerShell on Windows) and run the following command to guide you through the process of generating a GPG key pair:

   ```bash
   gpg --full-generate-key
   ```

2. Choose the kind of key as `RSA and RSA` by typing `1` and hitting Enter.

3. Choose the keysize of `4096` which is required.

4. Specify the validity duration. One year is typically adequate, however, I chose it not to expire anyways.

5. Enter your name and email address. Make sure you use the **same email address** as of your GitHub or GitLab account if you want to use them.

6. Choose a secure passphrase! It's also good security practise to generate and store your passwords in a password manager like I do.

### Adding the GPG key to your GitHub/GitLab Account

If you want your commits to show as "Verified", you will have to give GitHub or GitLab your GPG public key. No need to worry though, it is pretty easy to do and they won't have your secret private key.

1. List the GPG key IDs in the long format with this command:

   ```bash
   gpg --list-secret-keys --keyid-format=long
   ```

2. Copy the ID of the GPG key you want to use. It is a 16-character hexadecimal (0-9, A-F) ID, which comes after `rsa4096/`.

3. Export the public key with the command below after changing "`<GPG Key ID>`" with the previously copied ID.

   ```bash
   gpg --armor --export <GPG Key ID>
   ```

4. Copy your public key from the output of the last command, starting with `-----BEGIN PGP PUBLIC KEY BLOCK-----` and ending with `-----END PGP PUBLIC KEY BLOCK-----`.

5. Follow the GitHub or GitLab docs for adding a GPG Key to your account:<br>
   [GitHub Docs: Adding a GPG key](https://docs.github.com/en/authentication/managing-commit-signature-verification/adding-a-gpg-key-to-your-github-account#adding-a-gpg-key)<br>
   [GitLab Docs: Add a GPG key to your account](https://docs.gitlab.com/ee/user/project/repository/gpg_signed_commits/#add-a-gpg-key-to-your-account)

### Configuring Git to Sign Commits

1. First, tell Git with which GPG key it should sign your commits. Copy the GPG Key ID like in Section 1-2 of [Adding the GPG key to your GitHub/GitLab Account](#adding-the-gpg-key-to-your-githubgitlab-account). Then, run this command to configure GPG Key ID for Git after changing "`<GPG Key ID>`" with the previously copied ID.

   ```bash
   git config --global user.signingkey <GPG Key ID>
   ```

2. Configure the GPG path for Git:
   For **Windows**:
   If your path of Gpg4win differs, adjust it.

   ```bash
   git config --global --unset gpg.program
   git config --global gpg.program 'C:\Program Files (x86)\GnuPG\bin\gpg.exe'
   ```

   For **Linux**:
   Make sure to replace "`/usr/bin/gpg`" with the path which the `which` command returned.

   ```bash
   which gpg
   git config --global --unset gpg.program
   git config --global gpg.program '/usr/bin/gpg'
   ```

3. You can configure Git to sign commits by default using this command. If you only want to sign commits in the current repo, you can remove the `--global` flag.

   ```bash
   git config --global commit.gpgsign true
   ```

   **Alternatively**, you can manually enable signing a commit by always adding the `-S` flag to your `git commit` command:

   ```bash
   git commit -S -m "Hello World!"
   ```

   When creating a signed commit you might have to provide the passphrase you set earlier.

4. Check if it worked. After you created a new commit, you can run this command to display the signature of the last commit:

   ```bash
   git log --show-signature -1
   ```

   If the commit was signed, you should see three lines starting with `gpg:`. This example is a commit I made:

   ```txt
   commit cbb227e26bf98e1fc341b26531a722ef57ec340d (HEAD -> master, origin/master, origin/HEAD)
   gpg: Signature made Sun Aug 14 21:58:08 2022 CEST
   gpg:                using RSA key 72F10F569126B3E32ABDC98C553A5A37BA69D8AE
   gpg: Good signature from "Silvio Brändle <silvio@silviobraendle.ch>" [ultimate]
   Author: Silvio Brändle <silvio@silviobraendle.ch>
   Date:   Sun Aug 14 21:58:08 2022 +0200

       Post: Querying WHOIS/RDAP servers
   ```

### Signing Commits in Visual Studio Code (VSCode)

1. Open VSCode Settings. `CTRL+,`

2. Select "User" or "Workspace" settings. Choose "User" if you always want VSCode to sign your commits. If you only want to sign commits in the current workspace, you can choose "Workspace".
   <img alt="VSCode Settings Choose User or Workspace" src="/assets/signing-git-commits/vs-code-settings-user-workspace.png">

3. Enable Commit Signing. You can find this setting under `Extensions > Git`.
   <img alt="Enable Commit Signing" src="/assets/signing-git-commits/vs-code-settings-enable-commit-signing.png">
   When you now commit from VSCode, your commits will be signed by default.

#### Signing Commits in VSCode connected to Windows Subsystem for Linux (WSL)

When you're connected to WSL from VSCode, you won't be able to sign commits by default. You would be faced with the `error: gpg failed to sign the data` error, even if you have the GPG keys in WSL and configured Git like you would on normal Linux.
This is because the passphrase prompt won't be shown on your Windows system through WSL, resulting in failing to sign the commit. Follow the steps for [Configuring Commit Signing in WSL](#configuring-commit-signing-in-windows-subsystem-for-linux-wsl).

### Configuring Commit Signing in Windows Subsystem for Linux (WSL)

1. Open a WSL bash. You can open PowerShell and type `wsl` to do that.

2. Run this command to configure the `GPG_TTY` environment variable:

   ```bash
   export GPG_TTY=$(tty)
   ```

3. Configure Git to always sign commits:

   ```bash
   git config --global commit.gpgsign true
   ```

4. Configure the GPG program path for Git. First, find the path where gpg is installed.

   ```bash
   which gpg
   ```

   Then, configure the path of GPG for Git. Replace `/usr/bin/gpg` with the path where gpg is installed from the previous command.

   ```bash
   git config --global --unset gpg.program
   git config --global --add gpg.program /usr/bin/gpg
   ```

5. Create or edit the `gpg-agent.conf` file using nano:

   ```bash
   nano ~/.gnupg/gpg-agent.conf
   ```

6. Add this line to the file. If your path of Gpg4win differs, adjust it.

   ```conf
   pinentry-program "/mnt/c/Program Files (x86)/Gpg4win/bin/pinentry-basic.exe"
   ```

   Source: [stackoverflow: No GPG passphrase prompt...](https://stackoverflow.com/a/68689405/9914232)

7. Finally, reload `gpg-connect-agent` with this command:
   ```bash
   gpg-connect-agent reloadagent /bye
   ```

After completing these steps, you should be able to commit in VSCode connected to WSL and you will see the passphrase entry popup. Note: You might have to update your graphics driver to get it working.

<img alt="GPG Pinentry Prompt" src="/assets/signing-git-commits/gpg-pinentry-prompt.png">
