#!/usr/bin/env node

import chalk from 'chalk';
import terminalImage from 'terminal-image';
import fs from 'fs';
import os from 'os';
import { execSync } from 'child_process';
import fetch from 'node-fetch';

// Funzione per stampare l'intestazione
function printHeader() {
    console.log(chalk.blue('=========================='));
    console.log(chalk.green('        WhoArt'));
    console.log(chalk.blue('==========================\n'));
}

// Funzione per ottenere l'username GitHub o l'email configurata con Git
function getGitHubUsernameOrEmail() {
    try {
        const username = execSync('git config --global user.name', { encoding: 'utf-8' }).trim();
        if (username) return { username, type: 'username' };
    } catch {
        console.warn(chalk.yellow('GitHub username not found.'));
    }

    try {
        const email = execSync('git config --global user.email', { encoding: 'utf-8' }).trim();
        if (email) return { email, type: 'email' };
    } catch {
        console.error(chalk.red('GitHub email not found. Make sure Git is configured.'));
    }

    return null;
}

// Funzione per convertire l'email in un possibile username (estrapolando la parte prima di "@")
function convertEmailToUsername(email) {
    if (email && email.includes('@')) {
        return email.split('@')[0];
    }
    return null;
}

// Funzione per ottenere i dettagli dell'utente GitHub
async function getGitHubUserInfo(identifier, type) {
    if (!identifier) {
        console.error(chalk.red('GitHub username or email is missing.'));
        return null;
    }

    const username = type === 'email' ? convertEmailToUsername(identifier) : identifier;

    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (response.ok) {
            const data = await response.json();
            return {
                username: data.login,
                bio: data.bio,
                publicRepos: data.public_repos,
                followers: data.followers,
                avatar_url: data.avatar_url,
                gists: data.public_gists,  // Nuovo dato
                profile_url: data.html_url  // Link al profilo GitHub
            };
        } else {
            console.error(chalk.red(`GitHub API request failed: ${response.statusText}`));
            return null;
        }
    } catch (error) {
        console.error(chalk.red('Error fetching GitHub user info:'), error.message);
        return null;
    }
}

// Funzione per migliorare la qualità dell'immagine ASCII e ridurre la dimensione visiva
async function displayAsciiArtFromUrl(imageUrl) {
    try {
        if (!imageUrl) {
            console.error(chalk.red('No image URL provided.'));
            return;
        }

        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer(); // Usa arrayBuffer invece di buffer
        const image = Buffer.from(buffer);

        // Risoluzione maggiore, ma visibile compatta
        const ascii = await terminalImage.buffer(image, { width: 40, height: 20 }); // Immagine più piccola ma dettagliata

        // Usa una gamma più ricca di caratteri per migliorare la qualità
        const highQualityAscii = ascii.replace(/@/g, 'M').replace(/#/g, '%').replace(/o/g, '#').replace(/\./g, '.');
        
        return highQualityAscii; // Restituiamo l'immagine in ASCII per il layout
    } catch (error) {
        console.error(chalk.red('Error displaying the image:'), error.message);
    }
}

// Funzione per stampare le informazioni dell'utente di GitHub
function printGitHubUserInfo(userInfo) {
    if (userInfo) {
        return `
${chalk.hex('#FFD700')('GitHub Username:')} ${chalk.white(userInfo.username)}
${chalk.hex('#FFD700')('Bio:')} ${chalk.white(userInfo.bio || 'No bio available')}
${chalk.hex('#FFD700')('Public Repos:')} ${chalk.white(userInfo.publicRepos)}
${chalk.hex('#FFD700')('Followers:')} ${chalk.white(userInfo.followers)}
${chalk.hex('#FFD700')('Public Gists:')} ${chalk.white(userInfo.gists)}
${chalk.hex('#FFD700')('Profile URL:')} ${chalk.white(userInfo.profile_url)}
`;
    }
    return '';
}

// Funzione per stampare le informazioni affiancate
async function printSideBySide() {
    const userInfo = getGitHubUsernameOrEmail();
    if (userInfo) {
        console.log(chalk.green(`GitHub ${userInfo.type === 'username' ? 'Username' : 'Email'}: ${userInfo[userInfo.type]}`));
    }

    const githubUserDetails = await getGitHubUserInfo(userInfo?.[userInfo.type], userInfo?.type);
    const profileImageUrl = githubUserDetails?.avatar_url;
    const asciiImage = await displayAsciiArtFromUrl(profileImageUrl);
    const userInfoText = printGitHubUserInfo(githubUserDetails);

    // Stampa affiancata
    if (asciiImage && userInfoText) {
        const lines = asciiImage.split('\n');
        const userInfoLines = userInfoText.split('\n');

        // Stampa l'immagine a sinistra e le informazioni a destra
        lines.forEach((line, index) => {
            // Manteniamo le righe con dimensioni simili
            const lineText = userInfoLines[index] || '';
            console.log(`${line}   ${lineText}`);
        });
    }
}

// Main Function
(async () => {
    printHeader();
    await printSideBySide();
})();
