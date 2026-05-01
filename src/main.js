import './style.css'
import { client, urlFor } from './sanity.js'

// Global state for data
let appData = {
  hotDeals: [],
  gallery: []
};

// Fetch data from Sanity CMS
async function initApp() {
  try {
    const carsQuery = `*[_type == "car"] | order(year desc)`;
    const galleryQuery = `*[_type == "galleryItem"] | order(_createdAt desc)`;
    
    const [hotDeals, gallery] = await Promise.all([
      client.fetch(carsQuery),
      client.fetch(galleryQuery)
    ]);

    // Format data for the existing templates
    appData.hotDeals = hotDeals.map(car => ({
      name: car.make,
      trim: car.model,
      specs: {
        months: '36 Mos',
        mileage: '10k Mi/Yr',
        down: '$0 Down',
        msrp: 'MSRP'
      },
      price: car.price,
      image: car.image ? urlFor(car.image).url() : 'https://placehold.co/600x400/111/333?text=No+Image',
      featured: car.featured
    }));

    appData.gallery = gallery.map(item => ({
      title: item.title,
      category: 'Recent Delivery',
      image: item.image ? urlFor(item.image).url() : 'https://placehold.co/600x400/111/333?text=No+Image'
    }));
    
    renderHotDeals();
    renderGallery();
    setupGalleryFilters();
    initCustomSelects();
  } catch (error) {
    console.error('Error loading data from Sanity:', error);
  }
}

// Render Hot Deals to the grid
function renderHotDeals() {
  const listingsContainer = document.getElementById('car-listings');
  if (!listingsContainer) return;

  // Sort featured items to the top
  const sortedDeals = [...appData.hotDeals].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  if (sortedDeals.length === 0) {
    listingsContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; background: var(--bg-alt); border-radius: 12px; border: 1px dashed var(--border-color);">
        <i class="fas fa-car-side" style="font-size: 3rem; color: var(--accent); margin-bottom: 1rem; opacity: 0.5;"></i>
        <h3>No Hot Deals Currently Available</h3>
        <p style="color: var(--text-secondary);">We are currently updating our inventory. Check back soon or contact us for custom sourcing!</p>
        <button class="btn btn-primary open-quote" style="margin-top: 1.5rem;">Request Custom Sourcing</button>
      </div>
    `;
    return;
  }

  listingsContainer.innerHTML = sortedDeals.map(car => {
    const parts = car.name.split(' ');
    // Robust parsing: If 1st word is a year, 2nd is make. Otherwise 1st is make.
    const isYear = !isNaN(parseInt(parts[0]));
    const make = isYear ? (parts[1] || parts[0]) : parts[0];
    const model = isYear ? `${parts[0]} ${parts.slice(2).join(' ')}`.trim() : parts.slice(1).join(' ').trim() || parts[0];

    return `
    <div class="car-card reveal ${car.featured ? 'featured' : ''}">
      ${car.featured ? '<div class="featured-badge"><i class="fas fa-crown"></i> Featured</div>' : ''}
      <div class="car-image">
        <img src="${car.image}" alt="${car.name}">
      </div>
      <div class="car-info">
        <h3>${car.name}</h3>
        <p class="car-trim">${car.trim}</p>
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
        <button class="btn btn-outline open-quote" 
          data-make="${make}" 
          data-model="${model}"
          style="width: 100%; margin-top: 1.25rem;">Check Availability</button>
      </div>
    </div>
  `}).join('');
  
  observeElements();
}

// Render Gallery with optional filter
function renderGallery(filter = 'All') {
  const galleryContainer = document.querySelector('.gallery-grid');
  if (!galleryContainer) return;

  const filteredItems = filter === 'All' 
    ? appData.gallery 
    : appData.gallery.filter(item => item.category === filter);

  if (filteredItems.length === 0) {
    galleryContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
        <i class="fas fa-images" style="font-size: 3rem; color: var(--accent); margin-bottom: 1rem; opacity: 0.5;"></i>
        <h3>Gallery Empty</h3>
        <p style="color: var(--text-secondary);">Images of our latest deliveries are coming soon!</p>
      </div>
    `;
    return;
  }

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

// Custom Select Dropdown logic
function initCustomSelects() {
  const selects = document.querySelectorAll('select:not(.hidden-select)');
  
  selects.forEach(select => {
    // Wrap select
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    
    // Copy some classes if needed
    if (select.closest('.filter-group')) {
      wrapper.classList.add('filter-select');
    }
    
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    select.classList.add('hidden-select');
    
    // Create custom UI
    const trigger = document.createElement('div');
    trigger.className = 'select-trigger';
    trigger.innerHTML = `<span>${select.options[select.selectedIndex].text}</span><i class="fas fa-chevron-down"></i>`;
    wrapper.appendChild(trigger);
    
    const optionsList = document.createElement('div');
    optionsList.className = 'select-options';
    
    Array.from(select.options).forEach((option, index) => {
      const opt = document.createElement('div');
      opt.className = 'select-option' + (index === select.selectedIndex ? ' selected' : '');
      opt.textContent = option.text;
      opt.dataset.value = option.value;
      
      opt.addEventListener('click', () => {
        select.value = option.value;
        trigger.querySelector('span').textContent = option.text;
        wrapper.querySelectorAll('.select-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        wrapper.classList.remove('active');
        
        // Trigger change event for filtering
        select.dispatchEvent(new Event('change'));
      });
      
      optionsList.appendChild(opt);
    });
    
    wrapper.appendChild(optionsList);
    
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other dropdowns
      document.querySelectorAll('.custom-select').forEach(s => {
        if (s !== wrapper) s.classList.remove('active');
      });
      wrapper.classList.toggle('active');
    });
  });
  
  // Close on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('active'));
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

// Global click listener for modals and close events
document.addEventListener('click', (e) => {
  const openQuoteBtn = e.target.closest('.open-quote');
  if (openQuoteBtn) {
    e.preventDefault();
    
    // Reset fields first
    const makeInput = document.getElementById('quote-make');
    const modelInput = document.getElementById('quote-model');
    if (makeInput) makeInput.value = '';
    if (modelInput) modelInput.value = '';
    
    // Auto-fill Make and Model if data exists
    const make = openQuoteBtn.getAttribute('data-make');
    const model = openQuoteBtn.getAttribute('data-model');
    
    if (make && makeInput) makeInput.value = make;
    if (model && modelInput) modelInput.value = model;
    
    quoteModal.classList.add('active');
  }
  if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal-overlay')) {
    quoteModal.classList.remove('active');
    document.getElementById('lightbox-modal')?.classList.remove('active');
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
      
      setTimeout(() => {
        quoteModal.classList.remove('active');
        btn.innerHTML = originalText;
        btn.disabled = false;
        form.reset();
      }, 2000);
    }, 1500);
  });
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

// Handle Broker Modal (Show only once per device)
window.addEventListener('load', () => {
  const hasSeenPrompt = localStorage.getItem('nineStarPromptSeen');
  if (!hasSeenPrompt && brokerModal) {
    setTimeout(() => {
      brokerModal.classList.add('active');
    }, 1000);
  }
});

agreeBtn?.addEventListener('click', () => {
  localStorage.setItem('nineStarPromptSeen', 'true');
  brokerModal.classList.remove('active');
});

discardBtn?.addEventListener('click', () => {
  localStorage.setItem('nineStarPromptSeen', 'true');
  brokerModal.classList.remove('active');
});


// Hero Slider logic
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length === 0) return;
  
  let currentSlide = 0;
  
  function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }
  
  setInterval(nextSlide, 5000);
}

// Call slider init
initHeroSlider();
