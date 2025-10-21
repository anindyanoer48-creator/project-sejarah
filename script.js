document.addEventListener('DOMContentLoaded', () => {

    const topicGrid = document.getElementById('topic-grid');
    const loader = document.getElementById('loader');
    const searchBar = document.getElementById('search-bar');
    const tagContainer = document.getElementById('tag-container');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const closeButton = document.querySelector('.close-button');

    let allTopics = [];
    let activeTag = 'All';

    // Fungsi untuk menerapkan filter berdasarkan kategori
    const params = new URLSearchParams(window.location.search);
    const categoryFromUrl = params.get('kategori');
    if (categoryFromUrl) {
        activeTag = categoryFromUrl;
    }

    // --- PERBAIKAN: Fungsi fetchData() yang sudah digabung dan diperbaiki ---
    async function fetchData() {
        loader.classList.add('show'); // Tampilkan spinner
        topicGrid.style.display = 'none'; // Sembunyikan grid sementara
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allTopics = await response.json();
            displayTopics(allTopics);
            createTags();
        } catch (error) {
            console.error("Gagal mengambil data:", error);
            topicGrid.innerHTML = "<p>Gagal memuat data. Silakan coba lagi nanti.</p>";
        } finally {
            loader.classList.remove('show'); // Sembunyikan spinner
            topicGrid.style.display = 'grid'; // Tampilkan lagi grid
        }
    }
    // --- FUNGSI fetchData() DUPLIKAT YANG KEDUA TELAH DIHAPUS ---

    // 2. Menampilkan semua kartu topik
    function displayTopics(topics) {
        topicGrid.innerHTML = ''; // Kosongkan grid sebelum menampilkan data baru
        if (topics.length === 0) {
            topicGrid.innerHTML = "<p>Tidak ada topik yang cocok dengan pencarian Anda.</p>";
            return;
        }
        
        topics.forEach(topic => {
            const card = document.createElement('div');
            card.className = 'topic-card';

            // --- TAMBAHAN KODE AOS (Langkah 1) ---
            // Menambahkan atribut data-aos untuk animasi
            card.setAttribute('data-aos', 'fade-up');
            // ------------------------------------

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

    // 3. Membuat tombol filter kategori secara dinamis
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

    // 4. Menerapkan filter dari search dan tag
    function applyFilters() {
        const searchTerm = searchBar.value.toLowerCase();
        
        let filteredTopics = allTopics;

        // Filter berdasarkan tag aktif
        if (activeTag !== 'All') {
            filteredTopics = filteredTopics.filter(topic => topic.category === activeTag);
        }

        // Filter berdasarkan kata kunci pencarian
        if (searchTerm) {
            filteredTopics = filteredTopics.filter(topic => 
                topic.title.toLowerCase().includes(searchTerm) ||
                topic.summary.toLowerCase().includes(searchTerm)
            );
        }

        displayTopics(filteredTopics);
    }
    
    // 5. Logika untuk Modal (Dibiarkan jika masih dipakai)
    function openModal(topicId) {
        const topic = allTopics.find(t => t.id === topicId);
        if (topic) {
            modalBody.innerHTML = `
                <h2>${topic.title}</h2>
                <p><strong>Kategori:</strong> ${topic.category}</p>
                <img src="${topic.image}" alt="${topic.title}" style="width:100%; max-height: 250px; object-fit: cover; border-radius: 8px;">
                <p>${topic.fullStory}</p>
            `;
            modal.style.display = 'block';
        }
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    // 6. Event Listeners
    searchBar.addEventListener('input', applyFilters);

    topicGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('read-more-btn')) {
            const topicId = e.target.getAttribute('data-id');
            // Arahkan pengguna ke halaman baru dengan menyertakan ID artikel
            window.location.href = `artikel.html?id=${topicId}`;
        }
    });

    closeButton.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Mulai aplikasi
    fetchData();

    // Copyright
    const yearSpan = document.getElementById('copyright-year');
    yearSpan.textContent = new Date().getFullYear();

    // --- TAMBAHAN KODE AOS (Langkah 2) ---
    // Menginisialisasi ("menyalakan") AOS
    AOS.init({
        duration: 800, // Durasi animasi dalam milidetik
        once: true     // Animasi hanya terjadi satu kali
    });
    // ------------------------------------

    // Tombol Kembali ke Atas
    const backToTopButton = document.getElementById("back-to-top-btn");

    // Tampilkan tombol saat scroll ke bawah
    window.onscroll = function() {
        if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
            backToTopButton.classList.add("show");
        } else {
            backToTopButton.classList.remove("show");
        }
    };

    // Gulir ke atas saat tombol diklik
    backToTopButton.addEventListener("click", function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});