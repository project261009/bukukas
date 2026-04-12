const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyxo_svLeHzjJ1HL9PQEmwhF_Q31Rwfecz-i6eQp_cjxm1HqwDI85UjZEP_K9f3F1Fq/exec";
// 2. DATA UTAMA & LOGIN
// ============================================================
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

// Fungsi Pembantu: Mengubah angka ke format Rp 1.000.000
function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

// ============================================================
// 3. FUNGSI TAMBAH DATA (LOKAL + CLOUD)
// ============================================================
function tambahData() {
  const tanggal = document.getElementById("tanggal").value;
  const ket = document.getElementById("keterangan").value;
  const jenis = document.getElementById("jenis").value;
  const jumlahInput = document.getElementById("jumlah").value;

  if (!tanggal || !ket || !jumlahInput) {
    alert("Lengkapi semua data transaksi!");
    return;
  }

  const jumlah = parseFloat(jumlahInput);

  const payload = { 
    action: "add", 
    tanggal, 
    ket, 
    jenis, 
    jumlah 
  };

  // Simpan ke Lokal
  dataKas.push({tanggal, ket, jenis, jumlah});
  localStorage.setItem("kasData", JSON.stringify(dataKas));
  
  // Update Tabel & Hitung Saldo Baru
  loadData();

  // Kirim ke Google Sheets
  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(payload)
  });

  // Bersihkan form
  document.getElementById("keterangan").value = "";
  document.getElementById("jumlah").value = "";
}

// ============================================================
// 4. FUNGSI HAPUS DATA (LOKAL + CLOUD)
// ============================================================
function hapusData(index) {
  const itemHapus = dataKas[index];

  if (confirm(`Hapus transaksi "${itemHapus.ket}"?`)) {
    const deletePayload = {
      action: "delete",
      tanggal: itemHapus.tanggal,
      ket: itemHapus.ket
    };

    fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(deletePayload)
    });

    dataKas.splice(index, 1);
    localStorage.setItem("kasData", JSON.stringify(dataKas));
    loadData();
  }
}

// ============================================================
// 5. FUNGSI TAMPILKAN TABEL & HITUNG SALDO OTOMATIS
// ============================================================
function loadData() {
  let saldoBerjalan = 0; // Mulai dari nol
  const tbody = document.getElementById("kasTable").getElementsByTagName("tbody")[0];
  tbody.innerHTML = "";

  dataKas.forEach((item, index) => {
    // Logika Saldo: Jika Pemasukan (+), Jika Pengeluaran (-)
    if (item.jenis === "Pemasukan") {
      saldoBerjalan += item.jumlah;
    } else {
      saldoBerjalan -= item.jumlah;
    }

    const row = tbody.insertRow();
    row.innerHTML = `
      <td data-label="Tanggal">${item.tanggal}</td>
      <td data-label="Keterangan">${item.ket}</td>
      <td data-label="Jenis">
        <span class="badge-jenis ${item.jenis.toLowerCase()}">${item.jenis}</span>
      </td>
      <td data-label="Jumlah" style="font-weight:bold;">
        ${formatRupiah(item.jumlah)}
      </td>
      <td data-label="Saldo" style="font-weight:bold; color: #673AB7;">
        ${formatRupiah(saldoBerjalan)}
      </td>
      <td data-label="Hapus">
        <button class="delete-btn" onclick="hapusData(${index})">❌ HAPUS</button>
      </td>
    `;
  });
}
