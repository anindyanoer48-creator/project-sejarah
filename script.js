// script.js (Versi Final Home - Dengan Penjaga #on-this-day)
document.addEventListener('DOMContentLoaded', () => {
    // --- "PENJAGA" UNTUK HALAMAN HOME ---
    const otdContainer = document.getElementById('on-this-day');
    if (!otdContainer) { 
        // Bukan halaman home -> hentikan semua logika terkait home agar tidak saling menimpa
        console.log('script.js: not on home page, exiting home script.');
        return; 
    }
    // --- AKHIR PENJAGA ---

    const featuredNewsSection = document.querySelector('.featured-news-container');
    const sekilasInfoItems = [ /* ... item info kamu ... */ 
         { title: "Tahukah Kamu? Bendera Pusaka", description: "Bendera pusaka pertama dijahit dari kain sprei...", link: "artikel.html?id=1"},
         { title: "Misteri Relief Terkubur Borobudur", description: "Di dasar Candi Borobudur terdapat relief Karmawibhangga...", link: "artikel.html?id=2"},
         { title: "Korupsi Meruntuhkan VOC", description: "Perusahaan terkaya sepanjang masa ini runtuh bukan hanya karena perang...", link: "artikel.html?id=3"},
         { title: "Peran Lain R.A. Kartini", description: "Selain emansipasi, Kartini juga aktif dalam pendidikan anak-anak desa...", link: "artikel.html?id=4"},
         { title: "Makna Lain Sumpah Pemuda", description: "Selain persatuan, Sumpah Pemuda juga menjadi penegas identitas bangsa...", link: "artikel.html?id=6"},
         { title: "Taktik Gerilya Diponegoro", description: "Perang Jawa menunjukkan kehebatan strategi gerilya Pangeran Diponegoro...", link: "artikel.html?id=7"}
    ];
    let allTopics = [];

    async function fetchAllTopics() { /* ... isi fetchAllTopics ... */ 
        const loaderOtd = document.querySelector('#otd-content p');
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allTopics = await response.json();
            console.log('script.js: fetched topics, count=', Array.isArray(allTopics)? allTopics.length: 0);
            displayOnThisDay();
        } catch (error) {
            console.error("Gagal mengambil data untuk home:", error);
            if(loaderOtd) loaderOtd.textContent = "Gagal memuat info sejarah hari ini.";
            if(otdContainer) otdContainer.style.display = 'block';
        }
    }
    function displayOnThisDay() { /* ... isi displayOnThisDay ... */ 
        console.log('script.js: displayOnThisDay called');
        const otdContent = document.getElementById('otd-content');
        if (!otdContainer || !otdContent || !Array.isArray(allTopics) || allTopics.length === 0) { if(otdContainer) otdContainer.style.display = 'none'; return; }
        const today = new Date(); const month = String(today.getMonth() + 1).padStart(2, '0'); const day = String(today.getDate()).padStart(2, '0'); const todayString = `${month}-${day}`;
        const matchingEvents = allTopics.filter(topic => topic && topic.eventDate === todayString);
        if (matchingEvents.length === 0) { otdContainer.style.display = 'none'; return; }
        otdContent.innerHTML = ''; const eventsToShow = matchingEvents.slice(0, 2);
        eventsToShow.forEach(event => { const eventDiv = document.createElement('div'); eventDiv.className = 'otd-item'; eventDiv.innerHTML = `<h3>${event.title || "Tanpa Judul"}</h3><p>${event.summary || "Tidak ada ringkasan."}</p><a href="artikel.html?id=${event.id}">Baca Selengkapnya &rarr;</a>`; otdContent.appendChild(eventDiv); });
        otdContainer.style.display = 'block'; otdContainer.setAttribute('data-aos', 'fade-in'); if (typeof AOS !== 'undefined') { AOS.refresh(); }
    }
    function displayFeaturedNews() { /* ... isi displayFeaturedNews ... */ 
        console.log('script.js: displayFeaturedNews called');
        const newsContainer = document.getElementById('featured-news-content');
        if (!featuredNewsSection || !newsContainer || !Array.isArray(sekilasInfoItems) || sekilasInfoItems.length === 0) { if (featuredNewsSection) featuredNewsSection.style.display = 'none'; return; }
        const today = new Date(); const startOfYear = new Date(today.getFullYear(), 0, 0); const diff = today - startOfYear; const oneDay = 1000 * 60 * 60 * 24; const dayOfYear = Math.floor(diff / oneDay); const index = (dayOfYear - 1 + sekilasInfoItems.length) % sekilasInfoItems.length; const selectedInfo = sekilasInfoItems[index];
        let htmlContent = `<h3>${selectedInfo.title}</h3><p>${selectedInfo.description}</p>`; if (selectedInfo.link) { htmlContent += `<a href="${selectedInfo.link}">Baca Lebih Lanjut &rarr;</a>`; }
        newsContainer.innerHTML = htmlContent; featuredNewsSection.style.display = 'block'; featuredNewsSection.setAttribute('data-aos','fade-in'); if (typeof AOS !== 'undefined') { AOS.refresh(); }
    }

    // --- Fungsionalitas Dasar ---
    const yearSpan = document.getElementById('copyright-year'); if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true }); }
    const backToTopButton = document.getElementById("back-to-top-btn"); if (backToTopButton) { /* ... logika back to top ... */ 
        window.onscroll = () => { const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0; if (scrollPosition > 200) { backToTopButton.classList.add("show"); } else { backToTopButton.classList.remove("show"); } }; backToTopButton.addEventListener("click", () => { window.scrollTo({ top: 0, behavior: 'smooth' }); }); 
    }
    // --- Akhir Fungsionalitas Dasar ---

    fetchAllTopics(); 
    displayFeaturedNews(); 
});