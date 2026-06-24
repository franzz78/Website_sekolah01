// Konfigurasi Database Firebase Absensi Polri Anda
const firebaseConfig = {
    apiKey: "AIzaSyD9BmV4XKXuMWa4PZHpb7Bbt-rHs61m3lE",
    authDomain: "absensi-polri.firebaseapp.com",
    databaseURL: "https://absensi-polri-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "absensi-polri",
    storageBucket: "absensi-polri.firebasestorage.app",
    messagingSenderId: "19006760644",
    appId: "1:19006760644:web:b7dac0410e47877ded4b91",
    measurementId: "G-82KHRYZBN0"
};

// Inisialisasi Firebase App & Database
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Panggil semua fungsi sinkronisasi setelah DOM siap
document.addEventListener('DOMContentLoaded', () => {
    sinkronisasiSEO();
    muatBeritaDinamis();
    muatDirektoriGuru();
    muatAkademikDanSilabus();
    muatKomunikasiDanLayanan();
    monitorSPMBOnline();
    monitorPTSPOnline();
});

// ==========================================
// 1. MODUL SEO & TRACKER CONFIG
// ==========================================
function sinkronisasiSEO() {
    database.ref('seo_config').on('value', (snapshot) => {
        const seo = snapshot.val();
        if (seo) {
            if (seo.title) {
                document.getElementById('dynamicTitle').innerText = seo.title;
                document.getElementById('ogTitle').setAttribute('content', seo.title);
            }
            if (seo.description) {
                document.getElementById('dynamicDesc').setAttribute('content', seo.description);
                document.getElementById('ogDesc').setAttribute('content', seo.description);
            }
            if (seo.analyticsId && document.getElementById('analyticsScriptContainer')) {
                document.getElementById('analyticsScriptContainer').innerHTML = `
                    <script async src="https://www.googletagmanager.com/gtag/js?id=${seo.analyticsId}"></script>
                    <script>
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${seo.analyticsId}');
                    </script>
                `;
            }
        }
    });
}

// ==========================================
// 2. MODUL BERITA & DIREKTORI PROFILE GURU
// ==========================================
function muatBeritaDinamis() {
    database.ref('berita').on('value', (snapshot) => {
        const grid = document.getElementById('newsGrid');
        if(!grid) return;
        grid.innerHTML = '';
        if(snapshot.exists()) {
            snapshot.forEach((child) => {
                const item = child.val();
                grid.innerHTML += `
                    <div class="card news-item" style="border-left:none; border-bottom:3px solid #38a39e;">
                        <img src="${item.gambar || 'https://via.placeholder.com/300x180'}" alt="Berita">
                        <h4>${item.judul}</h4>
                        <p>${item.ringkasan}</p>
                        <small style="color:#aaa; display:block; margin-top:8px;"><i class="fas fa-clock"></i> ${item.tanggal || ''}</small>
                    </div>
                `;
            });
        } else {
            grid.innerHTML = '<p>Belum ada info artikel atau berita terbaru.</p>';
        }
    });
}

function muatDirektoriGuru() {
    database.ref('direktori_guru').on('value', (snapshot) => {
        const grid = document.getElementById('guruGrid');
        if(!grid) return;
        grid.innerHTML = '';
        if(snapshot.exists()) {
            snapshot.forEach((child) => {
                const guru = child.val();
                grid.innerHTML += `
                    <div class="card guru-item" style="border-left:none; padding:15px;">
                        <img src="${guru.foto || 'https://via.placeholder.com/120x150'}" alt="Foto Guru">
                        <h4>${guru.nama}</h4>
                        <p>${guru.jabatan}</p>
                    </div>
                `;
            });
        }
    });
}

// ==========================================
// 3. MODUL AGENDA & DOWNLOAD SILABUS
// ==========================================
function muatAkademikDanSilabus() {
    database.ref('akademik_agenda').on('value', (snapshot) => {
        const container = document.getElementById('agendaContainer');
        if(!container) return;
        container.innerHTML = '';
        snapshot.forEach((child) => {
            const agd = child.val();
            container.innerHTML += `<li><i class="fas fa-arrow-right" style="color:#38a39e;"></i> <strong>${agd.tanggal}</strong> - ${agd.kegiatan}</li>`;
        });
    });

    database.ref('akademik_silabus').on('value', (snapshot) => {
        const container = document.getElementById('silabusContainer');
        if(!container) return;
        let html = `<table style="width:100%; font-size:12px; text-align:left; border-collapse:collapse;">
                        <tr style="background:#f4f6f9;"><th style="padding:8px;">Mata Pelajaran</th><th style="padding:8px;">Aksi</th></tr>`;
        snapshot.forEach((child) => {
            const slb = child.val();
            html += `<tr style="border-bottom:1px solid #eee;">
                        <td style="padding:8px;">${slb.mapel} (Kelas ${slb.kelas})</td>
                        <td style="padding:8px;"><a href="${slb.link}" target="_blank" style="color:#38a39e; text-decoration:none;"><i class="fas fa-download"></i> Unduh</a></td>
                     </tr>`;
        });
        html += `</table>`;
        container.innerHTML = html;
    });
}

// ==========================================
// 4. MODUL KONSULTASI & LAYANAN CHAT
// ==========================================
function muatKomunikasiDanLayanan() {
    database.ref('komunikasi_testi').on('value', (snapshot) => {
        const container = document.getElementById('testiContainer');
        if(!container) return;
        container.innerHTML = '';
        snapshot.forEach((child) => {
            const tst = child.val();
            container.innerHTML += `
                <div style="background:#f9f9f9; padding:12px; border-radius:6px; font-size:13px; margin-bottom:8px;">
                    <p style="font-style:italic;">"${tst.isi}"</p>
                    <strong style="display:block; text-align:right; margin-top:5px; color:#38a39e;">- ${tst.pengirim}</strong>
                </div>
            `;
        });
    });

    const form = document.getElementById('formKonsultasi');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nama = document.getElementById('chatNama').value;
            const pesan = document.getElementById('chatPesan').value;

            database.ref('komunikasi_chat').push({
                nama: nama,
                pesan: pesan,
                waktu: new Date().toLocaleTimeString()
            }).then(() => {
                document.getElementById('chatResponseBox').innerHTML = `<p style="color:green;"><i class="fas fa-check"></i> Pesan terkirim! Admin TU akan merespons segera.</p>`;
                form.reset();
            });
        });
    }
}

// ==========================================
// 5. MODUL SPMB ONLINE LITE
// ==========================================
const formSPMB = document.getElementById('formSPMB');
if (formSPMB) {
    formSPMB.addEventListener('submit', (e) => {
        e.preventDefault();
        database.ref('spmb_pendaftar').push({
            nama: document.getElementById('spmbNama').value,
            asal_sekolah: document.getElementById('spmbAsalSekolah').value,
            jalur: document.getElementById('spmbJalur').value,
            link_berkas: document.getElementById('spmbLinkBerkas').value,
            status_keputusan: "PROSES SELEKSI",
            tanggal_daftar: new Date().toLocaleDateString('id-ID')
        }).then(() => {
            alert('Pendaftaran Berhasil Terkirim!');
            formSPMB.reset();
        });
    });
}

function monitorSPMBOnline() {
    if (!document.getElementById('spmbCountTotal')) return;
    database.ref('spmb_pendaftar').on('value', (snapshot) => {
        const countElem = document.getElementById('spmbCountTotal');
        const hasilBox = document.getElementById('spmbHasilBox');
        if (snapshot.exists()) {
            const data = snapshot.val();
            const keys = Object.keys(data);
            countElem.innerText = keys.length + " Siswa";
            
            const lastRow = data[keys[keys.length - 1]];
            hasilBox.innerHTML = `<strong>Pendaftar Terakhir:</strong> ${lastRow.nama} <br> 
                                  <strong>Asal:</strong> ${lastRow.asal_sekolah} <br>
                                  <strong>Status Seleksi:</strong> <span style="background:#f0ad4e; color:white; padding:2px 5px; border-radius:3px; font-size:11px; font-weight:600;">${lastRow.status_keputusan}</span>`;
        } else {
            countElem.innerText = "0 Siswa";
            hasilBox.innerText = "Belum ada pendaftaran hari ini.";
        }
    });
}

// ==========================================
// 6. MODUL PTSP (PELAYANAN TERPADU)
// ==========================================
const formPTSP = document.getElementById('formPTSP');
if (formPTSP) {
    formPTSP.addEventListener('submit', (e) => {
        e.preventDefault();
        database.ref('ptsp_permohonan').push({
            nama: document.getElementById('ptspNama').value,
            identitas: document.getElementById('ptspIdentitas').value,
            layanan: document.getElementById('ptspLayanan').value,
            keperluan: document.getElementById('ptspKeperluan').value,
            status: "Belum Diproses",
            tanggal: new Date().toLocaleDateString('id-ID')
        }).then(() => {
            alert('Berkas PTSP Anda masuk antrean!');
            formPTSP.reset();
        });
    });
}

function monitorPTSPOnline() {
    if (!document.getElementById('ptspCountBelum')) return;
    database.ref('ptsp_permohonan').on('value', (snapshot) => {
        let belum = 0, proses = 0, selesai = 0;
        const feed = document.getElementById('ptspLiveFeed');
        feed.innerHTML = '<strong>Aktivitas Log Terkini:</strong>';
        
        if(snapshot.exists()) {
            snapshot.forEach((child) => {
                const item = child.val();
                if(item.status === "Belum Diproses") belum++;
                else if(item.status === "Sedang Diproses") proses++;
                else if(item.status === "Selesai") selesai++;
                
                feed.innerHTML = `
                    <div class="ptsp-item-log">
                        <strong>${item.nama}</strong>: ${item.layanan} <br>
                        <small>Status: <span style="color:#d9534f; font-weight:600;">${item.status}</span></small>
                    </div>
                ` + feed.innerHTML;
            });
        }
        document.getElementById('ptspCountBelum').innerText = belum;
        document.getElementById('ptspCountProses').innerText = proses;
        document.getElementById('ptspCountSelesai').innerText = selesai;
    });
}

// ==========================================
// 7. AMPLOP KELULUSAN MANDIRI & SKL PRINT
// ==========================================
function periksaKelulusanSiswa() {
    const nisn = document.getElementById('inputCheckNISN').value.trim();
    const box = document.getElementById('boxHasilKelulusan');
    if(!nisn) return alert("Ketik NISN Anda!");

    box.style.display = 'block';
    box.innerHTML = 'Mencari berkas kelulusan...';

    database.ref('data_kelulusan').orderByChild('nisn').equalTo(nisn).once('value', (snapshot) => {
        if(snapshot.exists()) {
            const parent = snapshot.val();
            const id = Object.keys(parent)[0];
            const siswa = parent[id];

            if(siswa.keputusan.toUpperCase() === "LULUS") {
                box.style.background = '#d4edda'; box.style.color = '#155724';
                box.innerHTML = `
                    <h4>Selamat! Anda Dinyatakan LULUS</h4>
                    <p style="font-size:13px; margin:5px 0 10px 0;">Nama: <strong>${siswa.nama}</strong><br>NISN: ${siswa.nisn}</p>
                    <button class="btn-submit" style="background:#28a745; width:100%;" onclick="cetakSKL('${siswa.nama}', '${siswa.nisn}', '${siswa.tgl_lahir}')">Cetak Surat Kelulusan (SKL)</button>
                `;
            } else {
                box.style.background = '#fff3cd'; box.style.color = '#856404';
                box.innerHTML = `<h4>Status Ditunda</h4><p style="font-size:12px;">Siswa bernama ${siswa.nama} silakan menghadap ke Wali Kelas.</p>`;
            }
        } else {
            box.style.background = '#f8d7da'; box.style.color = '#721c24';
            box.innerHTML = `<h4>NISN Tidak Ditemukan</h4><p style="font-size:12px;">Nomor ${nisn} tidak terdaftar.</p>`;
        }
    });
}

function cetakSKL(nama, nisn, tgl) {
    const w = window.open('', '_blank');
    w.document.write(`
        <html><body style="font-family:serif; padding:40px;" onload="window.print()">
            <center style="border-bottom:3px double #000; padding-bottom:10px;">
                <h2>SMAN 1 LEMAHABANG</h2><p>Kabupaten Cirebon, Jawa Barat</p>
            </center>
            <h3 style="text-align:center; margin-top:20px;">SURAT KETERANGAN LULUS (SKL) RESMI DIGITAL</h3>
            <p style="margin-top:20px;">Kepala Sekolah Menerangkan bahwa:</p>
            <table style="margin:10px 30px; font-size:16px;">
                <tr><td>Nama</td><td>: <b>${nama}</b></td></tr>
                <tr><td>NISN</td><td>: ${nisn}</td></tr>
                <tr><td>Tanggal Lahir</td><td>: ${tgl}</td></tr>
            </table>
            <p>Dinyatakan <b>LULUS</b> dari satuan pendidikan berdasarkan kriteria kelulusan nasional.</p>
        </body></html>
    `);
    w.document.close();
}
