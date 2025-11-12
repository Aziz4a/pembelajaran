const content = document.getElementById('content');

/* ======== Menu Utama ======== */
function showMenu() {
  document.body.removeAttribute('data-page');
  const nama = localStorage.getItem('namaUser') || 'Pengguna';

  content.innerHTML = `
    <div class="menu-container">
      <h2>Selamat datang, ${nama}!</h2>
      <button class="menu-btn" data-page="bilangan/index.html">Bilangan</button>
      <button class="menu-btn" data-page="geometri/index.html">Geometri</button>
      <button class="menu-btn" data-page="quiz/index.html">Quiz</button>
      <button class="menu-btn" data-page="evaluasi/index.html">Evaluasi</button>
    </div>
    <button id="gantiNamaBtn">Ganti Nama</button>
  `;

  // klik menu → load page
  document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.getAttribute('data-page');   // ex: "bilangan/index.html"
      const section = page.split('/')[0];           // ex: "bilangan"
      loadPage(`pages/${page}`, section);
    });
  });

  // ganti nama
  document.getElementById('gantiNamaBtn').addEventListener('click', () => {
    const namaBaru = prompt('Masukkan nama kamu:');
    if (namaBaru && namaBaru.trim()) {
      localStorage.setItem('namaUser', namaBaru.trim());
      showMenu();
    }
  });
}

/* ======== Loader Halaman ======== */
async function loadPage(path, section) {
  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Halaman tidak ditemukan: ${path}`);
    const html = await res.text();

    document.body.dataset.page = section || ''; // Set data-page berdasarkan section
    content.innerHTML = `
      <div class="page-container fade-in">
        ${html}
        <button id="backBtn" class="backBtn">← Kembali ke Menu Utama</button>
      </div>
    `;
    document.getElementById('backBtn').addEventListener('click', showMenu);
  } catch (err) {
    content.innerHTML = `<div class="page-container"><p style="color:#ef4444">Error: ${err.message}</p></div>`;
    console.error(err);
  }
}

/* ======== Delegasi klik untuk subpage ======== */
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('subpage-btn')) {
    const page = e.target.getAttribute('data-page'); // ex: "bilangan/materi.html"
    const section = page.split('/')[0];
    loadPage(`pages/${page}`, section);
  }
});

/* ====== util skor (khusus Evaluasi) ====== */
function simpanSkor(tipe, nilai) {
  const data = JSON.parse(localStorage.getItem('skorEvaluasi') || '{}');
  data[tipe] = { nilai, waktu: new Date().toISOString() };
  localStorage.setItem('skorEvaluasi', JSON.stringify(data));
}

function ambilSkor() {
  return JSON.parse(localStorage.getItem('skorEvaluasi') || '{}');
}

window.simpanSkor = simpanSkor;
window.ambilSkor = ambilSkor;

/* start */
window.addEventListener('DOMContentLoaded', showMenu);
