// home.js (Versi Final - Semua Masalah Fixed!)
document.addEventListener('DOMContentLoaded', () => {

    // --- Cek Elemen Penting ---
    const otdContainer = document.getElementById('on-this-day');
    const featuredNewsSection = document.querySelector('.featured-news-container');
    
    if (!otdContainer && !featuredNewsSection) {
        return;
    }

    // --- Daftar Sekilas Info (DIPERBANYAK!) ---
    const sekilasInfoItems = [
        { title: "Tahukah Kamu? Bendera Pusaka", description: "Bendera pusaka pertama dijahit dari kain sprei karena sulitnya mencari bahan pada masa itu. Semangat kemerdekaan mengalahkan keterbatasan!", link: "https://id.wikipedia.org/wiki/Bendera_Pusaka"},
        { title: "Misteri Relief Terkubur Borobudur", description: "Di dasar Candi Borobudur terdapat relief Karmawibhangga yang sengaja ditutup. Apa alasannya?", link: "artikel.html?id=2"},
        { title: "Korupsi Meruntuhkan VOC", description: "Perusahaan terkaya sepanjang masa ini runtuh bukan hanya karena perang, tapi korupsi internal yang masif.", link: "artikel.html?id=3"},
        { title: "Peran Lain R.A. Kartini", description: "Selain emansipasi, Kartini juga aktif dalam pendidikan anak-anak desa di Rembang.", link: "artikel.html?id=4"},
        { title: "Perjanjian Giyanti 1755", description: "Perjanjian yang membagi Kesultanan Mataram menjadi Yogyakarta dan Surakarta, mengubah tatanan politik Jawa.", link: "artikel.html?id=5"},
        { title: "Makna Lain Sumpah Pemuda", description: "Selain persatuan, Sumpah Pemuda juga menjadi penegas identitas bangsa di tengah keberagaman.", link: "artikel.html?id=6"},
        { title: "Taktik Gerilya Diponegoro", description: "Perang Jawa menunjukkan kehebatan strategi gerilya Pangeran Diponegoro yang merepotkan Belanda.", link: "artikel.html?id=7"},
        { title: "Sistem Tanam Paksa yang Kejam", description: "Cultuurstelsel memaksa petani menanam tanaman ekspor, menyebabkan penderitaan dan kelaparan massal.", link: "artikel.html?id=8"}
    ];

    let allTopics = [];

    // --- Fungsi "Pada Hari Ini Dalam Sejarah" ---
    function displayOnThisDay(topics) {
        const otdContent = document.getElementById('otd-content');
        
        if (!otdContainer || !otdContent) {
            return;
        }

        if (!Array.isArray(topics) || topics.length === 0) {
            otdContent.innerHTML = '<p>Tidak ada data sejarah untuk ditampilkan saat ini.</p>';
            return;
        }

        // Ambil tanggal hari ini
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${month}-${day}`;

        // Cari event yang cocok dengan eventDate hari ini
        let matchingEvents = topics.filter(topic => {
            return topic && topic.eventDate && topic.eventDate === todayString;
        });

        // Bersihkan konten
        otdContent.innerHTML = '';

        // Jika tidak ada event hari ini, tampilkan pesan
        if (matchingEvents.length === 0) {
            otdContent.innerHTML = '<p style="text-align: center; color: var(--text-color); font-style: italic;">Tidak ada peristiwa sejarah yang tercatat untuk hari ini ('+day+'/'+month+').</p>';
            return;
        }

        // Tampilkan maksimal 2 event
        const eventsToShow = matchingEvents.slice(0, 2);
        
        eventsToShow.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'otd-item';
            eventDiv.innerHTML = `
                <h3>${event.title || "Tanpa Judul"}</h3>
                <p>${event.summary || "Tidak ada ringkasan."}</p>
                <a href="artikel.html?id=${event.id}" class="otd-link">Baca Selengkapnya &rarr;</a>
            `;
            otdContent.appendChild(eventDiv);
        });

        if (typeof AOS !== 'undefined') { 
            AOS.refresh(); 
        }
    }

    // --- Fungsi "Sekilas Info" (TAMPILKAN 2-3 ITEM!) ---
    function displayFeaturedNews() {
        const newsContainer = document.getElementById('featured-news-content');
        
        if (!featuredNewsSection || !newsContainer) {
            return;
        }

        if (!Array.isArray(sekilasInfoItems) || sekilasInfoItems.length === 0) {
            featuredNewsSection.style.display = 'none';
            return;
        }

        // Pilih 3 item random setiap hari
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        
        // Shuffle dengan seed agar konsisten dalam 1 hari
        const shuffled = [...sekilasInfoItems].sort((a, b) => {
            const hashA = (seed + sekilasInfoItems.indexOf(a)) % sekilasInfoItems.length;
            const hashB = (seed + sekilasInfoItems.indexOf(b)) % sekilasInfoItems.length;
            return hashA - hashB;
        });
        
        // Ambil 3 item pertama
        const selectedItems = shuffled.slice(0, 3);

        // Render semua item
        newsContainer.innerHTML = '';
        
        selectedItems.forEach((info, index) => {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'news-item';
            infoDiv.innerHTML = `
                <h3>${info.title}</h3>
                <p>${info.description}</p>
                <a href="${info.link}" class="news-link">Baca Lebih Lanjut &rarr;</a>
            `;
            newsContainer.appendChild(infoDiv);
        });
        
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    // --- Fungsi Fetch Data ---
    async function fetchAllTopics() {
        try {
            const response = await fetch('data.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            allTopics = data;
            
            // Panggil display SETELAH data tersimpan
            displayOnThisDay(allTopics);
            
        } catch (error) {
            console.error('Error fetching data:', error);
            const otdContent = document.getElementById('otd-content');
            if(otdContent) {
                otdContent.innerHTML = `<p>Gagal memuat data: ${error.message}</p>`;
            }
        }
    }

    // --- Fungsionalitas Dasar ---
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true });
    }

    const backToTopButton = document.getElementById("back-to-top-btn");
    if (backToTopButton) {
        window.onscroll = () => {
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            if (scrollPosition > 200) { 
                backToTopButton.classList.add("show"); 
            } else { 
                backToTopButton.classList.remove("show"); 
            }
        };
        backToTopButton.addEventListener("click", () => { 
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        });
    }

    // --- EKSEKUSI UTAMA ---
    fetchAllTopics();
    displayFeaturedNews();
});