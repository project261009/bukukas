// 1. PENGATURAN API (GANTI URL DI BAWAH INI)
// ============================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzMa6kc2jgpkteO_S0wJesHqLU9g8AUFDfXqFC1OvxB8pjgE8i04x3Ui7vUi44SAY0W/exec"; 

// ============================================================
// 2. DATA UTAMA & LOGIN
// ============================================================
let saldo = 0;
let dataKas = JSON.parse(localStorage.getItem("kasData")) || [];
const validPasswords = ["zaratus", "rissa", "indah", "safira", "nadia"];

function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === "admin" && validPasswords.includes(pass)) {
    document.getElementById("loginDiv").classList.add("hidden");
    document.getElementById("kasDiv").classList.remove("hidden");
    loadData();
  } else {
    alert("Login gagal! Username atau password salah.");
  }
}

// ============================================================
// 3. FUNGSI TAMBAH DATA (LOCAL + GOOGLE SHEETS)
// ============================================================
function tambahData() {
  const tanggal = document.getElementById("tanggal").value;
  const ket = document.getElementById("keterangan").value;
  const jenis = document.getElementById("jenis").value;
  const jumlah = parseFloat(document.getElementById("jumlah").value);

  // Validasi Input
  if (!tanggal || !ket || !jumlah) {
    alert("Lengkapi semua data transaksi!");
    return;
  }

  const payload = { tanggal, ket, jenis, jumlah };

  // --- SIMPAN KE LOCAL STORAGE (Agar muncul di tabel HP/Laptop) ---
  dataKas.push(payload);
  localStorage.setItem("kasData", JSON.stringify(dataKas));
  loadData(); // Update tabel di layar

  // --- KIRIM KE GOOGLE SHEETS (Cloud Backup) ---
  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(() => {
    console.log("Data Berhasil Terkirim ke Cloud!");
    alert("Berhasil! Data tersimpan di HP & Google Sheets.");
  })
  .catch(err => {
    console.error("Gagal kirim ke Cloud: ", err);
    alert("Tersimpan di HP, tapi gagal kirim ke Cloud (Cek Internet).");
  });

  // Kosongkan Form setelah input
  document.getElementById("keterangan").value = "";
  document.getElementById("jumlah").value = "";
}

// ============================================================
// 4. FUNGSI TAMPILKAN DATA & HAPUS
// ============================================================
function hapusData(index) {
  if (confirm("Yakin ingin menghapus transaksi ini dari HP? (Data di Google Sheets tidak akan ikut terhapus)")) {
    dataKas.splice(index, 1);
    localStorage.setItem("kasData", JSON.stringify(dataKas));
    loadData();
  }
}

function loadData() {
  saldo = 0;
  const tbody = document.getElementById("kasTable").getElementsByTagName("tbody")[0];
  tbody.innerHTML = "";

  dataKas.forEach((item, index) => {
    if (item.jenis === "Pemasukan") saldo += item.jumlah;
    else saldo -= item.jumlah;

    // Membuat Baris Tabel (Sesuai format Bapak)
    const row = tbody.insertRow();
    row.innerHTML = `
      <td data-label="Tanggal">${item.tanggal}</td>
      <td data-label="Keterangan">${item.ket}</td>
      <td data-label="Jenis">
        <span class="badge-jenis ${item.jenis.toLowerCase()}">${item.jenis}</span>
      </td>
      <td data-label="Jumlah">Rp ${item.jumlah.toLocaleString("id-ID")}</td>
      <td data-label="Saldo">Rp ${saldo.toLocaleString("id-ID")}</td>
      <td data-label="Aksi">
        <button class="delete-btn" onclick="hapusData(${index})">❌ HAPUS</button>
      </td>
    `;
  });
}
