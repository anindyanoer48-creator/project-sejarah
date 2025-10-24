// basic-scripts.js (Skrip Dasar untuk Beberapa Halaman)
document.addEventListener('DOMContentLoaded', () => {

    // --- Logika untuk Copyright Dinamis ---
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Logika untuk Tombol Kembali ke Atas ---
    const backToTopButton = document.getElementById("back-to-top-btn");
    if (backToTopButton) {
        // Fungsi untuk menampilkan/menyembunyikan tombol
        const handleScroll = () => {
            // Gunakan nilai scroll yang konsisten
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            if (scrollPosition > 300) { // Tampilkan setelah scroll 300px
                backToTopButton.classList.add("show");
            } else {
                backToTopButton.classList.remove("show");
            }
        };

        // Fungsi untuk scroll ke atas
        const scrollToTop = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        // Tambahkan event listener
        window.addEventListener('scroll', handleScroll);
        backToTopButton.addEventListener("click", scrollToTop);

        // Panggil handleScroll sekali saat load untuk cek posisi awal
        handleScroll();
    }

    // --- Inisialisasi AOS (Animate On Scroll) ---
    // Pastikan library AOS sudah dimuat SEBELUM skrip ini di HTML
    if (typeof AOS !== 'undefined') {
         AOS.init({
            duration: 800, // Durasi animasi
            once: true     // Animasi hanya berjalan sekali saat scroll ke bawah
        });
        // console.log("AOS Initialized by basic-scripts.js"); // Opsional: Debug
    } else {
        // console.warn("AOS library not loaded before basic-scripts.js"); // Opsional: Debug
    }

});