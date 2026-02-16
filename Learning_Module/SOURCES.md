# Sumber Repository

Dokumen ini mendokumentasikan semua repository sumber yang digunakan untuk membuat Modul Pembelajaran Solana ini, termasuk deskripsi, instruksi clone, dan area topik yang terkait.

## Gambaran Umum

Modul pembelajaran ini mengkurasi dan mengorganisir konten edukatif dari delapan kategori repository utama yang mencakup berbagai aspek pengembangan Solana:

1. **Percolator** - Protokol DeFi tingkat lanjut (perpetual futures, risk engines)
2. **Solana Agent Kit** - Framework pengembangan AI agent
3. **Solana Audit Tools** - Tools dan framework keamanan
4. **Solana Example Program** - Program contoh dasar
5. **Solana Mobile** - Pengembangan mobile dApp
6. **Solana DePIN Examples** - Integrasi IoT dan infrastruktur fisik
7. **Solana Privacy** - Fitur privasi dan zero-knowledge
8. **Solana Post-Quantum** - Implementasi kriptografi post-kuantum

---

## 1. Percolator

**Deskripsi**: Suite protokol DeFi tingkat lanjut yang mengimplementasikan perpetual futures, risk engines, dan mekanisme matching order yang canggih di Solana.

**Area Topik**: DeFi (defi/)

**Repository**:
- **percolator**: Core protocol implementation
- **percolator-cli**: Command-line tools untuk interaksi dengan protocol
- **percolator-match**: Matching engine untuk order execution
- **percolator-prog**: On-chain program implementation
- **percolator-stress-test**: Performance dan stress testing tools

**Lokasi di Workspace**: `percolator/`

**Cara Clone**:
```bash
# Clone individual repositories
git clone https://github.com/[org]/percolator.git
git clone https://github.com/[org]/percolator-cli.git
git clone https://github.com/[org]/percolator-match.git
git clone https://github.com/[org]/percolator-prog.git
git clone https://github.com/[org]/percolator-stress-test.git
```

**Konten yang Diekstrak**:
- Konsep perpetual futures dan implementasinya
- Arsitektur risk engine untuk manajemen risiko
- Pattern untuk protokol DeFi tingkat produksi
- CLI tools untuk operasi DeFi
- Testing dan validation patterns

**Status Maintenance**: Aktif

**Lisensi**: Lihat file LICENSE di setiap repository

---

## 2. Solana Agent Kit

**Deskripsi**: Framework komprehensif untuk membangun AI agents yang dapat berinteraksi dengan blockchain Solana, termasuk toolkit, template, dan integrasi dengan framework AI populer.

**Area Topik**: AI Agents (ai-agents/)

**Repository**:
- **create-solana-agent**: Template generator untuk agent projects
- **devrel-mcp**: Model Context Protocol integration
- **langgraph**: LangGraph integration untuk agent workflows
- **plugin-god-mode**: Plugin dengan capabilities diperluas

**Lokasi di Workspace**: `solana-agent-kit/`

**Cara Clone**:
```bash
# Clone agent kit repositories
git clone https://github.com/[org]/create-solana-agent.git
git clone https://github.com/[org]/devrel-mcp.git
git clone https://github.com/[org]/langgraph.git
git clone https://github.com/[org]/plugin-god-mode.git
```

**Konten yang Diekstrak**:
- Pattern dasar untuk autonomous agents
- Integrasi Solana Agent Kit dengan blockchain
- Model Context Protocol (MCP) untuk AI agents
- LangGraph workflows untuk agent orchestration
- Template dan boilerplate untuk quick start

**Status Maintenance**: Aktif

**Lisensi**: Lihat file LICENSE di setiap repository

---

## 3. Solana Audit Tools

**Deskripsi**: Koleksi tools, frameworks, dan resources untuk audit keamanan program Solana, termasuk vulnerability patterns, fuzzing tools, dan POC frameworks.

**Area Topik**: Security (security/)

**Repository**: (Lokasi spesifik akan ditambahkan berdasarkan struktur workspace aktual)

**Cara Clone**:
```bash
# Clone audit tools repository
git clone https://github.com/[org]/solana-audit-tools.git
```

**Konten yang Diekstrak**:
- Common vulnerability patterns dan mitigasi
- Trident fuzzing framework untuk property-based testing
- POC frameworks untuk CTF dan security research
- Real audit findings dan case studies
- Safe math patterns dan checked arithmetic
- Security best practices untuk Solana development

**Status Maintenance**: Aktif

**Lisensi**: Lihat file LICENSE di repository

---

## 4. Solana Example Program

**Deskripsi**: Program contoh yang mendemonstrasikan konsep fundamental Solana termasuk account models, transactions, tokens, dan PDAs.

**Area Topik**: Basics (basics/)

**Repository**: (Lokasi spesifik akan ditambahkan berdasarkan struktur workspace aktual)

**Cara Clone**:
```bash
# Clone example program repository
git clone https://github.com/[org]/solana-example-program.git
```

**Konten yang Diekstrak**:
- Account model dan program structure
- Transaction creation dan submission
- SPL token operations (create, mint, transfer)
- Program Derived Addresses (PDA) patterns
- Basic program examples dengan dokumentasi
- Testing patterns untuk Solana programs

**Status Maintenance**: Aktif

**Lisensi**: Lihat file LICENSE di repository

---

## 5. Solana Mobile

**Deskripsi**: Resources untuk pengembangan mobile dApps di Solana, termasuk wallet adapter, React Native integration, dan Solana Pay implementation.

**Area Topik**: Mobile (mobile/)

**Repository**: (Lokasi spesifik akan ditambahkan berdasarkan struktur workspace aktual)

**Cara Clone**:
```bash
# Clone mobile development repository
git clone https://github.com/[org]/solana-mobile.git
```

**Konten yang Diekstrak**:
- Mobile Wallet Adapter setup dan usage
- React Native integration patterns
- Expo template untuk quick start
- Solana Pay implementation untuk mobile payments
- Mobile-specific security considerations
- Testing mobile dApps

**Status Maintenance**: Aktif

**Lisensi**: Lihat file LICENSE di repository

---

## 6. Solana DePIN Examples

**Deskripsi**: Contoh implementasi untuk Decentralized Physical Infrastructure Networks (DePIN), termasuk integrasi IoT, Raspberry Pi, dan LoRaWAN dengan Solana blockchain.

**Area Topik**: DePIN (depin/)

**Repository**: (Lokasi spesifik akan ditambahkan berdasarkan struktur workspace aktual)

**Cara Clone**:
```bash
# Clone DePIN examples repository
git clone https://github.com/[org]/solana-depin-examples.git
```

**Konten yang Diekstrak**:
- Raspberry Pi integration dengan Solana programs
- LED control dan sensor data reading dari blockchain
- LoRaWAN integration untuk long-range IoT
- Data anchoring patterns untuk IoT data
- Real-world DePIN applications (treasure chest, payment systems)
- Hardware requirements dan wiring diagrams
- Troubleshooting hardware integration issues

**Status Maintenance**: Aktif

**Lisensi**: Lihat file LICENSE di repository

---

## 7. Solana Privacy

**Deskripsi**: Implementasi fitur privasi di Solana termasuk ZK compression, Light Protocol, dan confidential transactions menggunakan zero-knowledge proofs.

**Area Topik**: Privacy (privacy/)

**Repository**: (Lokasi spesifik akan ditambahkan berdasarkan struktur workspace aktual)

**Cara Clone**:
```bash
# Clone privacy features repository
git clone https://github.com/[org]/solana-privacy.git
```

**Konten yang Diekstrak**:
- ZK compression concepts dan implementation
- Compressed token operations
- Light Protocol untuk privacy-preserving transactions
- Nullifier patterns untuk preventing double-spending
- Confidential payment swaps
- Private token airdrops
- Trade-offs antara privacy dan performance
- Visual diagrams untuk cryptographic flows

**Status Maintenance**: Aktif

**Lisensi**: Lihat file LICENSE di repository

---

## 8. Solana Post-Quantum

**Deskripsi**: Implementasi kriptografi post-kuantum di Solana untuk membangun aplikasi yang tahan terhadap serangan komputer kuantum, termasuk hash-based signatures dan Winternitz schemes.

**Area Topik**: Security (security/05-post-quantum-crypto/)

**Repository**: (Lokasi spesifik akan ditambahkan berdasarkan struktur workspace aktual)

**Cara Clone**:
```bash
# Clone post-quantum cryptography repository
git clone https://github.com/[org]/solana-post-quantum.git
```

**Konten yang Diekstrak**:
- Hash-based signature schemes
- Winternitz one-time signatures (WOTS)
- liboqs integration untuk quantum-resistant algorithms
- Threat model dari quantum computing
- Performance comparisons dengan classical cryptography
- Winternitz vault implementation
- Quantum-resistant signature verification
- Trade-offs: signature size vs verification time vs security level

**Status Maintenance**: Aktif

**Lisensi**: Lihat file LICENSE di repository

---

## Cara Menggunakan Repository Sumber

### Untuk Learners

1. **Tidak Perlu Clone**: Semua konten penting sudah diekstrak dan diorganisir dalam modul pembelajaran ini
2. **Referensi Mendalam**: Clone repository spesifik jika Anda ingin eksplorasi lebih dalam atau akses kode terbaru
3. **Kontribusi**: Jika Anda menemukan konten berharga di repository sumber, pertimbangkan untuk berkontribusi ke modul ini

### Untuk Contributors

1. **Ekstraksi Konten**: Saat mengekstrak konten baru, selalu sertakan atribusi dengan repository, file path, dan URL
2. **Update Reguler**: Periksa repository sumber secara berkala untuk update dan konten baru
3. **Maintain Links**: Pastikan semua link ke repository sumber tetap valid dan up-to-date

### Untuk Instructors

1. **Source Context**: Gunakan repository sumber untuk memberikan konteks tambahan kepada students
2. **Latest Updates**: Arahkan students ke repository sumber untuk fitur dan update terbaru
3. **Real-World Examples**: Repository sumber berisi implementasi production-grade yang dapat dijadikan case studies

---

## Atribusi dan Lisensi

Semua konten dalam modul pembelajaran ini berasal dari repository open-source dengan lisensi masing-masing. Saat menggunakan konten:

1. **Hormati Lisensi**: Ikuti terms dari lisensi repository asli
2. **Berikan Atribusi**: Selalu credit repository dan authors asli
3. **Link ke Sumber**: Sertakan link ke repository asli untuk referensi

---

## Maintenance dan Updates

**Terakhir Diperbarui**: 2026-02-15

**Update Schedule**: 
- Review konten setiap 3 bulan
- Update link dan references setiap bulan
- Tambahkan konten baru saat tersedia dari repository sumber

**Melaporkan Issues**:
- Jika Anda menemukan link rusak atau konten outdated, silakan laporkan
- Untuk issues dengan konten sumber, hubungi repository maintainers asli

---

## Sumber Daya Tambahan

### Dokumentasi Resmi
- [Solana Documentation](https://docs.solana.com) - Official Solana developer documentation covering core concepts, APIs, and guides
- [Anchor Framework](https://www.anchor-lang.com) - Framework documentation for building Solana programs with Rust
- [Solana Cookbook](https://solanacookbook.com) - Practical code examples and recipes for common Solana development tasks

### Community Resources
- [Solana Stack Exchange](https://solana.stackexchange.com) - Q&A community for Solana developers to ask technical questions
- [Solana Discord](https://discord.gg/solana) - Real-time chat community for developer support and discussions
- [Solana GitHub](https://github.com/solana-labs) - Official Solana Labs repositories with source code and examples

### Learning Platforms
- [Solana Bootcamp](https://www.soldev.app) - Structured courses and tutorials for learning Solana development
- [Buildspace Solana](https://buildspace.so) - Project-based learning platform with hands-on Solana courses
- [Questbook Solana](https://questbook.app) - Interactive learning quests and challenges for Solana developers
