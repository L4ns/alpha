const puppeteer = require('puppeteer');
const { privateKey, walletAddress } = require('./credentials');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Fungsi untuk login ke AlphaBot
    async function loginToAlphaBot() {
        await page.goto('https://www.alphabot.app/login', { waitUntil: 'networkidle2' });

        // Temukan dan isi private key dan wallet address fields
        await page.type('input[name="privateKey"]', privateKey);
        await page.type('input[name="walletAddress"]', walletAddress);
        await page.click('button[type="submit"]');

        // Tunggu hingga login selesai
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    // Fungsi untuk melakukan auto spin
    async function autoSpinWheel() {
        await page.goto('https://www.alphabot.app/boost', { waitUntil: 'networkidle2' });

        while (true) {
            try {
                // Cari tombol spin dan klik
                await page.waitForSelector('#spin-button', { visible: true });
                await page.click('#spin-button');

                // Tunggu hingga spin selesai (sesuaikan waktu tunggu jika perlu)
                await page.waitForTimeout(5000); // Tunggu 5 detik

                // Cek hasil spin
                const resultMessage = await page.$eval('#result-message', el => el.textContent);
                console.log(getColoredResult(resultMessage));

                // Tambahkan logika tambahan di sini jika diperlukan, misalnya memeriksa pesan hasil
                if (resultMessage.includes('Congratulations')) {
                    console.log('\x1b[34mCongratulations! You have won!\x1b[0m'); // Pesan warna biru untuk kemenangan besar
                    break;
                }

            } catch (e) {
                console.error(`Terjadi kesalahan: ${e.message}`);
                break;
            }
        }
    }

    // Fungsi untuk memberi warna pada hasil spin
    function getColoredResult(resultMessage) {
        if (resultMessage.includes('Win')) {
            return `\x1b[32m${resultMessage}\x1b[0m`; // Warna hijau untuk kemenangan
        } else if (resultMessage.includes('Lose')) {
            return `\x1b[31m${resultMessage}\x1b[0m`; // Warna merah untuk kekalahan
        } else {
            return resultMessage; // Warna default untuk hasil lainnya
        }
    }

    try {
        // Lakukan login
        await loginToAlphaBot();

        // Mulai proses auto spin
        await autoSpinWheel();
    } catch (e) {
        console.error(`Terjadi kesalahan: ${e.message}`);
    } finally {
        // Tutup browser
        await browser.close();
    }
})();
