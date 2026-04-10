let saldo = 0;
let dataKas = JSON.parse(localStorage.getItem("kasData")) || [];

// daftar password sah (plaintext sederhana untuk demo)
const validPasswords = ["zaratus", "rissa", "indah", "safira", "nadia"];

function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  // cek username dan password
  if (user === "admin" && validPasswords.includes(pass)) {
    document.getElementById("loginDiv").classList.add("hidden");
    document.getElementById("kasDiv").classList.remove("hidden");
    loadData();
  } else {
    alert("Login gagal! Username atau password salah.");
  }
}

function tambahData() {
  const tanggal = document.getElementById("tanggal").value;
  const ket = document.getElementById("keterangan").value;
  const jenis = document.getElementById("jenis").value;
  const jumlah = parseFloat(document.getElementById("jumlah").value);

  if (!tanggal || !ket || !jumlah) {
    alert("Lengkapi semua data!");
    return;
  }

  dataKas.push({tanggal, ket, jenis, jumlah});
  localStorage.setItem("kasData", JSON.stringify(dataKas));
  loadData();
}

function hapusData(index) {
  if (confirm("Yakin ingin menghapus transaksi ini?")) {
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

    const row = tbody.insertRow();
    row.insertCell(0).innerText = item.tanggal;
    row.insertCell(1).innerText = item.ket;
    row.insertCell(2).innerText = item.jenis;
    row.insertCell(3).innerText = "Rp " + item.jumlah.toLocaleString("id-ID");
    row.insertCell(4).innerText = "Rp " + saldo.toLocaleString("id-ID");

    const aksiCell = row.insertCell(5);
    const delBtn = document.createElement("button");
    delBtn.innerText = "Hapus";
    delBtn.className = "delete-btn";
    delBtn.onclick = () => hapusData(index);
    aksiCell.appendChild(delBtn);
  });
}
