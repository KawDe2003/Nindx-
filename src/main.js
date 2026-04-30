import './style.css'

// Global state for data
let appData = {
  hotDeals: [],
  gallery: []
};

// Fetch data from local JSON
async function initApp() {
  try {
    const response = await fetch('/data.json');
    appData = await response.json();
    
    renderHotDeals();
    renderGallery();
    setupGalleryFilters();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Render Hot Deals to the grid
function renderHotDeals() {
  const listingsContainer = document.getElementById('car-listings');
  if (!listingsContainer) return;

  // Sort featured items to the top
  const sortedDeals = [...appData.hotDeals].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  listingsContainer.innerHTML = sortedDeals.map(car => `
    <div class="car-card reveal ${car.featured ? 'featured' : ''}">
      ${car.featured ? '<div class="featured-badge"><i class="fas fa-crown"></i> Featured</div>' : ''}
      <div class="car-image">
        <img src="${car.image}" alt="${car.name}">
      </div>
      <div class="car-info">
        <h3>${car.name}</h3>
        <p style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 1rem;">${car.trim}</p>
        <div class="car-meta">
          <span><i class="far fa-calendar"></i> ${car.specs.months}</span>
          <span><i class="fas fa-road"></i> ${car.specs.mileage}</span>
        </div>
        <div class="car-meta">
          <span><i class="fas fa-hand-holding-dollar"></i> ${car.specs.down}</span>
          <span><i class="fas fa-tag"></i> ${car.specs.msrp}</span>
        </div>
        <div class="car-price">
          $${car.price} <span>/ month</span>
        </div>
        <button class="btn btn-outline open-quote" style="width: 100%; margin-top: 1.5rem;">Check Availability</button>
      </div>
    </div>
  `).join('');
  
  observeElements();
}

// Render Gallery with optional filter
function renderGallery(filter = 'All') {
  const galleryContainer = document.querySelector('.gallery-grid');
  if (!galleryContainer) return;

  const filteredItems = filter === 'All' 
    ? appData.gallery 
    : appData.gallery.filter(item => item.category === filter);

  galleryContainer.innerHTML = filteredItems.map(item => `
    <div class="gallery-item reveal">
      <img src="${item.image}" alt="${item.title}">
      <div class="gallery-overlay">
        <h3>${item.title}</h3>
        <p>${item.category}</p>
      </div>
    </div>
  `).join('');

  // Re-attach lightbox listeners
  setupLightbox();
  observeElements();
}

// Setup Filter Buttons
function setupGalleryFilters() {
  const filterBtns = document.querySelectorAll('.gallery-filters .btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGallery(btn.textContent);
    });
  });
}

// Lightbox Logic
function setupLightbox() {
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  if (lightboxModal && lightboxImg) {
    document.querySelectorAll('.gallery-item img').forEach(img => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxModal.classList.add('active');
      });
    });

    lightboxClose?.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
    });

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('active');
      }
    });
  }
}

// Header Scroll Effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  menuToggle.querySelector('i').classList.toggle('fa-bars');
  menuToggle.querySelector('i').classList.toggle('fa-xmark');
});

// Close menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    menuToggle?.querySelector('i').classList.add('fa-bars');
    menuToggle?.querySelector('i').classList.remove('fa-xmark');
  });
});

// Modal Logic
const quoteModal = document.getElementById('quote-modal');
const brokerModal = document.getElementById('broker-modal');
const agreeBtn = document.getElementById('btn-agree');
const discardBtn = document.getElementById('btn-discard');

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('open-quote')) {
    e.preventDefault();
    quoteModal.classList.add('active');
  }
  if (e.target.classList.contains('modal-close')) {
    quoteModal.classList.remove('active');
    lightboxModal?.classList.remove('active');
  }
});

// Quote Form Submission UX
const quoteForms = document.querySelectorAll('.quote-form');
quoteForms.forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    btn.disabled = true;
    
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-check"></i> Request Sent!';
      btn.style.background = '#10b981';
      
      setTimeout(() => {
        quoteModal.classList.remove('active');
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 2000);
    }, 1500);
  });
});

agreeBtn?.addEventListener('click', () => {
  brokerModal.classList.remove('active');
});

discardBtn?.addEventListener('click', () => {
  brokerModal.classList.remove('active');
});

// Scroll Reveal Animation
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal-active');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

function observeElements() {
  document.querySelectorAll('.section, .stat-card, .service-card, .car-card, .testimonial-card, .about-content, .about-image, .gallery-item').forEach(el => {
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
    observer.observe(el);
  });
}

// Initial Call
initApp();

