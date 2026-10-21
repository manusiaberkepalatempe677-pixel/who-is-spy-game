# Who Is Spy: Hypper Edition

## Jalankan
    cd server && npm install && npm start      # http://localhost:3000
Buka alamat itu di browser (frontend disajikan server yang sama; jangan buka index.html via file://).

## Status fitur
**Sudah diuji (otomatis, `node test/*.test.js`):** mesin game sampai turnamen 3 pertandingan berhenti tepat di 3; bot hint+voting; buat room, daftar room dari backend, 3 klien join & mulai, kata privat per pemain.
**Sudah ditulis, BELUM diuji di perangkat/browser:** seluruh UI (tampilan portrait Android, ganti bahasa, chat di browser), reconnect nyata, LAN lintas perangkat.
**Belum dibuat:** tutorial, voice chat WebRTC (ditandai belum dikonfigurasi), mute/blokir pemain, reaksi cepat, PWA, volume/efek suara, pengaturan lanjutan, integrasi Suga (placeholder di src/serverConfig.js + NetworkAdapter melempar SUGA_NOT_CONFIGURED), demo single-file offline.

## Mode
- Singleplayer: `src/gameEngine.js` + `src/botAI.js` lokal (Easy/Normal/Hard).
- LAN: jalankan server di satu PC, pemain lain isi `IP:3000` di kolom LAN. Browser tidak bisa menemukan server otomatis (tidak ada broadcast/mDNS); input manual IP:port.
- Room ID / Server List: server Node otoritatif (kata hanya dikirim ke pemilik, validasi, rate limit 10 pesan/detik, room kosong dibersihkan setelah 60 dtk).
- Skor turnamen: warga menang +2 tiap warga, spy menang +4. Setelah match 3: layar juara.

## Deploy online (dua jaringan berbeda)
Deploy folder ini ke host Node.js ber-HTTPS (Render/Railway/VPS + reverse proxy; WebSocket harus aktif). Buka URL yang sama di dua perangkat berbeda jaringan, satu buat room, satu join dengan kode.
Voice butuh HTTPS + signaling + STUN/TURN. Suga: kirim dokumentasi, lalu `NetworkAdapter.connect('suga')` diisi.
