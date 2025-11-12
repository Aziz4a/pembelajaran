const content = document.getElementById('content');

// cache untuk halaman yang sudah diprefetch atau dimuat
const pageCache = {};

/* ======== Menu Utama ======== */
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
  `;

  // pastikan tombol ganti nama persistent ada di body (tidak di-replace oleh showMenu)
  ensurePersistentNameButton();

  // klik menu → load page
  document.querySelectorAll('.menu-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const page = btn.getAttribute('data-page');   // ex: "bilangan/index.html"
      const section = page.split('/')[0];           // ex: "bilangan"
      loadPage(`pages/${page}`, section);
    });
  });

  // ganti nama
  // event handler dibuat di ensurePersistentNameButton sehingga tidak perlu di-attach lagi di sini

  // Prefetch halaman materi untuk respons yang lebih cepat (jalankan di background)
  prefetchPages([
    'bilangan/materi.html',
    'geometri/materi.html',
    'bilangan/lkpd-overview.html',
    'geometri/lkpd-overview.html'
  ]);
  // set initial history state for menu
  try{ history.replaceState({ menu: true }, '', location.pathname); }catch(e){}
}

/* ======== Prefetch / Cache Helpers ======== */
async function prefetchPages(list){
  for(const p of list){
    const path = `pages/${p}`;
    if(pageCache[path]) continue;
    fetch(path, { cache: 'no-store' })
      .then(r=>{ if(r.ok) return r.text(); throw new Error('prefetch failed'); })
      .then(txt => { pageCache[path] = txt; })
      .catch(()=>{/* ignore prefetch errors */});
  }
}

/* ===== Persistent Ganti Nama Button ===== */
function ensurePersistentNameButton(){
  if(document.getElementById('gantiNamaBtn')) return;
  const btn = document.createElement('button');
  btn.id = 'gantiNamaBtn';
  btn.className = 'ganti-nama-btn';
  btn.type = 'button';
  btn.innerText = 'Ganti Nama';
  document.body.appendChild(btn);
  btn.addEventListener('click', ()=>{
    ensureNameModal();
    openNameModal();
  });
}

/* ======== Loader Halaman (dengan cache & immediate feedback) ======== */
async function loadPage(path, section){
  try{
    // jika sudah di-cache, render langsung untuk respons instan
    if(pageCache[path]){
      const html = pageCache[path];
      renderPage(html, path, section, true);
      return;
    }

    // tampilkan loader cepat supaya user merasa responsif
    content.innerHTML = `
      <div class="page-container fade-in loading">
        <div class="loader"></div>
      </div>
    `;

    const res = await fetch(path, { cache: 'no-store' });
    if(!res.ok) throw new Error(`Halaman tidak ditemukan: ${path}`);
    const html = await res.text();

    // simpan ke cache agar selanjutnya lebih cepat
    pageCache[path] = html;

    renderPage(html, path, section, true);
  }catch(err){
    content.innerHTML = `<div class="page-container"><p style="color:#ef4444">Error: ${err.message}</p></div>`;
    console.error(err);
  }
}

/**
 * Render konten HTML yang sudah diambil.
 * Jika pushHistory true, tambahkan entry history sehingga back akan kembali.
 */
function renderPage(html, path, section, pushHistory = false){
  document.body.dataset.page = section || '';

  // Parse HTML yang didapat agar kita dapat mengeksekusi <script> yang ada
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Ambil konten yang relevan dari body. Jika file yang di-fetch adalah dokumen lengkap
    // (mengandung <html>/<body>), ambil isi <body>. Jika fragment biasa, gunakan seluruh body.
    const fragmentHtml = doc.body.innerHTML || html;

    content.innerHTML = `\n    <div class="page-container fade-in">\n      ${fragmentHtml}\n      <button id="backBtn" class="backBtn">← Kembali</button>\n    </div>\n  `;

    // tombol kembali sekarang hanya melakukan history.back() agar kembali ke halaman sebelumnya
    const backBtn = document.getElementById('backBtn');
    if(backBtn){
      backBtn.addEventListener('click', ()=>{
        history.back();
      });
    }

    // Eksekusi semua script yang terdapat pada dokumen yang di-fetch.
    // Kita harus menyelesaikan src relatif berdasarkan lokasi file yang di-fetch (path).
    const baseUrl = new URL(path, location.href);
    const scripts = Array.from(doc.querySelectorAll('script'));
    scripts.forEach(s => {
      const src = s.getAttribute('src');
      // Hindari memuat ulang core app script untuk mencegah duplikasi listener / state
      if (src && src.includes('assets/js/main.js')) return;

      try {
        if (src) {
          const resolved = new URL(src, baseUrl).href;
          const scriptEl = document.createElement('script');
          scriptEl.src = resolved;
          // jalankan secara berurutan
          scriptEl.async = false;
          document.body.appendChild(scriptEl);
        } else {
          // inline script
          const inline = document.createElement('script');
          inline.textContent = s.textContent;
          document.body.appendChild(inline);
        }
      } catch (e) {
        // Jika URL parsing gagal (edge-case pada file://) gunakan nilai src apa adanya
        if (src) {
          const scriptEl = document.createElement('script');
          scriptEl.src = src;
          scriptEl.async = false;
          document.body.appendChild(scriptEl);
        }
      }
    });
  } catch (err) {
    // Jika parsing gagal, fallback: langsung render html apa adanya
    content.innerHTML = `\n    <div class="page-container fade-in">\n      ${html}\n      <button id="backBtn" class="backBtn">← Kembali</button>\n    </div>\n  `;
    console.error('renderPage parser error', err);
  }

  if(pushHistory){
    // tambahkan ke history (gunakan hash agar URL berubah sedikit dan state tercatat)
    try{
      history.pushState({ path, section }, '', `#${path}`);
    }catch(e){
      // ignore
    }
  }
}

// Ketika pengguna menekan tombol Back di browser atau history.back() dipanggil,
// tangani popstate untuk menampilkan konten yang sesuai.
window.addEventListener('popstate', (e)=>{
  const state = e.state;
  if(!state){
    // tidak ada state berarti kembali ke menu utama
    showMenu();
    return;
  }

  // jika state menunjukkan menu, tampilkan menu
  if(state.menu){
    showMenu();
    return;
  }

  const path = state.path;
  const section = state.section;

  // Jika path tersedia di cache, tampilkan langsung tanpa mempush state lagi
  if(pageCache[path]){
    renderPage(pageCache[path], path, section, false);
    return;
  }

  // Jika tidak di-cache, fetch lalu render (tanpa push history)
  fetch(path, { cache: 'no-store' })
    .then(r=>{ if(r.ok) return r.text(); throw new Error('Halaman tidak ditemukan'); })
    .then(txt => {
      pageCache[path] = txt;
      renderPage(txt, path, section, false);
    })
    .catch(err => {
      content.innerHTML = `<div class="page-container"><p style="color:#ef4444">Error: ${err.message}</p></div>`;
      console.error(err);
    });
});

/* ======== Delegasi klik untuk subpage ======== */
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.subpage-btn');
  if(btn){
    const page = btn.getAttribute('data-page'); // ex: "bilangan/materi.html"
    const section = page.split('/')[0];
    loadPage(`pages/${page}`, section);
  }
});

/* ======== Delegasi klik untuk TOC (smooth scroll) ======== */
document.addEventListener('click', (e) => {
  const link = e.target.closest('.toc a');
  if (!link) return;
  e.preventDefault();
  const href = link.getAttribute('href') || '';
  const hashIndex = href.indexOf('#');
  if (hashIndex === -1) return;
  const id = href.slice(hashIndex + 1);
  if (!id) return;

  // Find target inside the #content area
  const contentRoot = document.getElementById('content') || document.body;
  const target = contentRoot.querySelector(`#${CSS.escape ? CSS.escape(id) : id}`) || document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

/* ====== util skor (khusus Evaluasi) ====== */
function simpanSkor(tipe, nilai){
  const data = JSON.parse(localStorage.getItem('skorEvaluasi') || '{}');
  data[tipe] = { nilai, waktu: new Date().toISOString() };
  localStorage.setItem('skorEvaluasi', JSON.stringify(data));
}

function ambilSkor(){
  return JSON.parse(localStorage.getItem('skorEvaluasi') || '{}');
}

window.simpanSkor = simpanSkor;
window.ambilSkor = ambilSkor;

/* start */
window.addEventListener('DOMContentLoaded', showMenu);

/* ===== Modal Ganti Nama ===== */
function ensureNameModal(){
  if(document.getElementById('nameModal')) return;
  const html = `
    <div id="nameModal" class="name-modal" aria-hidden="true">
      <div class="name-modal-overlay" data-close="true"></div>
      <div class="name-modal-box">
        <button class="name-modal-close" aria-label="Tutup">×</button>
        <div class="name-modal-body">
          <div class="name-avatar">👋</div>
          <h3>Hai! Siapa namamu?</h3>
          <p class="muted">Masukkan nama agar pengalaman belajar lebih personal.</p>
          <input id="nameModalInput" type="text" placeholder="Masukkan nama kamu" />
          <div class="name-modal-actions">
            <button id="nameSaveBtn" class="menu-btn">Simpan</button>
            <button id="nameCancelBtn" class="backBtn">Batal</button>
          </div>
        </div>
      </div>
    </div>
  `;
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div.firstElementChild);

  // event listeners
  const modal = document.getElementById('nameModal');
  modal.querySelector('.name-modal-overlay').addEventListener('click', closeNameModal);
  modal.querySelector('.name-modal-close').addEventListener('click', closeNameModal);
  modal.querySelector('#nameCancelBtn').addEventListener('click', closeNameModal);
  modal.querySelector('#nameSaveBtn').addEventListener('click', saveNameFromModal);
  modal.querySelector('#nameModalInput').addEventListener('keydown', (e)=>{
    if(e.key === 'Enter') saveNameFromModal();
  });
}

function openNameModal(){
  const modal = document.getElementById('nameModal');
  if(!modal) return;
  const input = modal.querySelector('#nameModalInput');
  const current = localStorage.getItem('namaUser') || '';
  input.value = current;
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('is-open');
  setTimeout(()=> input.focus(), 200);
}

function closeNameModal(){
  const modal = document.getElementById('nameModal');
  if(!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('is-open');
}

function saveNameFromModal(){
  const modal = document.getElementById('nameModal');
  if(!modal) return;
  const input = modal.querySelector('#nameModalInput');
  const namaBaru = input.value && input.value.trim();
  if(namaBaru){
    localStorage.setItem('namaUser', namaBaru);
    closeNameModal();
    showMenu();
  } else {
    // beri umpan balik ringan
    input.classList.add('input-error');
    setTimeout(()=> input.classList.remove('input-error'), 900);
    input.focus();
  }
}

/* ====== Toast & centralized answer checking ====== */
function showToast(message, type = 'success', duration = 2200){
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  t.innerHTML = `<div class="toast-icon">${type === 'success' ? '✔' : '✖'}</div><div class="toast-msg">${message}</div>`;
  document.body.appendChild(t);
  // force reflow then show
  requestAnimationFrame(()=> t.classList.add('is-visible'));
  setTimeout(()=>{
    t.classList.remove('is-visible');
    setTimeout(()=> t.remove(), 240);
  }, duration);
}

/* ====== goBack function for LKPD pages ====== */
function goBack(){
  history.back();
}

// Delegated handler for all 'Periksa' buttons inside loaded pages
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.check-btn');
  if(!btn) return;
  // find the associated input within the same .answer-box
  const box = btn.closest('.answer-box');
  if(!box) return;
  const input = box.querySelector('.answer-input');
  if(!input) return;

  const correct = (input.dataset.answer || '').toString().trim();
  const user = (input.value || '').toString().trim();

  if(user === correct){
    input.style.backgroundColor = '#d4edda';
    input.style.borderColor = '#c3e6cb';
    showToast('Jawaban benar ✔', 'success');
  } else {
    input.style.backgroundColor = '#f8d7da';
    input.style.borderColor = '#f5c6cb';
    showToast('Jawaban belum tepat ✖', 'error');
  }
});
