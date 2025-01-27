import chalk from 'chalk';
import terminalImage from 'terminal-image';
import fs from 'fs';
import os from 'os';

// Funzione per stampare l'intestazione
function printHeader() {
    console.log(chalk.blue('=========================='));
    console.log(chalk.green('        WhoArt'));
    console.log(chalk.blue('==========================\n'));
}

// Funzione per mostrare l'immagine in ASCII art colorata
async function displayAsciiArt(imagePath) {
    try {
        // Usa terminal-image per generare l'ASCII art
        const image = fs.readFileSync(imagePath);
        const ascii = await terminalImage.buffer(image, { width: 40 }); // Dimensioni personalizzate
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
    await displayAsciiArt('./whoart_avatar.png'); // Percorso immagine
    console.log();
    printSystemInfo();
})();
