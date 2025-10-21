document.addEventListener('DOMContentLoaded', () => {
    const articleContent = document.getElementById('article-content');
    const loader = document.getElementById('loader');
    
    // 1. Ambil ID artikel dari URL
    const params = new URLSearchParams(window.location.search);
    const topicId = parseInt(params.get('id'));

    // 
    // --- INI PERBAIKANNYA (1/3) ---
    // Variabel ini didefinisikan di sini agar bisa diakses oleh SEMUA fungsi
    // 
    let allTopics = [];

    // GABUNGAN FUNGSI fetchArticleData
    async function fetchArticleData() {
        loader.classList.add('show'); 
        articleContent.style.display = 'none';

        if (!topicId) {
            displayError();
            loader.classList.remove('show');
            articleContent.style.display = 'block';
            return;
        }

        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error('Gagal memuat data.');
            
            // 
            // --- INI PERBAIKANNYA (2/3) ---
            // Kita mengisi variabel global, bukan membuat 'const' baru
            // 
            allTopics = await response.json(); 
            
            const article = allTopics.find(topic => topic.id === topicId);
            
            if (article) {
                displayArticle(article);
            } else {
                displayError();
            }
        } catch (error) {
            console.error(error);
            displayError();
        } finally {
            loader.classList.remove('show'); 
            articleContent.style.display = 'block'; 
        }
    }

    // Fungsi untuk menampilkan konten artikel
    function displayArticle(article) {
        displayBreadcrumbs(article);
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
        `;
        
        setupShareButtons(article);
        
        // 
        // --- INI PERBAIKANNYA (3/3) ---
        // Memanggil fungsi artikel terkait
        // 
        displayRelatedArticles(article); 
    }

    // FUNGSI BARU UNTUK ARTIKEL TERKAIT
    function displayRelatedArticles(currentArticle) {
        const relatedGrid = document.getElementById('related-grid');
        if (!relatedGrid) return; 

        const currentId = currentArticle.id;
        const currentCategory = currentArticle.category;

        // Fungsi filter ini SEKARANG bisa mengakses 'allTopics'
        const related = allTopics.filter(topic => 
            topic.category === currentCategory && topic.id !== currentId
        );

        const shuffled = related.sort(() => 0.5 - Math.random());
        const articlesToShow = shuffled.slice(0, 3);

        // Sembunyikan jika tidak ada
        if (articlesToShow.length === 0) {
            const container = document.getElementById('related-articles');
            if (container) container.style.display = 'none';
            return;
        }

        // Tampilkan jika ada
        articlesToShow.forEach(topic => {
            const card = document.createElement('div');
            card.className = 'topic-card';
            card.setAttribute('data-aos', 'fade-up');
            
            card.innerHTML = `
                <img src="${topic.image}" alt="${topic.title}" class="card-image">
                <div class="card-content">
                    <h3>${topic.title}</h3>
                    <a href="artikel.html?id=${topic.id}" class="read-more-btn">Baca Selengkapnya</a>
                </div>
            `;
            relatedGrid.appendChild(card);
        });
    }

    // Fungsi untuk tombol berbagi
    function setupShareButtons(article) {
        const container = document.getElementById('share-buttons-container');
        if (!container) return;
        const url = window.location.href; 
        const title = article.title; 
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);
        
        // --- PERBAIKAN KECIL ---
        // Menggunakan '=' (ganti) bukan '+=' (tambah) untuk menghindari judul duplikat
        container.innerHTML = ` 
            <h4>Bagikan cerita ini:</h4>
            <div class="share-buttons-wrapper">
                <a href="https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}" class="share-btn whatsapp" target="_blank">WhatsApp</a>
                <a href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}" class="share-btn twitter" target="_blank">Twitter</a>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" class="share-btn facebook" target="_blank">Facebook</a>
                <button id="copy-link-btn" class="share-btn copy-link">Salin Tautan</button>
            </div>
        `;

        const copyBtn = document.getElementById('copy-link-btn');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(url).then(() => {
                copyBtn.textContent = 'Tautan disalin!';
                setTimeout(() => { copyBtn.textContent = 'Salin Tautan'; }, 2000);
            }).catch(err => {
                console.error('Gagal menyalin tautan: ', err);
                copyBtn.textContent = 'Gagal';
            });
        });
    }

    // --- FUNGSI setupDisqus() SUDAH DIHAPUS DARI SINI ---

    // Fungsi untuk breadcrumbs
    function displayBreadcrumbs(article) {
        const breadcrumbNav = document.getElementById('breadcrumb-nav');
        if (!breadcrumbNav) return;
        const encodedCategory = encodeURIComponent(article.category);
        breadcrumbNav.innerHTML = `
            <a href="index.html">Home</a>
            <span class="separator">/</span>
            <a href="index.html?kategori=${encodedCategory}">${article.category}</a>
            <span class="separator">/</span>
            <span class="current-page">${article.title}</span>
        `;
    }

    // Fungsi untuk pesan error
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

    // Jalankan fungsi utama
    fetchArticleData();
});