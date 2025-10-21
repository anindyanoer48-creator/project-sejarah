// script.js (Versi Final Bersih + Penjaga Benar)
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
            // Terapkan atribut AOS (inisialisasi ada di basic-scripts.js)
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
        // Refresh AOS setelah menambahkan elemen baru (penting!)
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
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
    
    searchBar.addEventListener('input', applyFilters);

    topicGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('read-more-btn')) {
            const topicId = e.target.getAttribute('data-id');
            window.location.href = `artikel.html?id=${topicId}`;
        }
    });

    fetchData();
});
// KURUNG KURAWAL EKSTRA DIHAPUS