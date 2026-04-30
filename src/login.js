import './style.css'

const loginForm = document.getElementById('login-form');
const errorMsg = document.getElementById('login-error');

// Default credentials (In a real app, this would be on a secure server)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'ninestar2024';

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        window.location.href = '/admin.html';
    } else {
        errorMsg.style.display = 'block';
        setTimeout(() => {
            errorMsg.style.display = 'none';
        }, 3000);
    }
});

// Scroll Reveal
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
        }
    });
});

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
