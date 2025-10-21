// script.js (Versi Aman dengan "Guard Clause")
document.addEventListener('DOMContentLoaded', () => {

    // 
    // --- INI ADALAH "PENJAGA" KITA ---
    // 
    // Kita cek elemen yang HANYA ADA di halaman home, yaitu 'search-bar'
    const searchBar = document.getElementById('search-bar');
    
    // Jika 'search-bar' TIDAK DITEMUKAN,
    // berarti ini bukan halaman home. Hentikan skrip ini.
    if (!searchBar) {
        console.log("script.js (Home) dihentikan, ini bukan halaman home.");
        return; // Hentikan eksekusi
    }
    // 
    // --- AKHIR DARI "PENJAGA" ---
    // 

    // Jika kode lolos dari penjaga, baru jalankan sisa skrip halaman Home:
    const topicGrid = document.getElementById('topic-grid');
    const loader = document.getElementById('loader');
    const tagContainer = document.getElementById('tag-container');

    let allTopics = [];
    let activeTag = 'All';

    const params = new URLSearchParams(window.location.search);
    const categoryFromUrl = params.get('kategori');
    if (categoryFromUrl) {
        activeTag = categoryFromUrl;
    }

    async function fetchData() {
        loader.classList.add('show'); 
        topicGrid.style.display = 'none'; 
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allTopics = await response.json();
            displayTopics(allTopics);
            createTags();
        } catch (error) {
            console.error("Gagal mengambil data:", error);
            topicGrid.innerHTML = "<p>Gagal memuat data. Silakan coba lagi nanti.</p>";
        } finally {
            loader.classList.remove('show'); 
            topicGrid.style.display = 'grid'; 
        }
    }

    function displayTopics(topics) {
        topicGrid.innerHTML = ''; 
        if (topics.length === 0) {
            topicGrid.innerHTML = "<p>Tidak ada topik yang cocok dengan pencarian Anda.</p>";
            return;
        }
        
        topics.forEach(topic => {
            const card = document.createElement('div');
            card.className = 'topic-card';
            card.setAttribute('data-aos', 'fade-up'); 

            card.innerHTML = `
                <img src="${topic.image}" alt="${topic.title}" class="card-image">
                <div class="card-content">
                    <span class="category">${topic.category}</span>
                    <h3>${topic.title}</h3>
                    <p class="summary">${topic.summary}</p>
                    <button class="read-more-btn" data-id="${topic.id}">Baca Selengkapnya</button>
                </div>
            `;
            topicGrid.appendChild(card);
        });
    }

    function createTags() {
        const categories = ['All', ...new Set(allTopics.map(topic => topic.category))];
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
                applyFilters();
            });
            tagContainer.appendChild(tagBtn);
        });
    }

    function applyFilters() {
        const searchTerm = searchBar.value.toLowerCase();
        let filteredTopics = allTopics.filter(topic => {
            const byTag = activeTag === 'All' || topic.category === activeTag;
            const bySearch = (topic.title.toLowerCase().includes(searchTerm) || topic.summary.toLowerCase().includes(searchTerm));
            return byTag && bySearch;
        });
        displayTopics(filteredTopics);
    }
    
    // Event Listeners
    searchBar.addEventListener('input', applyFilters);

    topicGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('read-more-btn')) {
            const topicId = e.target.getAttribute('data-id');
            window.location.href = `artikel.html?id=${topicId}`;
        }
    });

    // Mulai aplikasi
    fetchData();
});