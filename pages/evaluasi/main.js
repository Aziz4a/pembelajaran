/* ======== Loader Halaman ======== */
async function loadPage(path, section){
  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Halaman tidak ditemukan: ${path}`);
    const html = await res.text();

    document.body.dataset.page = section || '';
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

/* ======== util skor (khusus Evaluasi) ====== */
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
