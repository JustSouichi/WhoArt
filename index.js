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

// Funzione per ottenere l'username di GitHub
function getGitHubUsername() {
    try {
        const username = execSync('git config --global user.name', { encoding: 'utf-8' }).trim();
        return username || null;
    } catch (error) {
        console.error(chalk.red('GitHub username not found. Make sure Git is configured.'));
        return null;
    }
}

// Funzione per ottenere l'URL della foto profilo da GitHub
async function getGitHubProfileImage(username) {
    if (!username) {
        console.error(chalk.red('GitHub username is missing.'));
        return null;
    }

    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (response.ok) {
            const data = await response.json();
            return data.avatar_url || null; // Restituisce l'URL dell'immagine profilo
        } else {
            console.error(chalk.red(`GitHub API request failed: ${response.statusText}`));
            return null;
        }
    } catch (error) {
        console.error(chalk.red('Error fetching GitHub profile image:'), error.message);
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
        const buffer = await response.buffer();
        const ascii = await terminalImage.buffer(buffer, { width: 40 }); // Dimensioni personalizzate
        console.log(chalk.cyan(ascii)); // Mostra l'immagine in ciano
    } catch (error) {
        console.error(chalk.red('Error displaying the image:'), error.message);
    }
}

// Funzione per stampare informazioni di sistema
function printSystemInfo() {
    console.log(chalk.yellow('OS:      ') + chalk.white(`${os.type()} ${os.release()}`));
    console.log(chalk.yellow('CPU:     ') + chalk.white(os.cpus()[0].model));
    console.log(chalk.yellow('Memory:  ') + chalk.white(`${Math.round(os.freemem() / 1024 / 1024)} MB Free`));
    console.log(chalk.yellow('Uptime:  ') + chalk.white(`${Math.round(os.uptime() / 60)} minutes`));
    console.log();
}

// Main Function
(async () => {
    printHeader();

    const githubUsername = getGitHubUsername();
    if (githubUsername) {
        console.log(chalk.green(`GitHub Username: ${githubUsername}`));
    }

    const profileImageUrl = await getGitHubProfileImage(githubUsername);
    await displayAsciiArtFromUrl(profileImageUrl);

    console.log();
    printSystemInfo();
})();
