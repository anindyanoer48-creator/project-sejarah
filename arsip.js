// arsip.js (Skrip Lengkap untuk Halaman Arsip Artikel)
document.addEventListener('DOMContentLoaded', () => {

    // --- "PENJAGA" UNTUK HALAMAN ARSIP ---
    // Cek elemen spesifik arsip. Jika tidak ada, hentikan.
    const searchBar = document.getElementById('search-bar');
    const topicGrid = document.getElementById('topic-grid');
    if (!searchBar || !topicGrid) {
        // console.log("arsip.js dihentikan, ini bukan halaman arsip."); // Opsional
        return;
    }
    // --- AKHIR PENJAGA ---

    // console.log("arsip.js berjalan..."); // Opsional

    const loader = document.getElementById('loader');
    const tagContainer = document.getElementById('tag-container');
    const paginationContainer = document.getElementById('pagination-container');

    let allTopics = [];
    let filteredTopics = [];
    let activeTag = 'All';
    let currentPage = 1;
    const itemsPerPage = 9; // 9 kartu per halaman (3x3)

    const params = new URLSearchParams(window.location.search);
    const categoryFromUrl = params.get('kategori');
    if (categoryFromUrl) {
        activeTag = categoryFromUrl;
    }

    // --- Fungsi Fetch Data ---
    async function fetchData() {
        if (!loader || !topicGrid) return; // Pastikan elemen ada
        loader.classList.add('show');
        topicGrid.style.display = 'none';
        if (paginationContainer) paginationContainer.style.display = 'none';
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allTopics = await response.json();
            if (!Array.isArray(allTopics)) { throw new Error('Format data.json tidak valid.'); }
            filteredTopics = [...allTopics];
            createTags();
            applyFilters(); // Panggil applyFilters untuk tampilan awal
        } catch (error) {
            console.error("Gagal mengambil data:", error);
            topicGrid.innerHTML = `<p>Gagal memuat data artikel: ${error.message}</p>`;
            topicGrid.style.display = 'block'; // Tampilkan pesan error
        } finally {
            if (loader) loader.classList.remove('show');
            // Biarkan display 'grid' diatur oleh applyFilters/displayTopics
            // if (topicGrid) topicGrid.style.display = 'grid'; // Hapus ini
            // Biarkan pagination diatur oleh setupPagination
            // if (paginationContainer) paginationContainer.style.display = 'flex'; // Hapus ini
        }
    }

    // --- Fungsi Display Topics (dengan paginasi) ---
    function displayTopics(topics, page = 1) {
        if (!topicGrid) return;
        topicGrid.innerHTML = ''; // Selalu bersihkan grid
        page--; // Index array mulai dari 0
        const start = itemsPerPage * page;
        const end = start + itemsPerPage;
        const paginatedItems = topics.slice(start, end);

        if (topics.length === 0) {
             topicGrid.innerHTML = "<p>Tidak ada topik yang cocok dengan pencarian atau filter Anda.</p>";
             topicGrid.style.display = 'block'; // Pastikan grid terlihat untuk pesan
             // setupPagination akan dipanggil di applyFilters untuk mengosongkan tombol
             return;
        }

        if (paginatedItems.length === 0 && topics.length > 0) {
             topicGrid.innerHTML = `<p>Tidak ada topik di halaman ${page + 1}.</p>`;
             topicGrid.style.display = 'block';
             // setupPagination akan dipanggil di applyFilters
             return;
        }

        topicGrid.style.display = 'grid'; // Pastikan display grid aktif

        paginatedItems.forEach(topic => {
            if (!topic) return; // Lewati jika data topik tidak valid
            const card = document.createElement('div');
            card.className = 'topic-card';
            card.setAttribute('data-aos', 'fade-up');
            card.innerHTML = `
                <img src="${topic.image || 'images/placeholder.png'}" alt="${topic.title || 'Gambar artikel'}" class="card-image">
                <div class="card-content">
                    <span class="category">${topic.category || ''}</span>
                    <h3>${topic.title || 'Tanpa Judul'}</h3>
                    <p class="summary">${topic.summary || ''}</p>
                    <button class="read-more-btn" data-id="${topic.id || ''}">Baca Selengkapnya</button>
                </div>
            `;
            topicGrid.appendChild(card);
        });
        if (typeof AOS !== 'undefined') { AOS.refreshHard(); }
        // Hanya scroll jika bukan halaman pertama kali load (opsional)
        // if(page > 0) {
           topicGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // }
    }

    // --- Fungsi Create Tags ---
    function createTags() {
        if (!tagContainer || !Array.isArray(allTopics)) return;
        // Ambil kategori unik dan filter yang kosong/null
        const categories = ['All', ...new Set(allTopics.map(topic => topic.category).filter(Boolean))];
        tagContainer.innerHTML = '';
        categories.forEach(category => {
            const tagBtn = document.createElement('button');
            tagBtn.className = 'tag-btn';
            tagBtn.innerText = category;
            if (category === activeTag) { tagBtn.classList.add('active'); }
            tagBtn.addEventListener('click', () => {
                activeTag = category;
                document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
                tagBtn.classList.add('active');
                applyFilters();
            });
            tagContainer.appendChild(tagBtn);
        });
    }

    // --- Fungsi Apply Filters ---
    function applyFilters() {
        if (!Array.isArray(allTopics)) return; // Pastikan data sudah ada
        const searchTerm = searchBar.value.toLowerCase();
        filteredTopics = allTopics.filter(topic => {
            if (!topic) return false; // Lewati data topik yang tidak valid
            const byTag = activeTag === 'All' || topic.category === activeTag;
            const titleMatch = topic.title && topic.title.toLowerCase().includes(searchTerm);
            const summaryMatch = topic.summary && topic.summary.toLowerCase().includes(searchTerm);
            const bySearch = titleMatch || summaryMatch;
            return byTag && bySearch;
        });
        currentPage = 1;
        setupPagination(filteredTopics); // Selalu setup paginasi berdasarkan hasil filter
        displayTopics(filteredTopics, currentPage); // Tampilkan halaman pertama
    }

    // --- Fungsi Setup Pagination ---
     function setupPagination(items) {
         if (!paginationContainer) return;
         paginationContainer.innerHTML = '';
         if (!Array.isArray(items)) return; // Pastikan items adalah array

         const pageCount = Math.ceil(items.length / itemsPerPage);
         if (pageCount <= 1) {
             paginationContainer.style.display = 'none';
             return;
         }
         paginationContainer.style.display = 'flex';

         // Tombol Previous
         const prevButton = document.createElement('button');
         prevButton.innerText = '« Prev';
         prevButton.disabled = currentPage === 1;
         prevButton.addEventListener('click', () => {
              if (currentPage > 1) { currentPage--; displayTopics(items, currentPage); setupPagination(items); }
         });
         paginationContainer.appendChild(prevButton);

         // Tombol Halaman Angka (Logika ellipsis)
         const maxPageButtons = 5;
         let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
         let endPage = Math.min(pageCount, startPage + maxPageButtons - 1);
         if (endPage - startPage + 1 < maxPageButtons) { startPage = Math.max(1, endPage - maxPageButtons + 1); }
         if (startPage > 1) {
              const firstButton = document.createElement('button'); firstButton.innerText = '1';
              firstButton.addEventListener('click', () => { currentPage = 1; displayTopics(items, currentPage); setupPagination(items); });
              paginationContainer.appendChild(firstButton);
              if (startPage > 2) { const ellipsis = document.createElement('span'); ellipsis.innerText = '...'; paginationContainer.appendChild(ellipsis); }
          }
         for (let i = startPage; i <= endPage; i++) {
              const btn = document.createElement('button'); btn.innerText = i;
              if (i === currentPage) { btn.classList.add('active'); btn.disabled = true; }
              btn.addEventListener('click', () => { currentPage = i; displayTopics(items, currentPage); setupPagination(items); });
              paginationContainer.appendChild(btn);
         }
         if (endPage < pageCount) {
              if (endPage < pageCount - 1) { const ellipsis = document.createElement('span'); ellipsis.innerText = '...'; paginationContainer.appendChild(ellipsis); }
              const lastButton = document.createElement('button'); lastButton.innerText = pageCount;
              lastButton.addEventListener('click', () => { currentPage = pageCount; displayTopics(items, currentPage); setupPagination(items); });
              paginationContainer.appendChild(lastButton);
          }

         // Tombol Next
         const nextButton = document.createElement('button');
         nextButton.innerText = 'Next »';
         nextButton.disabled = currentPage === pageCount;
         nextButton.addEventListener('click', () => {
             if (currentPage < pageCount) { currentPage++; displayTopics(items, currentPage); setupPagination(items); }
         });
         paginationContainer.appendChild(nextButton);
     }

    // --- Event Listeners ---
    searchBar.addEventListener('input', applyFilters);

    topicGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('read-more-btn')) {
            const topicId = e.target.getAttribute('data-id');
            // Pastikan ID ada sebelum redirect
            if(topicId) {
                window.location.href = `artikel.html?id=${topicId}`;
            }
        }
    });

    // --- Fungsionalitas Dasar (Copyright, BackToTop, AOS Init) ---
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    if (typeof AOS !== 'undefined') {
         AOS.init({ duration: 800, once: true });
    }

    const backToTopButton = document.getElementById("back-to-top-btn");
    if (backToTopButton) {
        window.onscroll = () => {
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            if (scrollPosition > 200) { backToTopButton.classList.add("show"); }
            else { backToTopButton.classList.remove("show"); }
        };
        backToTopButton.addEventListener("click", () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
    // --- Akhir Fungsionalitas Dasar ---

    // Mulai aplikasi
    fetchData();

});