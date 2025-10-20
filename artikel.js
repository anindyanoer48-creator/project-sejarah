document.addEventListener('DOMContentLoaded', () => {
    const articleContent = document.getElementById('article-content');
    const loader = document.getElementById('loader');
    // 1. Ambil ID artikel dari URL
    const params = new URLSearchParams(window.location.search);
    const topicId = parseInt(params.get('id'));

    async function fetchArticleData() {
        loader.classList.add('show'); // Tampilkan spinner
        articleContent.style.display = 'none'; // Sembunyikan konten sementara

        // ... (kode get ID Anda tidak berubah) ...

        try {
            // ... (kode fetch Anda tidak berubah) ...
        } catch (error) {
            // ... (kode catch Anda tidak berubah) ...
        } finally {
            loader.classList.remove('show'); // Sembunyikan spinner
            articleContent.style.display = 'block'; // Tampilkan lagi area konten
        }
    }
    // 2. Ambil semua data dari JSON
    async function fetchArticleData() {
        if (!topicId) {
            displayError();
            return;
        }

        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error('Gagal memuat data.');
            
            const allTopics = await response.json();
            
            // 3. Cari artikel yang cocok dengan ID
            const article = allTopics.find(topic => topic.id === topicId);
            
            // 4. Tampilkan artikel atau pesan error
            if (article) {
                displayArticle(article);
            } else {
                displayError();
            }
        } catch (error) {
            console.error(error);
            displayError();
        }
    }

    // Fungsi untuk menampilkan konten artikel
    function displayArticle(article) {
        displayBreadcrumbs(article);
        // Mengubah judul tab browser
        document.title = article.title;

        articleContent.innerHTML = `
            <div class="article-header">
                <h1 class="article-title">${article.title}</h1>
                <p class="article-category">Kategori: ${article.category}</p>
            </div>
            <img class="article-image" src="${article.image}" alt="${article.title}">
            <div class="article-body">
                ${article.fullStory.split('\n').map(p => `<p>${p}</p>`).join('')}
            </div>
            <a href="index.html" class="back-link">← Kembali ke Daftar Artikel</a>
        `;
        // Panggil fungsi untuk membuat tombol berbagi
    setupShareButtons(article);
    }

    // TAMBAHKAN FUNGSI BARU INI
function setupShareButtons(article) {
    const container = document.getElementById('share-buttons-container');
    const url = window.location.href; // URL halaman saat ini
    const title = article.title; // Judul artikel

    // Mengenkode teks untuk URL
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    container.innerHTML += `
        <div class="share-buttons-wrapper">
            <a href="https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}" class="share-btn whatsapp" target="_blank">WhatsApp</a>
            <a href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}" class="share-btn twitter" target="_blank">Twitter</a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" class="share-btn facebook" target="_blank">Facebook</a>
            <button id="copy-link-btn" class="share-btn copy-link">Salin Tautan</button>
        </div>
    `;

    // Menambahkan fungsionalitas untuk tombol "Salin Tautan"
    const copyBtn = document.getElementById('copy-link-btn');
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(url).then(() => {
            copyBtn.textContent = 'Tautan disalin!';
            setTimeout(() => {
                copyBtn.textContent = 'Salin Tautan';
            }, 2000); // Kembali ke teks semula setelah 2 detik
        }).catch(err => {
            console.error('Gagal menyalin tautan: ', err);
            copyBtn.textContent = 'Gagal';
        });
    });
}
    // Fungsi untuk menampilkan breadcrumb
    // TAMBAHKAN FUNGSI BARU INI
function displayBreadcrumbs(article) {
    const breadcrumbNav = document.getElementById('breadcrumb-nav');
    if (!breadcrumbNav) return;

    // Mengenkode kategori untuk URL yang aman
    const encodedCategory = encodeURIComponent(article.category);

    breadcrumbNav.innerHTML = `
        <a href="index.html">Home</a>
        <span class="separator">/</span>
        <a href="index.html?kategori=${encodedCategory}">${article.category}</a>
        <span class="separator">/</span>
        <span class="current-page">${article.title}</span>
    `;
}
    // Fungsi untuk menampilkan pesan error jika artikel tidak ditemukan
    function displayError() {
        document.title = "Artikel Tidak Ditemukan";
        articleContent.innerHTML = `
            <div style="text-align: center;">
                <h1>404 - Artikel Tidak Ditemukan</h1>
                <p>Maaf, artikel yang Anda cari tidak ada atau telah dihapus.</p>
                <a href="index.html" class="back-link">← Kembali ke Halaman Utama</a>
            </div>
        `;
    }

    // Logika untuk Tombol Kembali ke Atas dan Copyright
    const backToTopButton = document.getElementById("back-to-top-btn");
    const yearSpan = document.getElementById('copyright-year');
    
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    if (backToTopButton) {
        window.onscroll = () => {
            if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
                backToTopButton.classList.add("show");
            } else {
                backToTopButton.classList.remove("show");
            }
        };
        backToTopButton.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Jalankan fungsi utama
    fetchArticleData();
});