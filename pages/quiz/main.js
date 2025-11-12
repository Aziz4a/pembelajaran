/* ======== Menu Utama untuk Quiz ======== */
function showMenu(){
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
      const page = btn.getAttribute('data-page');
      const section = page.split('/')[0];
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

/* start */
window.addEventListener('DOMContentLoaded', showMenu);

