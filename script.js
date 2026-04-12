const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyxo_svLeHzjJ1HL9PQEmwhF_Q31Rwfecz-i6eQp_cjxm1HqwDI85UjZEP_K9f3F1Fq/exec";
// ============================================================
// 1. PENGATURAN API (GANTI URL DI BAWAH INI)
// ============================================================
// Masukkan URL Web App yang Bapak dapat setelah klik "Deploy" di Google Sheets
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
// 3. FUNGSI TAMBAH DATA (LOKAL + CLOUD)
// ============================================================
function tambahData() {
  const tanggal = document.getElementById("tanggal").value;
  const ket = document.getElementById("keterangan").value;
  const jenis = document.getElementById("jenis").value;
  const jumlah = parseFloat(document.getElementById("jumlah").value);

  if (!tanggal || !ket || !jumlah) {
    alert("Lengkapi semua data transaksi!");
    return;
  }

  // Label "action: add" agar Google Sheets tahu ini data baru
  const payload = { 
    action: "add", 
    tanggal, 
    ket, 
    jenis, 
    jumlah 
  };

  // --- SIMPAN KE LOKAL (Agar langsung muncul di tabel) ---
  dataKas.push({tanggal, ket, jenis, jumlah});
  localStorage.setItem("kasData", JSON.stringify(dataKas));
  loadData();

  // --- KIRIM KE GOOGLE SHEETS ---
  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(payload)
  })
  .then(() => console.log("Data berhasil terkirim ke Cloud"));

  // Kosongkan form input
  document.getElementById("keterangan").value = "";
  document.getElementById("jumlah").value = "";
}

// ============================================================
// 4. FUNGSI HAPUS DATA (LOKAL + CLOUD)
// ============================================================
function hapusData(index) {
  const itemHapus = dataKas[index]; // Ambil data yang akan dihapus

  if (confirm(`Yakin ingin menghapus transaksi "${itemHapus.ket}"? (Data di Google Sheets juga akan terhapus)`)) {
    
    // Kirim perintah "action: delete" ke Google Sheets
    const deletePayload = {
      action: "delete",
      tanggal: itemHapus.tanggal,
      ket: itemHapus.ket
    };

    fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(deletePayload)
    })
    .then(() => console.log("Perintah hapus terkirim ke Cloud"));

    // Hapus dari memori HP/Laptop dan update tabel
    dataKas.splice(index, 1);
    localStorage.setItem("kasData", JSON.stringify(dataKas));
    loadData();
  }
}

// ============================================================
// 5. FUNGSI TAMPILKAN TABEL (LOAD DATA)
// ============================================================
function loadData() {
  saldo = 0;
  const tbody = document.getElementById("kasTable").getElementsByTagName("tbody")[0];
  tbody.innerHTML = "";

  dataKas.forEach((item, index) => {
    if (item.jenis === "Pemasukan") saldo += item.jumlah;
    else saldo -= item.jumlah;

    const row = tbody.insertRow();
    row.innerHTML = `
      <td data-label="Tanggal">${item.tanggal}</td>
      <td data-label="Keterangan">${item.ket}</td>
      <td data-label="Jenis">
        <span class="badge-jenis ${item.jenis.toLowerCase()}">${item.jenis}</span>
      </td>
      <td data-label="Jumlah">Rp ${item.jumlah.toLocaleString("id-ID")}</td>
      <td data-label="Saldo">Rp ${saldo.toLocaleString("id-ID")}</td>
      <td data-label="Hapus">
        <button class="delete-btn" onclick="hapusData(${index})">❌ HAPUS DATA</button>
      </td>
    `;
  });
}
