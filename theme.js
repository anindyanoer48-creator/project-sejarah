// theme.js
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const currentTheme = localStorage.getItem('theme');

// Fungsi untuk menerapkan tema
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.textContent = '🌙'; // Ganti ikon menjadi bulan
    } else {
        document.body.classList.remove('dark-mode');
        themeToggleBtn.textContent = '☀️'; // Ganti ikon menjadi matahari
    }
}

// Terapkan tema yang tersimpan saat halaman dimuat
if (currentTheme) {
    applyTheme(currentTheme);
}

// Tambahkan event listener untuk tombol
themeToggleBtn.addEventListener('click', () => {
    let theme = 'light';
    if (!document.body.classList.contains('dark-mode')) {
        theme = 'dark';
    }
    localStorage.setItem('theme', theme);
    applyTheme(theme);
});