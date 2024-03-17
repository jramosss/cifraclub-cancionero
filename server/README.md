# Cifraclub PDF generator

If you are a musician, you probably know the website [Cifraclub](https://www.cifraclub.com/). It is a great website to find chords and tabs for your favorite songs. However, if you want to have all your songs in one place, you'll have to go through the process of downloading every song individually. This can be a very time-consuming process. This is why I created this script. It will download all songs from your list and save them in a PDF file.

## How to use
- Install requirements
- Install [wkhtmltopdf](https://wkhtmltopdf.org/) 
    - On Ubuntu: `sudo apt-get install wkhtmltopdf`
    - On Windows: Download the installer from the website
    - On Mac: `brew install homebrew/cask/wkhtmltopdf`
- Run the script and insert any list of songs from the website. For example: `https://www.cifraclub.com/musico/551928421/repertorio/favoritas/`
    - The script wont check if the URL is valid, i'm lazy