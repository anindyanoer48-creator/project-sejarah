// basic-scripts.js (Versi Final Bersih)
document.addEventListener('DOMContentLoaded', () => {

    // Logika untuk Copyright
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Logika untuk Tombol Kembali ke Atas
    const backToTopButton = document.getElementById("back-to-top-btn");
    if (backToTopButton) {
        window.onscroll = () => {
            // Menggunakan nilai scroll yang konsisten di semua browser
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
    
    // Inisialisasi AOS untuk semua halaman
    // Pastikan AOS Library sudah dimuat SEBELUM skrip ini di HTML
    if (typeof AOS !== 'undefined') {
         AOS.init({
            duration: 800, 
            once: true     
        });
    } else {
        console.error("AOS Library not loaded before basic-scripts.js");
    }
});