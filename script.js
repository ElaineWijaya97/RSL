/* ADMIN AUTH */
const ADMIN_PASSWORD = "inventaris123";
let isAdmin = false;

// Wait for DOM to be fully loaded
function initApp() {
  // Initialize login modal
  const loginModal = document.getElementById("loginModal");
  const loginBtn = document.getElementById("loginBtn");
  const adminPassInput = document.getElementById("adminPass");

  if (loginModal && loginBtn && adminPassInput) {
    // Freeze the background - add class to body
    document.body.classList.add("modal-open");
    
    // Show the login modal
    loginModal.classList.remove("hidden");

    // Make sure modal card doesn't block clicks
    const modalCard = loginModal.querySelector(".modal-card");
    if (modalCard) {
      // Ensure modal card allows clicks through to children
      modalCard.style.pointerEvents = "auto";
    }
    
    // Block all clicks on modal background (but allow modal-card)
    loginModal.addEventListener("click", function(e) {
      // If click is on the modal background (not the card), prevent it
      if (e.target === loginModal) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, true);

    // Simple login handler function
    function handleLogin(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      const password = adminPassInput.value.trim();
      console.log("Login button clicked! Password:", password);
      
      if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        loginModal.classList.add("hidden");
        // Unfreeze the background
        document.body.classList.remove("modal-open");
        console.log("Login successful!");
      } else {
        alert("Password salah");
        adminPassInput.value = "";
        adminPassInput.focus();
      }
      return false;
    }

    // Make function globally available for inline onclick
    window.handleLoginClick = handleLogin;

    // Remove any existing handlers first
    loginBtn.onclick = null;
    
    // Simple direct onclick handler
    loginBtn.onclick = handleLogin;
    
    // Also add event listener as backup
    loginBtn.addEventListener("click", handleLogin, false);

    // Add Enter key handler
    adminPassInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter" || e.keyCode === 13) {
        e.preventDefault();
        handleLogin();
      }
    });

    // Focus the password input
    setTimeout(function() {
      adminPassInput.focus();
    }, 100);
  }

  // Initialize categories and inventory system
  const categoriesElem = document.getElementById('categories');
  const addCategoryBtn = document.getElementById('addCategoryBtn');
  const searchInput = document.getElementById('search');
  const logModal = document.getElementById('logModal');
  const saveLogBtn = document.getElementById('saveLogBtn');
  const cancelLogBtn = document.getElementById('cancelLogBtn');
  const logDateInput = document.getElementById('logDate');
  const logQtyInput = document.getElementById('logQty');
  const logPhotoInput = document.getElementById('logPhoto');
  const logExpiryInput = document.getElementById('logExpiry');
  const logTitle = document.getElementById('logTitle');

  let currentEditItem = null;
  let isAdding = true;

  let categories = [
    { 
      name: 'toiletris', 
      subcategories: [
        { 
          name: 'Popok', 
          subsub: [ 
            { name: 'XL', qty: 0, expiry: '', photos: [] } 
          ] 
        }
      ] 
    }
  ];

  // Check if Firebase is available
  const useFirebase = (typeof firebase !== 'undefined') && (typeof db !== 'undefined') && !!db;
  console.log('[Firebase] useFirebase =', useFirebase);
  const DATA_COLLECTION = 'inventaris';
  const DATA_DOC_ID = 'main';

  // Load from Firebase or localStorage
  function loadData() {
    if (useFirebase) {
      // Load from Firebase Firestore
      db.collection(DATA_COLLECTION).doc(DATA_DOC_ID).get()
        .then(function(doc) {
          if (doc.exists) {
            categories = doc.data().categories || categories;
            renderCategories();
            console.log('Data loaded from Firebase');
          } else {
            // No data in Firebase, try localStorage as fallback
            loadFromLocalStorage();
          }
        })
        .catch(function(error) {
          console.error('Error loading from Firebase:', error);
          // Fallback to localStorage
          loadFromLocalStorage();
        });
    } else {
      // Fallback to localStorage
      loadFromLocalStorage();
    }
  }

  // Load from localStorage (fallback)
  function loadFromLocalStorage() {
    const saved = localStorage.getItem('inventarisData');
    if (saved) {
      try {
        categories = JSON.parse(saved);
        renderCategories();
        console.log('Data loaded from localStorage');
      } catch (e) {
        console.error('Error loading data:', e);
      }
    } else {
      renderCategories();
    }
  }

  // Save to Firebase or localStorage
  let saveTimeout = null;
  function saveData() {
    if (useFirebase) {
      // Save to Firebase Firestore
      db.collection(DATA_COLLECTION).doc(DATA_DOC_ID).set({
        categories: categories,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(function() {
        console.log('Data saved to Firebase successfully');
        // Also save to localStorage as backup
        try {
          localStorage.setItem('inventarisData', JSON.stringify(categories));
        } catch (e) {
          console.warn('Could not save to localStorage backup:', e);
        }
      })
      .catch(function(error) {
        console.error('Error saving to Firebase:', error);
        // Fallback to localStorage
        saveToLocalStorage();
      });
    } else {
      // Fallback to localStorage
      saveToLocalStorage();
    }
  }

  // Save to localStorage (fallback)
  function saveToLocalStorage() {
    try {
      localStorage.setItem('inventarisData', JSON.stringify(categories));
      console.log('Data saved to localStorage');
    } catch (e) {
      console.error('Error saving data:', e);
      alert('Peringatan: Data tidak dapat disimpan. Mungkin storage penuh.');
    }
  }

  // Auto-save function with debouncing
  function autoSave() {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(function() {
      saveData();
    }, 500); // Save 500ms after last change
  }

  // Enhanced saveData that also triggers auto-save
  function saveDataNow() {
    saveData();
  }

  // Set up real-time listener for Firebase (if available)
  if (useFirebase) {
    db.collection(DATA_COLLECTION).doc(DATA_DOC_ID).onSnapshot(function(doc) {
      if (doc.exists && doc.data().categories) {
        const newCategories = doc.data().categories;
        // Only update if data is different (avoid infinite loops)
        if (JSON.stringify(categories) !== JSON.stringify(newCategories)) {
          categories = newCategories;
          renderCategories();
          console.log('Data synced from Firebase in real-time');
        }
      }
    }, function(error) {
      console.error('Error listening to Firebase:', error);
    });
  }

  // Render full category structure
  function renderCategories(filter) {
    if (!categoriesElem) return;
    
    filter = filter || '';
    categoriesElem.innerHTML = '';
    
    categories.forEach(function(cat, catIdx) {
      if (filter && !cat.name.toLowerCase().includes(filter.toLowerCase())) {
        // Check subcategories and subsub
        const hasMatch = cat.subcategories.some(function(sub) {
          return sub.name.toLowerCase().includes(filter.toLowerCase()) ||
                 sub.subsub.some(function(item) {
                   return item.name.toLowerCase().includes(filter.toLowerCase());
                 });
        });
        if (!hasMatch) return;
      }
      
      const catDiv = document.createElement('div');
      catDiv.className = 'category';
      
      let html = '<div class="row"><div class="name">' + cat.name + '</div>';
      if (isAdmin) {
        html += '<div><button class="small-btn tambah" onclick="window.addSubcategory(' + catIdx + ')">+ Sub</button>';
        html += '<button class="small-btn kurang" onclick="window.deleteCategory(' + catIdx + ')">Hapus</button></div>';
      }
      html += '</div>';
      html += '<div class="items">';
      
      cat.subcategories.forEach(function(sub, subIdx) {
        html += '<div class="subcategory">';
        html += '<div class="row"><div class="name">' + sub.name + '</div>';
        if (isAdmin) {
          html += '<div><button class="small-btn tambah" onclick="window.addSubsub(' + catIdx + ',' + subIdx + ')">+ Item</button>';
          html += '<button class="small-btn kurang" onclick="window.deleteSubcategory(' + catIdx + ',' + subIdx + ')">Hapus</button></div>';
        }
        html += '</div>';
        html += '<div class="items">';
        
        sub.subsub.forEach(function(item, itemIdx) {
          html += '<div class="subsubcategory">';
          html += '<div class="row">';
          html += '<div class="name">' + item.name;
          if (item.expiry) {
            html += ' <span style="color:var(--muted);font-size:0.9em">(Exp: ' + item.expiry + ')</span>';
          }
          html += '</div>';
          html += '<div class="qty-controls">';
          html += '<span style="font-weight:700;min-width:40px;text-align:center">' + (item.qty || 0) + '</span>';
          html += '<button class="small-btn tambah" onclick="window.openLogModal(' + catIdx + ',' + subIdx + ',' + itemIdx + ',true)">+</button>';
          html += '<button class="small-btn kurang" onclick="window.openLogModal(' + catIdx + ',' + subIdx + ',' + itemIdx + ',false)">-</button>';
          if (isAdmin) {
            html += '<button class="small-btn" onclick="window.editItem(' + catIdx + ',' + subIdx + ',' + itemIdx + ')" style="background:var(--accent);color:white;font-size:0.8em">Edit</button>';
            html += '<button class="small-btn kurang" onclick="window.deleteItem(' + catIdx + ',' + subIdx + ',' + itemIdx + ')">Hapus</button>';
          }
          html += '</div>';
          html += '</div>';
          
          // Show photos if any
          if (item.photos && item.photos.length > 0) {
            html += '<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">';
            item.photos.forEach(function(photo, photoIdx) {
              html += '<img src="' + photo + '" style="width:60px;height:60px;object-fit:cover;border-radius:6px;cursor:pointer" onclick="window.viewPhoto(\'' + photo + '\')" />';
            });
            html += '</div>';
          }
          
          html += '</div>';
        });
        
        html += '</div></div>';
      });
      
      html += '</div></div>';
      catDiv.innerHTML = html;
      categoriesElem.appendChild(catDiv);
    });
  }

  // Global functions for buttons
  window.addSubcategory = function(catIdx) {
    if (!isAdmin) return alert('Admin only');
    const name = prompt('Nama subkategori');
    if (!name) return;
    categories[catIdx].subcategories.push({ name: name, subsub: [] });
    saveDataNow();
    renderCategories();
  };

  window.addSubsub = function(catIdx, subIdx) {
    if (!isAdmin) return alert('Admin only');
    const name = prompt('Nama item');
    if (!name) return;
    categories[catIdx].subcategories[subIdx].subsub.push({ 
      name: name, 
      qty: 0, 
      expiry: '', 
      photos: [] 
    });
    saveDataNow();
    renderCategories();
  };

  window.deleteCategory = function(catIdx) {
    if (!isAdmin) return alert('Admin only');
    if (confirm('Hapus kategori ' + categories[catIdx].name + '?')) {
      categories.splice(catIdx, 1);
      saveDataNow();
      renderCategories();
    }
  };

  window.deleteSubcategory = function(catIdx, subIdx) {
    if (!isAdmin) return alert('Admin only');
    if (confirm('Hapus subkategori ' + categories[catIdx].subcategories[subIdx].name + '?')) {
      categories[catIdx].subcategories.splice(subIdx, 1);
      saveDataNow();
      renderCategories();
    }
  };

  window.deleteItem = function(catIdx, subIdx, itemIdx) {
    if (!isAdmin) return alert('Admin only');
    if (confirm('Hapus item ' + categories[catIdx].subcategories[subIdx].subsub[itemIdx].name + '?')) {
      categories[catIdx].subcategories[subIdx].subsub.splice(itemIdx, 1);
      saveDataNow();
      renderCategories();
    }
  };

  window.editItem = function(catIdx, subIdx, itemIdx) {
    if (!isAdmin) return alert('Admin only');
    const item = categories[catIdx].subcategories[subIdx].subsub[itemIdx];
    const newName = prompt('Nama item baru:', item.name);
    if (newName && newName !== item.name) {
      item.name = newName;
      saveDataNow();
      renderCategories();
    }
    const newExpiry = prompt('Tanggal kadaluarsa (dd/mm/yyyy):', item.expiry || '');
    if (newExpiry !== null) {
      item.expiry = newExpiry;
      saveDataNow();
      renderCategories();
    }
  };

  window.openLogModal = function(catIdx, subIdx, itemIdx, adding) {
    currentEditItem = { catIdx, subIdx, itemIdx };
    isAdding = adding;
    
    if (logTitle) {
      logTitle.textContent = adding ? 'Tambah' : 'Kurangi';
    }
    if (logQtyInput) {
      logQtyInput.value = 1;
    }
    if (logDateInput) {
      logDateInput.value = '';
    }
    if (logExpiryInput) {
      logExpiryInput.value = '';
    }
    if (logPhotoInput) {
      logPhotoInput.value = '';
    }
    
    if (logModal) {
      logModal.classList.remove('hidden');
      document.body.classList.add('modal-open');
    }
  };

  window.viewPhoto = function(photoUrl) {
    const img = document.createElement('img');
    img.src = photoUrl;
    img.style.cssText = 'max-width:90vw;max-height:90vh;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10001;border:4px solid white;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.5)';
    img.onclick = function() {
      document.body.removeChild(img);
    };
    document.body.appendChild(img);
  };

  // Save log
  if (saveLogBtn) {
    saveLogBtn.addEventListener('click', function() {
      if (!currentEditItem) return;
      
      const date = logDateInput ? logDateInput.value.trim() : '';
      const qty = logQtyInput ? parseInt(logQtyInput.value) : 1;
      const expiry = logExpiryInput ? logExpiryInput.value.trim() : '';
      
      if (!date) {
        alert('Tanggal wajib diisi!');
        return;
      }
      
      const item = categories[currentEditItem.catIdx]
        .subcategories[currentEditItem.subIdx]
        .subsub[currentEditItem.itemIdx];
      
      // Update quantity
      if (isAdding) {
        item.qty = (item.qty || 0) + qty;
      } else {
        item.qty = Math.max(0, (item.qty || 0) - qty);
      }
      
      // Update expiry date if provided
      if (expiry) {
        item.expiry = expiry;
      }
      
      // Handle photo
      if (logPhotoInput && logPhotoInput.files && logPhotoInput.files[0]) {
        const file = logPhotoInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
          if (!item.photos) item.photos = [];
          item.photos.push(e.target.result);
          saveDataNow();
          renderCategories();
        };
        reader.readAsDataURL(file);
      } else {
        saveDataNow();
        renderCategories();
      }
      
      // Close modal
      if (logModal) {
        logModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
      }
      currentEditItem = null;
    });
  }

  // Cancel log
  if (cancelLogBtn) {
    cancelLogBtn.addEventListener('click', function() {
      if (logModal) {
        logModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
      }
      currentEditItem = null;
    });
  }

  // Add category
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', function() {
      if (!isAdmin) {
        alert('Admin only');
        return;
      }
      const name = prompt('Nama kategori');
      if (!name) return;
      categories.push({ name: name, subcategories: [] });
      saveDataNow();
      renderCategories();
    });
  }

  // Auto-save on page unload
  window.addEventListener('beforeunload', function() {
    saveDataNow();
  });

  // Auto-save periodically (every 30 seconds) as backup
  setInterval(function() {
    if (categories && categories.length > 0) {
      saveData();
    }
  }, 30000);

  // Search
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      renderCategories(e.target.value);
    });
  }

  // Initialize
  loadData();
  renderCategories();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // DOM is already ready
  initApp();
}
