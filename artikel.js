// artikel.js (Skrip Lengkap untuk Halaman Detail Artikel)
document.addEventListener('DOMContentLoaded', () => {

    // --- "PENJAGA" UNTUK HALAMAN ARTIKEL ---
    // Cek elemen spesifik artikel. Jika tidak ada, hentikan.
    const articleContent = document.getElementById('article-content');
    if (!articleContent) {
        // console.log("artikel.js dihentikan, ini bukan halaman artikel."); // Opsional
        return;
    }
    // --- AKHIR PENJAGA ---

    // console.log("artikel.js berjalan..."); // Opsional

    const loader = document.getElementById('loader');
    const params = new URLSearchParams(window.location.search);
    const topicId = parseInt(params.get('id'));
    let allTopics = []; // Variabel global untuk menyimpan semua data

    // --- Fungsi Fetch Data ---
    async function fetchArticleData() {
        if (!loader || !articleContent) return;
        loader.classList.add('show');
        articleContent.style.display = 'none';
        const relatedContainer = document.getElementById('related-articles');
        if (relatedContainer) relatedContainer.style.display = 'none'; // Sembunyikan related sementara

        // Validasi topicId
        if (!topicId || isNaN(topicId)) {
            displayError("ID Artikel tidak valid atau tidak ditemukan di URL.");
            // Tidak perlu set display/loader di sini, finally akan handle
            return;
        }

        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error(`Gagal memuat data.json: ${response.status} ${response.statusText}`);

            allTopics = await response.json();
            if (!Array.isArray(allTopics)) { throw new Error('Format data.json tidak valid (bukan array).'); }

            const article = allTopics.find(topic => topic && topic.id === topicId); // Cari artikel

            if (article) {
                displayArticle(article); // Tampilkan artikel utama
                displayRelatedArticles(article); // Tampilkan artikel terkait
            } else {
                displayError(`Artikel dengan ID ${topicId} tidak ditemukan.`);
            }
        } catch (error) {
            console.error("Error di fetchArticleData:", error);
            displayError(`Terjadi kesalahan saat memuat artikel: ${error.message}`);
        } finally {
            // Bagian finally ini akan SELALU berjalan, baik sukses maupun error
            if (loader) loader.classList.remove('show');
            // Tampilkan articleContent HANYA jika tidak ada error (pesan error sudah ditampilkan oleh displayError)
            // Atau jika konten artikel sudah berhasil diisi
             if (articleContent && (articleContent.querySelector('.article-header') || articleContent.querySelector('h1'))) {
                 articleContent.style.display = 'block';
             } else if (articleContent && !articleContent.querySelector('h1')) {
                 // Jika masih kosong (kemungkinan error), biarkan displayError yg handle
                 articleContent.style.display = 'block'; // Tampilkan pesan error dari displayError
             }
        }
    }

    // --- Fungsi Display Article ---
    function displayArticle(article) {
        if (!articleContent || !article) return;
        displayBreadcrumbs(article); // Tampilkan breadcrumbs dulu
        document.title = article.title || "Detail Artikel"; // Set judul tab

        // Proses fullStory dengan fallback
        const storyHtml = (article.fullStory && typeof article.fullStory === 'string')
            ? article.fullStory.split('\n').map(p => `<p>${p.trim()}</p>`).join('')
            : '<p>Konten cerita tidak tersedia.</p>';

        // Isi konten utama
        articleContent.innerHTML = `
            <div class="article-header" data-aos="fade-in">
                <h1 class="article-title">${article.title || "Tanpa Judul"}</h1>
                <p class="article-category">Kategori: ${article.category || "Tidak Diketahui"}</p>
            </div>
            <img class="article-image" src="${article.image || 'images/placeholder.png'}" alt="${article.title || 'Gambar artikel'}" data-aos="fade-in" data-aos-delay="100">
            <div class="article-body" data-aos="fade-up" data-aos-delay="200">
                ${storyHtml}
            </div>
        `;
        setupShareButtons(article); // Siapkan tombol berbagi
        // displayRelatedArticles dipanggil di fetchData setelah data siap
    }

    // --- Fungsi Display Related Articles ---
    function displayRelatedArticles(currentArticle) {
        const relatedGrid = document.getElementById('related-grid');
        const relatedContainer = document.getElementById('related-articles');
        // Pengecekan lebih ketat
        if (!relatedGrid || !relatedContainer || !currentArticle || !Array.isArray(allTopics) || allTopics.length === 0) {
             if (relatedContainer) relatedContainer.style.display = 'none';
             // console.log("Skipping related: missing elements or data"); // Debug
             return;
        }

        const currentId = currentArticle.id;
        const currentCategory = currentArticle.category;

        if (!currentCategory) {
             relatedContainer.style.display = 'none'; // Sembunyikan jika artikel ini tidak punya kategori
             // console.log("Skipping related: current article has no category"); // Debug
             return;
        }

        // Filter artikel terkait
        const related = allTopics.filter(topic =>
            topic && topic.id && topic.category === currentCategory && topic.id !== currentId
        );

        relatedGrid.innerHTML = ''; // Selalu bersihkan grid

        if (related.length === 0) {
            relatedContainer.style.display = 'none'; // Sembunyikan jika tidak ada yg terkait
            // console.log("Skipping related: no related articles found"); // Debug
            return;
        }

        // Acak dan ambil maksimal 3
        const shuffled = related.sort(() => 0.5 - Math.random());
        const articlesToShow = shuffled.slice(0, 3);

        relatedContainer.style.display = 'block'; // Tampilkan container

        // Buat kartu untuk artikel terkait
        articlesToShow.forEach(topic => {
            const card = document.createElement('div');
            card.className = 'topic-card';
            card.setAttribute('data-aos', 'fade-up'); // Terapkan AOS
            card.innerHTML = `
                <img src="${topic.image || 'images/placeholder.png'}" alt="${topic.title || 'Gambar artikel'}" class="card-image">
                <div class="card-content">
                    <h3>${topic.title || "Tanpa Judul"}</h3>
                    <a href="artikel.html?id=${topic.id}" class="read-more-btn">Baca Selengkapnya</a>
                </div>
            `;
            relatedGrid.appendChild(card);
        });

        // Refresh AOS setelah menambahkan elemen
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    // --- Fungsi Setup Share Buttons ---
     function setupShareButtons(article) {
        const container = document.getElementById('share-buttons-container');
        if (!container || !article) return;
        container.innerHTML = ''; // Selalu bersihkan dulu

        const url = window.location.href;
        const title = article.title || "Artikel Sejarah Menarik"; // Judul default
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);

        // Buat HTML tombol
        container.innerHTML = `
            <h4>Bagikan cerita ini:</h4>
            <div class="share-buttons-wrapper" data-aos="fade-up">
                <a href="https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}" class="share-btn whatsapp" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <a href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}" class="share-btn twitter" target="_blank" rel="noopener noreferrer">X</a>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" class="share-btn facebook" target="_blank" rel="noopener noreferrer">Facebook</a>
                <button id="copy-link-btn" class="share-btn copy-link">Salin Tautan</button>
            </div>
        `;

        // Tambahkan event listener untuk tombol Salin
        const copyBtn = document.getElementById('copy-link-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(url).then(() => {
                    copyBtn.textContent = 'Tautan disalin!';
                    copyBtn.disabled = true;
                    setTimeout(() => {
                        copyBtn.textContent = 'Salin Tautan';
                        copyBtn.disabled = false;
                    }, 2000);
                }).catch(err => {
                    console.error('Gagal menyalin tautan: ', err);
                    copyBtn.textContent = 'Gagal';
                     setTimeout(() => { copyBtn.textContent = 'Salin Tautan'; }, 2000);
                });
            });
        }
    }

    // --- Fungsi Display Breadcrumbs ---
    function displayBreadcrumbs(article) {
        const breadcrumbNav = document.getElementById('breadcrumb-nav');
        if (!breadcrumbNav || !article) return;

        const category = article.category || "Lainnya"; // Fallback kategori
        const title = article.title || "Artikel";       // Fallback judul
        const encodedCategory = encodeURIComponent(category);

        // Link kategori sekarang ke halaman arsip
        breadcrumbNav.innerHTML = `
            <a href="index.html">Home</a>
            <span class="separator">/</span>
            <a href="arsip.html?kategori=${encodedCategory}">${category}</a>
            <span class="separator">/</span>
            <span class="current-page">${title}</span>
        `;
    }

    // --- Fungsi Display Error ---
    function displayError(message = "Terjadi kesalahan.") {
        console.error("Displaying Error:", message); // Log error
        if (!articleContent) return;
        document.title = "Error Memuat Artikel";
        articleContent.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h1>Oops! Terjadi Kesalahan</h1>
                <p>${message}</p>
                <p>Silakan coba kembali ke halaman sebelumnya atau hubungi administrator.</p>
                <a href="arsip.html" class="back-link" style="margin-top: 1rem;">← Kembali ke Daftar Artikel</a>
            </div>
        `;
        // Pastikan elemen lain disembunyikan
        const relatedContainer = document.getElementById('related-articles');
        const shareContainer = document.getElementById('share-buttons-container');
        if (relatedContainer) relatedContainer.style.display = 'none';
        if (shareContainer) shareContainer.style.display = 'none';
        // Pastikan loader hilang dan pesan error terlihat
         if (loader) loader.classList.remove('show');
         if (articleContent) articleContent.style.display = 'block';
    }

    // --- Fungsionalitas Dasar (Copyright, BackToTop, AOS Init) ---
    // Logika untuk Copyright
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Inisialisasi AOS (hanya jika library AOS dimuat)
    if (typeof AOS !== 'undefined') {
         AOS.init({ duration: 800, once: true });
    }

    // Logika untuk Tombol Kembali ke Atas
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

    // ===========================================
    // BAGIAN EKSEKUSI UTAMA
    // ===========================================
    // Panggil fungsi fetchData SEKARANG, setelah semua fungsi didefinisikan
    fetchArticleData();

});