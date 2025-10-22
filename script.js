// script.js (Versi dengan Paginasi Ditambahkan)
document.addEventListener('DOMContentLoaded', () => {

    // --- "PENJAGA" UNTUK HALAMAN HOME ---
    const searchBar = document.getElementById('search-bar');
    if (!searchBar) {
        return; // Hentikan jika ini bukan halaman Home
    }
    // --- AKHIR PENJAGA ---

    const topicGrid = document.getElementById('topic-grid');
    const loader = document.getElementById('loader');
    const tagContainer = document.getElementById('tag-container');
    // --- TAMBAHAN PAGINASI (1/5): Selector container paginasi ---
    const paginationContainer = document.getElementById('pagination-container'); 

    let allTopics = [];
    // --- TAMBAHAN PAGINASI (2/5): Variabel untuk data terfilter ---
    let filteredTopics = []; // Data setelah difilter
    let activeTag = 'All';

    // --- TAMBAHAN PAGINASI (3/5): Variabel state paginasi ---
    let currentPage = 1;
    const itemsPerPage = 9; // Atur 6 kartu per halaman

    const params = new URLSearchParams(window.location.search);
    const categoryFromUrl = params.get('kategori');
    if (categoryFromUrl) {
        activeTag = categoryFromUrl;
    }

    async function fetchData() {
        loader.classList.add('show'); 
        topicGrid.style.display = 'none'; 
        // --- TAMBAHAN PAGINASI: Sembunyikan paginasi saat loading ---
        if (paginationContainer) paginationContainer.style.display = 'none'; 
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allTopics = await response.json();
            // --- MODIFIKASI PAGINASI: Inisialisasi data terfilter ---
            filteredTopics = [...allTopics]; // Awalnya, semua topik
            createTags();
            // --- MODIFIKASI PAGINASI: Panggil applyFilters untuk tampilan awal ---
            applyFilters(); 
        } catch (error) {
            console.error("Gagal mengambil data:", error);
            topicGrid.innerHTML = "<p>Gagal memuat data. Silakan coba lagi nanti.</p>";
        } finally {
            loader.classList.remove('show'); 
            topicGrid.style.display = 'grid'; 
            // --- TAMBAHAN PAGINASI: Tampilkan lagi paginasi ---
            if (paginationContainer) paginationContainer.style.display = 'flex'; 
            displayOnThisDay();
        }
    }

    // --- MODIFIKASI PAGINASI (4/5): Fungsi displayTopics sekarang menerima halaman ---
    function displayTopics(topics, page = 1) { 
        topicGrid.innerHTML = ''; 
        
        // Kalkulasi item untuk halaman saat ini
        page--; // Index array dimulai dari 0
        const start = itemsPerPage * page;
        const end = start + itemsPerPage;
        const paginatedItems = topics.slice(start, end);

        // Tampilkan pesan jika tidak ada item di halaman ini atau total
        if (paginatedItems.length === 0 && topics.length > 0) {
             topicGrid.innerHTML = "<p>Tidak ada topik di halaman ini.</p>";
             setupPagination(topics); // Tetap tampilkan paginasi jika ada data total
             return;
        }
         if (topics.length === 0) {
             topicGrid.innerHTML = "<p>Tidak ada topik yang cocok dengan pencarian Anda.</p>";
             setupPagination(topics); // Kosongkan paginasi jika tidak ada hasil
             return;
         }
        
        // Tampilkan kartu untuk halaman ini
        paginatedItems.forEach(topic => {
            const card = document.createElement('div');
            card.className = 'topic-card';
            card.setAttribute('data-aos', 'fade-up'); 

            card.innerHTML = `
                <img src="${topic.image || 'images/placeholder.png'}" alt="${topic.title || 'Gambar artikel'}" class="card-image">
                <div class="card-content">
                    <span class="category">${topic.category || ''}</span>
                    <h3>${topic.title || 'Tanpa Judul'}</h3>
                    <p class="summary">${topic.summary || ''}</p>
                    <button class="read-more-btn" data-id="${topic.id}">Baca Selengkapnya</button>
                </div>
            `;
            topicGrid.appendChild(card);
        });

        // Refresh AOS setelah menambahkan elemen baru
        if (typeof AOS !== 'undefined') {
            AOS.refreshHard(); // Gunakan refreshHard
        }
        // Gulir ke atas grid setelah berganti halaman
         topicGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Fungsi createTags (Tidak berubah signifikan)
    function createTags() {
        const categories = ['All', ...new Set(allTopics.map(topic => topic.category).filter(Boolean))]; // Filter kategori kosong
        tagContainer.innerHTML = '';
        categories.forEach(category => {
            const tagBtn = document.createElement('button');
            tagBtn.className = 'tag-btn';
            tagBtn.innerText = category;
            if (category === activeTag) {
                tagBtn.classList.add('active');
            }
            tagBtn.addEventListener('click', () => {
                activeTag = category;
                document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
                tagBtn.classList.add('active');
                applyFilters(); // Panggil applyFilters saat tag diklik
            });
            tagContainer.appendChild(tagBtn);
        });
    }
    // --- FUNGSI BARU UNTUK "HARI INI DALAM SEJARAH" ---
function displayOnThisDay() {
    const otdContainer = document.getElementById('on-this-day');
    const otdContent = document.getElementById('otd-content');
    if (!otdContainer || !otdContent || !Array.isArray(allTopics) || allTopics.length === 0) {
        return; // Hentikan jika elemen/data tidak ada
    }

    // 1. Dapatkan tanggal hari ini (Format: BB-TT)
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Bulan (01-12)
    const day = String(today.getDate()).padStart(2, '0');    // Tanggal (01-31)
    const todayString = `${month}-${day}`; // Contoh: "10-22"

    // 2. Filter artikel yang cocok dengan tanggal hari ini
    const matchingEvents = allTopics.filter(topic => topic.eventDate === todayString);

    // 3. Jika tidak ada yang cocok, sembunyikan container dan hentikan
    if (matchingEvents.length === 0) {
        otdContainer.style.display = 'none';
        return;
    }

    // 4. Jika ada yang cocok, tampilkan (maksimal 2 acara)
    otdContent.innerHTML = ''; // Kosongkan konten lama
    const eventsToShow = matchingEvents.slice(0, 2); // Batasi maksimal 2

    eventsToShow.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'otd-item';
        eventDiv.innerHTML = `
            <h3>${event.title || "Tanpa Judul"}</h3>
            <p>${event.summary || "Tidak ada ringkasan."}</p>
            <a href="artikel.html?id=${event.id}">Baca Selengkapnya &rarr;</a>
        `;
        otdContent.appendChild(eventDiv);
    });

    // Tampilkan container
    otdContainer.style.display = 'block';

    // Bonus: Animasikan dengan AOS jika ada
    otdContainer.setAttribute('data-aos', 'fade-in');
     if (typeof AOS !== 'undefined') {
        AOS.refresh(); // Refresh AOS untuk elemen baru
    }
}

    // --- MODIFIKASI PAGINASI: applyFilters sekarang mengatur paginasi ---
    function applyFilters() {
        const searchTerm = searchBar.value.toLowerCase();
        
        // Filter dari data asli (allTopics)
        filteredTopics = allTopics.filter(topic => {
            const byTag = activeTag === 'All' || topic.category === activeTag;
            const bySearch = (
                 (topic.title && topic.title.toLowerCase().includes(searchTerm)) ||
                 (topic.summary && topic.summary.toLowerCase().includes(searchTerm))
            );
            return byTag && bySearch;
        });
        
        currentPage = 1; // Reset ke halaman pertama saat filter berubah
        setupPagination(filteredTopics); // Buat tombol paginasi baru
        displayTopics(filteredTopics, currentPage); // Tampilkan halaman pertama hasil filter
    }
    
    // --- TAMBAHAN PAGINASI (5/5): Fungsi baru untuk membuat tombol paginasi ---
    function setupPagination(items) {
        if (!paginationContainer) return; // Hentikan jika container tidak ada
        paginationContainer.innerHTML = ''; 
        const pageCount = Math.ceil(items.length / itemsPerPage); 

        if (pageCount <= 1) { // Sembunyikan jika hanya 1 halaman atau kurang
            paginationContainer.style.display = 'none'; 
            return;
        }
        paginationContainer.style.display = 'flex'; // Tampilkan jika lebih dari 1 halaman

        // Tombol Previous
        const prevButton = document.createElement('button');
        prevButton.innerText = '« Prev';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayTopics(items, currentPage);
                setupPagination(items); // Update tombol lagi
            }
        });
        paginationContainer.appendChild(prevButton);

        // Tombol Halaman Angka (Logika ellipsis sederhana)
        const maxPageButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(pageCount, startPage + maxPageButtons - 1);
        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        if (startPage > 1) {
             const firstButton = document.createElement('button');
             firstButton.innerText = '1';
             firstButton.addEventListener('click', () => { currentPage = 1; displayTopics(items, currentPage); setupPagination(items); });
             paginationContainer.appendChild(firstButton);
              if (startPage > 2) {
                 const ellipsis = document.createElement('span'); ellipsis.innerText = '...'; paginationContainer.appendChild(ellipsis);
              }
          }

         for (let i = startPage; i <= endPage; i++) {
             const btn = document.createElement('button');
             btn.innerText = i;
             if (i === currentPage) { btn.classList.add('active'); btn.disabled = true; }
             btn.addEventListener('click', () => { 
                 currentPage = i; 
                 displayTopics(items, currentPage); 
                 setupPagination(items); // Update tombol lagi
             });
             paginationContainer.appendChild(btn);
         }

          if (endPage < pageCount) {
              if (endPage < pageCount - 1) {
                 const ellipsis = document.createElement('span'); ellipsis.innerText = '...'; paginationContainer.appendChild(ellipsis);
              }
             const lastButton = document.createElement('button');
             lastButton.innerText = pageCount;
             lastButton.addEventListener('click', () => { currentPage = pageCount; displayTopics(items, currentPage); setupPagination(items); });
             paginationContainer.appendChild(lastButton);
          }

        // Tombol Next
        const nextButton = document.createElement('button');
        nextButton.innerText = 'Next »';
        nextButton.disabled = currentPage === pageCount;
        nextButton.addEventListener('click', () => {
            if (currentPage < pageCount) {
                currentPage++;
                displayTopics(items, currentPage);
                setupPagination(items); // Update tombol lagi
            }
        });
        paginationContainer.appendChild(nextButton);
    }
    
    // Event listener input pencarian (Tidak berubah)
    searchBar.addEventListener('input', applyFilters);

    // Event listener klik kartu (Tidak berubah)
    topicGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('read-more-btn')) {
            const topicId = e.target.getAttribute('data-id');
            window.location.href = `artikel.html?id=${topicId}`;
        }
    });

    // Mulai aplikasi
    fetchData(); // Panggil fetchData untuk memulai
});
// KURUNG KURAWAL EKSTRA DIHAPUS (jika ada sebelumnya)