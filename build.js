// File: build.js
const fs = require('fs');
const path = require('path');

const directoryPath = '.'; // Folder saat ini
const templatePath = path.join(directoryPath, 'template.html');
const outputPath = path.join(directoryPath, 'index.html');

console.log('🚀 Memulai proses build...');

// 1. Baca semua file di direktori
fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.error('❌ Tidak dapat memindai direktori: ' + err);
    }

    // 2. Filter hanya file .html, dan kecualikan file-file yang tidak diinginkan
    const htmlFiles = files.filter(file => 
        file.endsWith('.html') && 
        file !== 'index.html' && 
        file !== 'template.html'
    );
    
    console.log(`🔎 Ditemukan ${htmlFiles.length} file konten: ${htmlFiles.join(', ')}`);

    // 3. Buat string HTML untuk daftar menu
    let menuLinks = '';
    htmlFiles.forEach(file => {
        const fileName = path.parse(file).name;
        // Membuat nama yang lebih rapi (misal: "panel-utama" -> "Panel Utama")
        const displayName = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); 
        menuLinks += `\n            <li><a href="${file}" target="content-frame">${displayName}</a></li>`;
    });
    
    if (htmlFiles.length > 0) {
        menuLinks += '\n        ';
    }

    // 4. Baca konten dari template.html
    fs.readFile(templatePath, 'utf8', (err, data) => {
        if (err) {
            return console.error('❌ Gagal membaca template.html: ' + err);
        }

        // 5. Ganti placeholder dengan menu yang sudah dibuat
        const finalHtml = data.replace('', menuLinks);

        // 6. Tulis hasilnya ke file index.html (ini akan menimpa file lama jika ada)
        fs.writeFile(outputPath, finalHtml, 'utf8', (err) => {
            if (err) return console.error('❌ Gagal menulis index.html: ' + err);
            console.log('✅ File index.html berhasil dibuat/diperbarui dengan menu otomatis!');
        });
    });
});
