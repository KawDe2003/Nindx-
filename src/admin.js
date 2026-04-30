import './style.css'

let appData = { hotDeals: [], gallery: [] };
let currentTab = 'deals'; // 'deals' or 'gallery'
let editingId = null;

// Initialization
async function initAdmin() {
  // Security Check
  if (sessionStorage.getItem('isAdminAuthenticated') !== 'true') {
    window.location.href = '/login.html';
    return;
  }

  try {
    const response = await fetch('/data.json');
    appData = await response.json();
    renderList();
    setupEventListeners();
  } catch (error) {
    console.error('Error loading admin data:', error);
  }
}

function setupEventListeners() {
  // Tab switching (Desktop & Mobile)
  const navItems = document.querySelectorAll('.nav-item, .mobile-nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active'));
      // Sync all items with the same tab
      document.querySelectorAll(`[data-tab="${item.dataset.tab}"]`).forEach(i => i.classList.add('active'));
      
      currentTab = item.dataset.tab;
      document.getElementById('tab-title').textContent = 
        currentTab === 'deals' ? 'Hot Deals Management' : 'Gallery Management';
      renderList();
    });
  });

  // Auto-Save (Desktop & Mobile)
  const saveBtn = document.getElementById('export-json');
  const mobileSaveBtn = document.getElementById('mobile-export-btn');

  const handleSave = async (btn) => {
    const originalText = btn.innerHTML;
    try {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      btn.disabled = true;

      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData)
      });

      if (response.ok) {
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.style.color = '#10b981';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.color = '';
          btn.disabled = false;
        }, 2000);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Auto-save failed.');
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  };

  saveBtn.addEventListener('click', () => handleSave(saveBtn));
  mobileSaveBtn?.addEventListener('click', () => handleSave(mobileSaveBtn));

  // Add New button
  document.getElementById('add-new-btn').addEventListener('click', () => {
    openModal(null);
  });

  // Form submission
  document.getElementById('edit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveItem();
  });

  // Modal close
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    });
  });
}

function updateStats() {
  document.getElementById('stat-total-cars').textContent = appData.hotDeals.length;
  document.getElementById('stat-active-deals').textContent = appData.hotDeals.filter(i => i.price > 0).length;
  document.getElementById('stat-gallery-items').textContent = appData.gallery.length;
}

function renderList() {
  const container = document.getElementById('items-list');
  const items = currentTab === 'deals' ? appData.hotDeals : appData.gallery;

  container.innerHTML = items.map(item => `
    <div class="admin-card">
      <div class="admin-card-img">
        <img src="${item.image}" alt="${item.name || item.title}">
      </div>
      <div class="admin-card-info">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <h3>${item.name || item.title}</h3>
          ${item.featured ? '<span class="featured-badge"><i class="fas fa-crown"></i> Featured</span>' : ''}
        </div>
        <p>${currentTab === 'deals' ? `$${item.price} / month` : item.category}</p>
        <div class="admin-card-actions">
          <button class="btn-icon edit" onclick="window.editItem(${item.id})">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn-icon delete" onclick="window.deleteItem(${item.id})">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>
  `).join('');
  
  updateStats();
}

window.editItem = (id) => {
  openModal(id);
};

window.deleteItem = (id) => {
  if (confirm('Are you sure you want to delete this item?')) {
    if (currentTab === 'deals') {
      appData.hotDeals = appData.hotDeals.filter(i => i.id !== id);
    } else {
      appData.gallery = appData.gallery.filter(i => i.id !== id);
    }
    renderList();
  }
};

function openModal(id) {
  editingId = id;
  const modal = document.getElementById('edit-modal');
  const fieldsContainer = document.getElementById('form-fields');
  const items = currentTab === 'deals' ? appData.hotDeals : appData.gallery;
  const item = id ? items.find(i => i.id === id) : {};

  document.getElementById('modal-title').textContent = id ? 'Edit Item' : 'Add New Item';

  if (currentTab === 'deals') {
    fieldsContainer.innerHTML = `
      <div class="form-group">
        <label>Car Name</label>
        <input type="text" id="field-name" value="${item.name || ''}" placeholder="e.g. 2024 Nissan Rogue">
      </div>
      <div class="form-group">
        <label>Trim/Details</label>
        <input type="text" id="field-trim" value="${item.trim || ''}" placeholder="e.g. AWD Premium">
      </div>
      <div class="form-group">
        <label>Monthly Price ($)</label>
        <input type="number" id="field-price" value="${item.price || ''}">
      </div>
      <div class="form-group">
        <label>Image URL</label>
        <input type="text" id="field-image" value="${item.image || ''}">
      </div>
      <div class="form-group">
        <label>Lease Term</label>
        <input type="text" id="field-months" value="${item.specs?.months || '36 Mo'}">
      </div>
      <div class="form-group">
        <label>Mileage Limit</label>
        <input type="text" id="field-mileage" value="${item.specs?.mileage || '10K Mi'}">
      </div>
      <div class="form-group">
        <label>Down Payment</label>
        <input type="text" id="field-down" value="${item.specs?.down || '$0 Down'}">
      </div>
      <div class="form-group">
        <label>MSRP</label>
        <input type="text" id="field-msrp" value="${item.specs?.msrp || ''}">
      </div>
      <div class="form-group" style="grid-column: span 2; display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px;">
        <input type="checkbox" id="field-featured" ${item.featured ? 'checked' : ''} style="width: auto;">
        <label for="field-featured" style="margin: 0;">Mark as Featured Deal (Highlight on Home Page)</label>
      </div>
    `;
  } else {
    fieldsContainer.innerHTML = `
      <div class="form-group">
        <label>Title</label>
        <input type="text" id="field-title" value="${item.title || ''}">
      </div>
      <div class="form-group">
        <label>Category</label>
        <select id="field-category">
          <option value="Luxury" ${item.category === 'Luxury' ? 'selected' : ''}>Luxury</option>
          <option value="SUVs" ${item.category === 'SUVs' ? 'selected' : ''}>SUVs</option>
          <option value="Sports" ${item.category === 'Sports' ? 'selected' : ''}>Sports</option>
        </select>
      </div>
      <div class="form-group" style="grid-column: span 2;">
        <label>Image URL</label>
        <input type="text" id="field-image" value="${item.image || ''}">
      </div>
    `;
  }

  modal.classList.add('active');
}

function saveItem() {
  const newItem = { id: editingId || Date.now() };

  if (currentTab === 'deals') {
    newItem.name = document.getElementById('field-name').value;
    newItem.trim = document.getElementById('field-trim').value;
    newItem.price = parseInt(document.getElementById('field-price').value);
    newItem.featured = document.getElementById('field-featured').checked;
    newItem.image = document.getElementById('field-image').value;
    newItem.specs = {
      months: document.getElementById('field-months').value,
      mileage: document.getElementById('field-mileage').value,
      down: document.getElementById('field-down').value,
      msrp: document.getElementById('field-msrp').value,
    };

    if (editingId) {
      const idx = appData.hotDeals.findIndex(i => i.id === editingId);
      appData.hotDeals[idx] = newItem;
    } else {
      appData.hotDeals.push(newItem);
    }
  } else {
    newItem.title = document.getElementById('field-title').value;
    newItem.category = document.getElementById('field-category').value;
    newItem.image = document.getElementById('field-image').value;

    if (editingId) {
      const idx = appData.gallery.findIndex(i => i.id === editingId);
      appData.gallery[idx] = newItem;
    } else {
      appData.gallery.push(newItem);
    }
  }

  document.getElementById('edit-modal').classList.remove('active');
  renderList();
}

initAdmin();
