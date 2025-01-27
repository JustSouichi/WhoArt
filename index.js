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
                name: data.name,
                username: data.login,
                bio: data.bio,
                publicRepos: data.public_repos,
                followers: data.followers,
                avatar_url: data.avatar_url
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

// Funzione per mostrare l'immagine in ASCII art colorata
async function displayAsciiArtFromUrl(imageUrl) {
    try {
        if (!imageUrl) {
            console.error(chalk.red('No image URL provided.'));
            return;
        }

        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer(); // Usa arrayBuffer invece di buffer
        const ascii = await terminalImage.buffer(Buffer.from(buffer), { width: 40 }); // Convertiamo arrayBuffer in Buffer
        console.log(chalk.cyan(ascii)); // Mostra l'immagine in ciano
    } catch (error) {
        console.error(chalk.red('Error displaying the image:'), error.message);
    }
}

// Funzione per stampare le informazioni dell'utente di GitHub
function printGitHubUserInfo(userInfo) {
    if (userInfo) {
        console.log(chalk.yellow('Name:      ') + chalk.white(userInfo.name || 'Not provided'));
        console.log(chalk.yellow('Username:  ') + chalk.white(userInfo.username));
        console.log(chalk.yellow('Bio:       ') + chalk.white(userInfo.bio || 'No bio available'));
        console.log(chalk.yellow('Public Repos: ') + chalk.white(userInfo.publicRepos));
        console.log(chalk.yellow('Followers: ') + chalk.white(userInfo.followers));
        console.log();
    }
}

// Main Function
(async () => {
    printHeader();

    const userInfo = getGitHubUsernameOrEmail();
    if (userInfo) {
        console.log(chalk.green(`GitHub ${userInfo.type === 'username' ? 'Username' : 'Email'}: ${userInfo[userInfo.type]}`));
    }

    const githubUserDetails = await getGitHubUserInfo(userInfo?.[userInfo.type], userInfo?.type);
    printGitHubUserInfo(githubUserDetails);

    const profileImageUrl = githubUserDetails?.avatar_url;
    await displayAsciiArtFromUrl(profileImageUrl);

    console.log();
})();
