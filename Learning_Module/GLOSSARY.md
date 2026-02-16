# Glosarium: Terminologi Solana

Panduan referensi cepat untuk istilah-istilah teknis yang digunakan dalam modul pembelajaran Solana ini.

## A

**Account (Akun)**
Unit penyimpanan data dasar di Solana. Setiap akun memiliki alamat unik, saldo SOL, dan dapat menyimpan data arbitrer. Akun dimiliki oleh program dan hanya program pemilik yang dapat memodifikasi datanya.

**Account Model (Model Akun)**
Arsitektur Solana di mana semua state disimpan dalam akun. Berbeda dengan model berbasis kontrak Ethereum, program Solana stateless dan semua data disimpan dalam akun terpisah.

**Address Tree**
Struktur data Merkle tree yang menyimpan alamat terkompresi untuk memastikan keunikan alamat dalam sistem ZK Compression.

**ADL (Auto-Deleveraging)**
Mekanisme di exchange perpetual futures di mana posisi profitable dipaksa ditutup untuk menutupi kerugian dari posisi yang dilikuidasi ketika insurance fund tidak cukup.

**AI Agent**
Sistem software otonom yang dapat memahami input, membuat keputusan, dan mengeksekusi operasi blockchain atas nama pengguna menggunakan model AI seperti GPT-4 atau Claude.

**AMM (Automated Market Maker)**
Protokol DeFi yang menggunakan formula matematika untuk menentukan harga aset dan memfasilitasi perdagangan tanpa order book tradisional. Contoh: Uniswap, Raydium.

**Anchor**
Framework pengembangan untuk program Solana yang menyediakan abstraksi tingkat tinggi, keamanan built-in, dan pengalaman developer yang lebih baik. Mengurangi boilerplate code dan mencegah kerentanan umum.

**Associated Token Account (ATA)**
Token account dengan alamat yang diturunkan secara deterministik dari wallet address dan mint address. Memudahkan pencarian token account untuk kombinasi wallet-token tertentu.

**ATA**
Lihat Associated Token Account.

## B

**Berkeley Packet Filter (BPF)**
Format bytecode yang digunakan oleh program Solana. Program dikompilasi ke BPF dan dieksekusi oleh runtime Solana.

**Blockhash**
Hash unik dari block tertentu, digunakan dalam transaksi untuk mencegah duplikasi dan memastikan transaksi diproses dalam jangka waktu tertentu.

**Borsh**
Binary Object Representation Serializer for Hashing - format serialisasi yang digunakan untuk menyimpan dan membaca data account di program Solana.

## C

**Chainlink**
Jaringan oracle terdesentralisasi yang menyediakan data off-chain ke smart contracts. Digunakan untuk price feeds di aplikasi DeFi Solana.

**Commitment Level**
Tingkat konfirmasi untuk transaksi: processed (terbaru), confirmed (mayoritas cluster), finalized (tidak dapat di-rollback).

**Compressed Account**
Account yang menggunakan ZK Compression untuk menyimpan data sebagai calldata di ledger, menghilangkan kebutuhan rent-exemption sambil mempertahankan keamanan L1.

**Compute Units (Unit Komputasi)**
Ukuran sumber daya komputasi yang digunakan oleh transaksi. Setiap transaksi memiliki batas compute units untuk mencegah penyalahgunaan.

**CPI (Cross-Program Invocation)**
Mekanisme di mana satu program Solana dapat memanggil instruksi dari program lain. Memungkinkan komposabilitas dan interaksi antar program.

## D

**Data Anchoring**
Proses menyimpan hash data IoT atau sensor di blockchain Solana untuk membuktikan integritas dan timestamp data tanpa menyimpan seluruh data on-chain.

**Deep Link**
URL khusus yang membuka aplikasi mobile langsung ke halaman atau fungsi tertentu, digunakan dalam Solana Pay untuk memicu transaksi dari aplikasi lain.

**DePIN (Decentralized Physical Infrastructure Networks)**
Jaringan infrastruktur fisik terdesentralisasi yang mengintegrasikan perangkat keras dan IoT dengan blockchain untuk membangun sistem dunia nyata yang terdesentralisasi.

**Devnet**
Jaringan pengembangan Solana untuk testing. Token tidak memiliki nilai nyata dan dapat diperoleh gratis melalui faucet.

## E

**Epoch**
Periode waktu di Solana (sekitar 2-3 hari) di mana schedule validator tetap konstan. Digunakan untuk staking rewards dan rotasi validator.

**Expo**
Framework dan platform untuk membangun aplikasi React Native dengan tooling yang disederhanakan. Menyediakan template untuk aplikasi Solana mobile.

## F

**Faucet**
Layanan yang memberikan token gratis di devnet atau testnet untuk tujuan pengembangan dan testing.

**Funding Rate**
Pembayaran periodik antara trader long dan short di perpetual futures untuk menjaga harga kontrak tetap dekat dengan harga spot.

**Fuzzing**
Teknik testing keamanan yang secara otomatis menghasilkan input acak untuk menemukan bug dan kerentanan. Trident adalah framework fuzzing untuk program Solana.

## G

**Groth16**
Sistem zero-knowledge proof berbasis pairing yang digunakan dalam ZK Compression untuk memverifikasi Merkle proofs dengan ukuran konstan 128 byte.

## H

**Hash-Based Signature**
Skema signature kriptografi yang menggunakan fungsi hash dan aman terhadap serangan komputer kuantum. Contoh: Winternitz One-Time Signature.

## I

**Initial Margin (IM)**
Jumlah minimum collateral yang diperlukan untuk membuka posisi leverage di perpetual futures atau margin trading.

**Instruction (Instruksi)**
Unit operasi dasar dalam transaksi Solana. Setiap instruksi memanggil program tertentu dengan data dan akun yang diperlukan.

**IoT (Internet of Things)**
Jaringan perangkat fisik yang terhubung ke internet, dapat mengumpulkan dan bertukar data. Dalam konteks Solana, IoT devices dapat berinteraksi dengan blockchain.

## K

**Keypair**
Pasangan public key dan private key yang digunakan untuk mengidentifikasi dan menandatangani transaksi di Solana.

## L

**Lamport**
Unit terkecil SOL. 1 SOL = 1,000,000,000 lamports (1 miliar lamports).

**LangGraph**
Framework untuk membangun aplikasi multi-agent menggunakan graph-based workflows, sering digunakan dengan LangChain untuk AI agents di Solana.

**Leverage**
Kemampuan untuk mengontrol posisi yang lebih besar dari collateral yang dimiliki. Contoh: leverage 10x berarti $100 collateral dapat mengontrol posisi $1000.

**liboqs**
Library open-source untuk algoritma kriptografi post-quantum, digunakan dalam implementasi quantum-resistant signatures di Solana.

**Light Protocol**
Protokol untuk transaksi yang menjaga privasi di Solana menggunakan zero-knowledge proofs dan compressed state.

**Liquidation**
Penutupan paksa posisi trading ketika margin tidak mencukupi untuk menutupi kerugian potensial.

**Liquidity Pool**
Kumpulan token yang dikunci dalam smart contract untuk memfasilitasi trading di AMM. Liquidity providers menyediakan token dan mendapat fee dari trades.

**LLM (Large Language Model)**
Model AI besar seperti GPT-4 atau Claude yang dapat memahami dan menghasilkan teks natural language, digunakan sebagai "otak" AI agents.

**LoRaWAN (Long Range Wide Area Network)**
Protokol komunikasi jarak jauh untuk IoT devices dengan konsumsi daya rendah, dapat diintegrasikan dengan Solana untuk aplikasi DePIN.

## M

**Mainnet**
Jaringan produksi Solana di mana transaksi nyata terjadi dan token memiliki nilai ekonomi riil.

**Maintenance Margin (MM)**
Jumlah minimum collateral yang harus dipertahankan untuk menjaga posisi leverage tetap terbuka. Jika equity turun di bawah MM, posisi akan dilikuidasi.

**Margin**
Collateral yang diperlukan untuk membuka dan mempertahankan posisi leverage di trading.

**Mark Price**
Harga fair yang digunakan untuk menghitung unrealized PnL dan menentukan liquidation, biasanya berdasarkan oracle price untuk mencegah manipulasi.

**MCP (Model Context Protocol)**
Protokol untuk mengintegrasikan AI agents dengan berbagai sumber data dan layanan, termasuk blockchain Solana.

**Merkle Tree**
Struktur data pohon di mana setiap leaf node adalah hash dari data, dan setiap non-leaf node adalah hash dari child nodes-nya. Digunakan untuk verifikasi data yang efisien.

**Mint**
Account yang menyimpan metadata token SPL, termasuk supply, decimals, dan mint authority. Juga merujuk pada proses membuat token baru.

**Mobile Wallet Adapter (MWA)**
Protokol yang memungkinkan aplikasi mobile untuk terhubung dengan wallet Solana dan meminta signature transaksi.

## N

**Nullifier**
Nilai unik yang digunakan dalam sistem privasi untuk mencegah double-spending tanpa mengungkapkan identitas transaksi asli.

## O

**Oracle**
Layanan yang menyediakan data off-chain (seperti harga aset) ke smart contracts on-chain. Contoh: Chainlink, Pyth Network.

**Overflow**
Kondisi error ketika hasil operasi aritmatika melebihi nilai maksimum yang dapat disimpan dalam tipe data. Dapat menyebabkan kerentanan keamanan jika tidak ditangani.

## P

**PDA (Program Derived Address)**
Alamat deterministik yang diturunkan dari program ID dan seeds. PDA tidak memiliki private key dan hanya dapat ditandatangani oleh program yang menurunkannya. Digunakan untuk menyimpan data program.

**Perpetual Futures (Futures Perpetual)**
Kontrak derivatif yang tidak memiliki tanggal kedaluwarsa, memungkinkan trader mempertahankan posisi leverage tanpa batas waktu.

**POC (Proof of Concept)**
Implementasi sederhana untuk membuktikan bahwa konsep atau vulnerability tertentu dapat bekerja atau dieksploitasi.

**Post-Quantum Cryptography (Kriptografi Post-Kuantum)**
Algoritma kriptografi yang dirancang aman terhadap serangan dari komputer kuantum. Termasuk hash-based signatures dan lattice-based cryptography.

**Private Key**
Kunci rahasia yang digunakan untuk menandatangani transaksi dan membuktikan kepemilikan account. Harus dijaga kerahasiaannya.

**Program**
Smart contract di Solana. Program adalah kode executable yang dijalankan on-chain dan dapat memproses instruksi serta memodifikasi akun.

**Public Key**
Alamat publik yang dapat dibagikan untuk menerima transaksi atau mengidentifikasi account di Solana.

**Pyth Network**
Oracle network yang menyediakan high-frequency price feeds untuk aplikasi DeFi di Solana dan blockchain lainnya.

## R

**Raspberry Pi**
Komputer single-board berbiaya rendah yang sering digunakan dalam proyek IoT dan DePIN untuk mengintegrasikan hardware dengan blockchain Solana.

**React Native**
Framework untuk membangun aplikasi mobile native menggunakan React dan JavaScript, digunakan untuk aplikasi Solana mobile.

**Reentrancy**
Vulnerability di mana fungsi dapat dipanggil kembali sebelum eksekusi sebelumnya selesai, berpotensi menyebabkan behavior yang tidak diinginkan atau exploit.

**Rent**
Biaya penyimpanan untuk akun di Solana. Akun harus mempertahankan saldo minimum (rent-exempt) atau akan dihapus. Sebagian besar akun modern dibuat rent-exempt.

**Rent-Exempt**
Status account yang memiliki saldo cukup untuk tidak perlu membayar rent. Minimum balance untuk rent-exempt adalah sekitar 2 tahun biaya rent.

**RPC (Remote Procedure Call)**
Interface untuk berinteraksi dengan node Solana. Client menggunakan RPC endpoints untuk mengirim transaksi dan query data blockchain.

## S

**Sensor**
Perangkat hardware yang mendeteksi dan mengukur kondisi fisik (suhu, kelembaban, gerakan, dll.) dan dapat mengirim data ke blockchain melalui DePIN applications.

**Signature**
Bukti kriptografi yang memverifikasi bahwa transaksi ditandatangani oleh pemilik private key. Digunakan untuk otorisasi transaksi.

**Signer**
Akun yang harus menandatangani transaksi. Biasanya akun yang membayar fees atau akun yang datanya dimodifikasi.

**Slippage**
Perbedaan antara harga yang diharapkan dan harga eksekusi aktual dalam trade, biasanya terjadi karena pergerakan harga atau likuiditas rendah.

**Slot**
Unit waktu terkecil di Solana, sekitar 400ms. Setiap slot memiliki satu leader validator yang menghasilkan block.

**SNARK (Succinct Non-Interactive Argument of Knowledge)**
Jenis zero-knowledge proof yang ringkas dan tidak memerlukan interaksi antara prover dan verifier. Groth16 adalah contoh SNARK.

**SOL**
Token native dari blockchain Solana, digunakan untuk membayar transaction fees dan staking.

**Solana Agent Kit**
Toolkit komprehensif untuk membangun AI agents yang dapat berinteraksi dengan blockchain Solana, termasuk trading, NFT, dan DeFi operations.

**Solana Pay**
Standar untuk pembayaran dan transfer berbasis Solana, terutama untuk aplikasi mobile dan point-of-sale.

**Solana Program Library (SPL)**
Koleksi program on-chain yang dikelola oleh Solana Labs, termasuk SPL Token program untuk membuat dan mengelola token.

**SPL Token**
Token yang dibuat menggunakan SPL Token program. Standar token di Solana, mirip dengan ERC-20 di Ethereum.

**State Tree**
Merkle tree yang menyimpan compressed account hashes dalam sistem ZK Compression, dengan hanya root hash yang disimpan on-chain.

## T

**Testnet**
Jaringan testing Solana yang mirip dengan mainnet tetapi menggunakan token tanpa nilai untuk testing aplikasi sebelum deployment ke production.

**Token Account**
Account yang menyimpan balance token SPL untuk wallet tertentu. Setiap kombinasi wallet-token memerlukan token account terpisah.

**Token Extensions (Token-2022)**
Versi terbaru dari SPL Token program dengan fitur tambahan seperti transfer fees, confidential transfers, dan metadata on-chain.

**Token Program**
Program SPL yang mengelola pembuatan dan transfer token di Solana. Program ID: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA.

**TPS (Transactions Per Second)**
Metrik throughput blockchain. Solana dirancang untuk mendukung 50,000+ TPS.

**Transaction (Transaksi)**
Unit atomik dari operasi di Solana. Berisi satu atau lebih instruksi, daftar akun yang diperlukan, dan signature dari signers.

**Trident**
Framework fuzzing untuk program Solana yang membantu menemukan kerentanan keamanan melalui testing otomatis dengan input acak.

## U

**Underflow**
Kondisi error ketika hasil operasi aritmatika kurang dari nilai minimum yang dapat disimpan dalam tipe data. Dapat menyebabkan kerentanan keamanan jika tidak ditangani.

## V

**Validity Proof**
Zero-knowledge proof yang memverifikasi bahwa compressed account exists dalam state tree tanpa mengungkapkan data account.

**Vulnerability**
Kelemahan dalam kode program yang dapat dieksploitasi untuk menyebabkan behavior yang tidak diinginkan atau mencuri funds.

## W

**Wallet**
Aplikasi yang menyimpan keypairs dan memungkinkan user berinteraksi dengan blockchain Solana. Dapat berupa browser extension, mobile app, atau hardware device.

**Wallet Adapter**
Library yang menyediakan interface standar untuk menghubungkan dApps dengan berbagai wallet Solana.

**WebSocket**
Protokol komunikasi yang memungkinkan koneksi dua arah real-time antara client dan server, digunakan untuk subscribe ke updates blockchain.

**Winternitz Signature**
Skema signature hash-based yang aman terhadap serangan kuantum, digunakan dalam implementasi post-quantum cryptography di Solana.

## Z

**Zero-Knowledge Proof (Bukti Tanpa Pengetahuan)**
Metode kriptografi di mana satu pihak dapat membuktikan kepada pihak lain bahwa pernyataan tertentu benar tanpa mengungkapkan informasi tambahan apapun.

**ZK Compression**
Teknik untuk mengompresi state blockchain menggunakan zero-knowledge proofs, mengurangi biaya penyimpanan sambil mempertahankan privasi.

---

## Sumber Daya Tambahan

- [Dokumentasi Resmi Solana](https://docs.solana.com)
- [Solana Cookbook](https://solanacookbook.com)
- [Anchor Documentation](https://www.anchor-lang.com)

## Catatan

Glosarium ini mencakup istilah-istilah yang paling sering digunakan dalam modul pembelajaran. Untuk definisi lebih detail, lihat dokumentasi di setiap area topik atau rujuk ke sumber asli di [SOURCES.md](SOURCES.md).
