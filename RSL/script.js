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
    
    // Add mousedown as another backup
    loginBtn.addEventListener("mousedown", function(e) {
      console.log("Button mousedown detected!");
    });
    
    // Test if button is clickable - add a visual test
    loginBtn.style.cursor = "pointer";
    loginBtn.style.position = "relative";
    loginBtn.style.zIndex = "10000";

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

    // Debug: log that button was found
    console.log("Login button found:", loginBtn);
    console.log("Login modal found:", loginModal);
  } else {
    console.error("Login elements not found!", {
      loginModal: !!loginModal,
      loginBtn: !!loginBtn,
      adminPassInput: !!adminPassInput
    });
  }

  // Initialize categories
  const categoriesElem = document.getElementById('categories');
  const addCategoryBtn = document.getElementById('addCategoryBtn');
  const searchInput = document.getElementById('search');

  let categories = [
    { name: 'toiletris', subcategories: [
        { name:'Popok', subsub: [ { name:'XL', qty:0 } ] }
      ] }
  ];

  function renderCategories(filter) {
    if (!categoriesElem) return;
    
    filter = filter || '';
    categoriesElem.innerHTML = '';
    
    categories.forEach(function(cat) {
      if (filter && !cat.name.toLowerCase().includes(filter)) return;
      
      const div = document.createElement('div');
      div.className = 'category';
      div.innerHTML = '<div class="name">' + cat.name + '</div>';
      categoriesElem.appendChild(div);
    });
  }

  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', function() {
      if (!isAdmin) {
        alert('Admin only');
        return;
      }
      const name = prompt('Nama kategori');
      if (!name) return;
      categories.push({ name: name, subcategories: [] });
      renderCategories();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      renderCategories(e.target.value.toLowerCase());
    });
  }

  renderCategories();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // DOM is already ready
  initApp();
}
