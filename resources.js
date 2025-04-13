// Handle drag and drop functionality
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const resourcesList = document.getElementById('resourcesList');

// Store uploaded files
let uploadedFiles = [];

// Drag and drop events
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

// Click to upload
uploadArea.querySelector('.upload-btn').addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Handle uploaded files
function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type === 'application/pdf') {
            // Create object URL for the file
            const fileURL = URL.createObjectURL(file);
            
            // Add to uploaded files array
            uploadedFiles.push({
                name: file.name,
                size: formatFileSize(file.size),
                url: fileURL,
                date: new Date().toLocaleDateString()
            });
            
            // Update display
            displayResources();
        } else {
            alert('Please upload PDF files only');
        }
    });
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Display resources
function displayResources() {
    resourcesList.innerHTML = uploadedFiles.map(file => `
        <div class="resource-item">
            <div class="resource-icon">
                <i class="fas fa-file-pdf"></i>
            </div>
            <div class="resource-info">
                <div class="resource-name">${file.name}</div>
                <div class="resource-meta">${file.size} • Uploaded ${file.date}</div>
            </div>
            <div class="resource-actions">
                <a href="${file.url}" download="${file.name}" class="resource-btn" title="Download">
                    <i class="fas fa-download"></i>
                </a>
                <button class="resource-btn" onclick="deleteResource('${file.name}')" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Delete resource
function deleteResource(fileName) {
    uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
    displayResources();
}

// Search functionality
const searchIcon = document.querySelector('.search-icon');
const searchBox = document.querySelector('.search-box');
const searchInput = document.querySelector('.search-box input');

// Toggle search box
searchIcon.addEventListener('click', () => {
    searchBox.classList.toggle('active');
    if (searchBox.classList.contains('active')) {
        searchInput.focus();
    }
});

// Close search box when clicking outside
document.addEventListener('click', (e) => {
    if (!searchBox.contains(e.target) && !searchIcon.contains(e.target)) {
        searchBox.classList.remove('active');
    }
});

// Close search box with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchBox.classList.contains('active')) {
        searchBox.classList.remove('active');
        searchInput.value = '';
    }
});

// Cache for articles data
let cachedArticles = null;

// Initialize search functionality
async function initializeSearch() {
    const searchBox = document.getElementById('searchBox');
    const searchDropdown = document.getElementById('searchDropdown');
    const searchResults = document.getElementById('searchResults');

    // Fetch and cache articles
    async function fetchArticles() {
        if (cachedArticles) return cachedArticles;
        try {
            const response = await fetch('blogs.json');
            cachedArticles = await response.json();
            return cachedArticles;
        } catch (error) {
            console.error('Error fetching articles:', error);
            return [];
        }
    }

    // Search function
    async function performSearch(searchTerm) {
        if (searchTerm.length < 2) {
            searchResults.innerHTML = '';
            searchDropdown.classList.remove('active');
            return;
        }

        const articles = await fetchArticles();
        const searchTermLower = searchTerm.toLowerCase();
        
        const filteredArticles = articles.filter(article => 
            article.title.toLowerCase().includes(searchTermLower) ||
            article.excerpt.toLowerCase().includes(searchTermLower) ||
            article.category.toLowerCase().includes(searchTermLower)
        );

        if (filteredArticles.length === 0) {
            searchResults.innerHTML = '<p class="no-results">No articles found</p>';
        } else {
            const resultHTML = filteredArticles.map(article => `
                <a href="display.html?id=${article.id}" class="search-result-item">
                    <div class="search-result-img">
                        <img src="${article.image}" alt="${article.title}">
                    </div>
                    <div class="search-result-content">
                        <h3>${article.title}</h3>
                        <p>${article.excerpt}</p>
                        <span class="search-result-category">${article.category}</span>
                    </div>
                </a>
            `).join('');

            searchResults.innerHTML = resultHTML;
        }
        
        searchDropdown.classList.add('active');
    }

    // Event Listeners
    searchBox.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });

    searchBox.addEventListener('focus', () => {
        if (searchBox.value.length >= 2) {
            searchDropdown.classList.add('active');
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchDropdown.classList.remove('active');
        }
    });

    // Close dropdown with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchDropdown.classList.remove('active');
        }
    });
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSearch);

// Export for use in other files
window.initializeSearch = initializeSearch;