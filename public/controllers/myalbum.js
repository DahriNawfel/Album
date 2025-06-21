import MyalbumView from '../views/myalbum.js';

class MyAlbumController {
    constructor() {
        // Strict singleton pattern - return existing instance if it exists
        if (MyAlbumController.instance) {
            return MyAlbumController.instance;
        }

        // Create new instance
        this.instanceId = Math.random().toString(36).substr(2, 9);
        
        this.app = document.querySelector('#app');
        this.apiUrl = 'http://localhost:81';
        this.myalbumView = new MyalbumView();
        this.myAlbums = [];
        
        // Event listeners management
        this.eventListeners = [];
        this.isInitialized = false;
        
        // Form submission protection
        this.isSubmitting = false;
        this.initPromise = null;
        
        // Set as singleton instance
        MyAlbumController.instance = this;
        
        // Initialize
        this.init();
    }

    // Static method to get current instance
    static getInstance() {
        return MyAlbumController.instance;
    }

    // Static method to destroy current instance
    static destroyInstance() {
        if (MyAlbumController.instance) {
            MyAlbumController.instance.destroy();
            MyAlbumController.instance = null;
        }
    }

    async init() {
        
        // Prevent multiple initializations
        if (this.initPromise) {
            return this.initPromise;
        }
        
        this.initPromise = this._performInit();
        return this.initPromise;
    }

    async _performInit() {
        await this.checkAuth();
        this.user = await this.getUserInfo();
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve, { once: true });
            });
        }
        
        this.performInit();
    }

    async checkAuth() {
        try {
            const response = await fetch(`/api/auth/checkAuth`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            
            const data = await response.json();
            if (!data || data.authenticated === false) {
                window.location.href = '/auth';
                return;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = '/auth';
        }
    }

    async getUserInfo() {
        try {
            const response = await fetch(`/api/user-info`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user info');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching user info:', error);
            return null;
        }
    }

    performInit() {
        // Prevent double initialization
        if (this.isInitialized) {
            console.warn(`⚠️ Controller ${this.instanceId} already initialized, skipping...`);
            return;
        }
        
        this.cleanup();
        this.render();
        this.fetchCurrentUserData();
        this.fetchMyAlbums();
        this.isInitialized = true;
    }

    async fetchCurrentUserData() {
        try {
            const response = await fetch(`/api/me`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            
            if (response.ok) {
                this.currentUserData = await response.json();
                this.updateProfileIcon();
            }
        } catch (error) {
            console.error('Error fetching current user data:', error);
        }
    }

    updateProfileIcon() {
        const profileIcon = document.querySelector('#profile-icon');
        if (profileIcon && this.currentUserData) {
            const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNlNWU3ZWIiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSI4IiByPSI1Ii8+CjxwYXRoIGQ9Im0zIDIwYTEzIDEzIDAgMSAxIDE4IDAiLz4KPC9zdmc+Cjwvc3ZnPgo=';
            profileIcon.innerHTML = this.myalbumView.renderAvatar(this.currentUserData, defaultAvatar);
        }
    }

    // Convert privacy values between DB and UI
    dbPrivacyToUI(dbValue) {
        return dbValue == 1 ? 'private' : 'public';
    }

    uiPrivacyToDB(uiValue) {
        return uiValue === 'private' ? 1 : 0;
    }

    render() {
        this.app.innerHTML = this.myalbumView.render();
        // Wait for DOM to be fully rendered
        setTimeout(() => {
            this.setupEventListeners();
        }, 50);
    }

    // Enhanced event listener tracking with better duplicate prevention
    addEventListenerWithTracking(element, event, handler, options = {}) {
        if (!element) {
            console.warn('Trying to add event listener to null element');
            return;
        }
        
        // Create a unique identifier for this listener
        const listenerId = `${element.id || element.className || 'anonymous'}_${event}_${Date.now()}`;
        
        // Check if similar listener already exists on this element
        const existingListener = this.eventListeners.find(
            listener => listener.element === element && listener.event === event
        );
        
        if (existingListener) {
            console.warn(`Event listener for ${event} already exists on element, skipping...`);
            return;
        }
        
        const wrappedHandler = (e) => {
            try {
                // Additional check to ensure this is the active instance
                if (MyAlbumController.instance !== this) {
                    console.warn(`Event handled by inactive instance ${this.instanceId}, ignoring...`);
                    return;
                }
                handler(e);
            } catch (error) {
                console.error('Error in event handler:', error);
            }
        };
        
        element.addEventListener(event, wrappedHandler, options);
        this.eventListeners.push({
            id: listenerId,
            element,
            event,
            handler: wrappedHandler,
            options
        });
        
    }

    async logout() {
        try {
            const response = await fetch(`/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (response.ok) {
                this.currentUserData = null;
                this.user = null;
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    setupEventListeners() {
        // Prevent duplicate event listener setup
        if (this.eventListeners.length > 0) {
            console.warn(`⚠️ Event listeners already set up for instance ${this.instanceId}, cleaning up first...`);
            this.cleanupEventListeners();
        }
        
        
        // Get elements
        const backHomeBtn = document.querySelector('#back-home');
        const logoutBtn = document.querySelector('#logout');
        const createAlbumBtn = document.querySelector('#create-album');
        const profileIcon = document.querySelector('#profile-icon');
        const myAlbumsContainer = document.querySelector('#my-albums');

        // Navigation events
        if (backHomeBtn) {
            this.addEventListenerWithTracking(backHomeBtn, 'click', () => {
                window.router.navigate('/home');
            });
        }

        if (logoutBtn) {
            this.addEventListenerWithTracking(logoutBtn, 'click', () => {
                this.logout().then(() => {
                    window.router.navigate('/auth');
                }).catch(error => {
                    console.error('Logout error:', error);
                });
            });
        }

        // Create album button with enhanced protection
        if (createAlbumBtn) {
            this.addEventListenerWithTracking(createAlbumBtn, 'click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (this.isSubmitting) {
                    console.warn(`⚠️ Form submission in progress, ignoring click`);
                    return;
                }
                
                this.openModal();
            });
        }

        if (profileIcon) {
            this.addEventListenerWithTracking(profileIcon, 'click', () => {
                window.router.navigate('/profile');
            });
        }

        // Album actions with event delegation
        if (myAlbumsContainer) {
            this.addEventListenerWithTracking(myAlbumsContainer, 'click', (e) => {
                const target = e.target.closest('button');
                if (!target) return;

                const albumCard = target.closest('.album-card');
                if (!albumCard) return;

                const albumId = albumCard.dataset.id;
                const album = this.myAlbums.find(a => a.id == albumId);
                
                if (!album) {
                    console.error('Album not found with ID:', albumId);
                    return;
                }

                if (target.classList.contains('view-btn')) {
                    this.viewAlbum(album);
                } else if (target.classList.contains('edit-btn')) {
                    this.editAlbum(albumId);
                } else if (target.classList.contains('delete-btn')) {
                    this.confirmDeleteAlbum(albumId, album.title);
                } else if (target.classList.contains('create-first-btn')) {
                    if (this.isSubmitting) {
                        console.warn(`⚠️ Form submission in progress, ignoring click`);
                        return;
                    }
                    this.openModal();
                }
            });
        }

        // Setup modal events
        setTimeout(() => {
            this.setupModalEvents();
        }, 100);
    }

    setupModalEvents() {
        const modal = document.querySelector('#album-modal');
        const deleteModal = document.querySelector('#delete-modal');
        const closeBtns = document.querySelectorAll('.close');
        const cancelBtns = document.querySelectorAll('.cancel-btn');
        const form = document.querySelector('#album-form');

        // Close modals
        closeBtns.forEach(btn => {
            this.addEventListenerWithTracking(btn, 'click', () => {
                this.closeAllModals();
            });
        });

        cancelBtns.forEach(btn => {
            this.addEventListenerWithTracking(btn, 'click', () => {
                this.closeAllModals();
            });
        });
        
        // Close modal when clicking outside
        this.addEventListenerWithTracking(window, 'click', (e) => {
            if (e.target === modal || e.target === deleteModal) {
                this.closeAllModals();
            }
        });

        // CRITICAL: Form submission with singleton protection
        if (form) {
            this.addEventListenerWithTracking(form, 'submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                
                // Ensure only the active instance handles the form
                if (MyAlbumController.instance !== this) {
                    console.warn(`⚠️ Form submission ignored - not the active instance`);
                    return false;
                }
                
                // Prevent multiple submissions
                if (this.isSubmitting) {
                    console.warn(`⚠️ Form is already being submitted, ignoring...`);
                    return false;
                }
                
                this.handleFormSubmit();
                return false;
            });
        }
    }

    cleanupEventListeners() {
        
        this.eventListeners.forEach(({ element, event, handler, options }) => {
            try {
                if (element && element.removeEventListener) {
                    element.removeEventListener(event, handler, options);
                }
            } catch (error) {
                console.warn('Error removing event listener:', error);
            }
        });
        this.eventListeners = [];
    }

    cleanup() {
        this.cleanupEventListeners();
        this.closeAllModals();
        this.isSubmitting = false;
    }

    destroy() {
        this.cleanup();
        this.myAlbums = [];
        this.currentUserData = null;
        this.isInitialized = false;
        this.initPromise = null;
        
        // Clear singleton reference if this is the active instance
        if (MyAlbumController.instance === this) {
            MyAlbumController.instance = null;
        }
    }

    async fetchMyAlbums() {
        try {
            const response = await fetch(`/api/myalbums`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch my albums');
            }
            const data = await response.json();
            this.myAlbums = Array.isArray(data) ? data : [];
            this.renderMyAlbums();
        } catch (error) {
            console.error('Error fetching my albums:', error);
            const myAlbumsContainer = document.querySelector('#my-albums');
            if (myAlbumsContainer) {
                myAlbumsContainer.innerHTML = this.myalbumView.renderErrorMyAlbums(error);
            }
        }
    }

    renderMyAlbums() {
        const myAlbumsContainer = document.querySelector('#my-albums');
        if (!myAlbumsContainer) return;
        
        if (!this.myAlbums || this.myAlbums.length === 0) {
            myAlbumsContainer.innerHTML = this.myalbumView.renderNoMyAlbums();
            return;
        }

        myAlbumsContainer.innerHTML = this.myAlbums.map((album, index) => {
            const privacyUI = this.dbPrivacyToUI(album.privacy);
            return this.myalbumView.renderAlbums(album, index, privacyUI);
        }).join('');
    }

    openModal(albumData = null) {
        
        const modal = document.querySelector('#album-modal');
        const modalTitle = document.querySelector('#modal-title');
        const form = document.querySelector('#album-form');
        const submitBtn = document.querySelector('.submit-btn .btn-text');
        
        if (!modal) {
            console.error('Modal not found in DOM');
            return;
        }
        
        // Reset submission flag when opening modal
        this.isSubmitting = false;
        
        if (albumData) {
            if (modalTitle) modalTitle.textContent = 'Edit Album';
            if (submitBtn) submitBtn.textContent = 'Update Album';
            if (form) form.dataset.albumId = albumData.id;
            
            const titleInput = document.querySelector('#album-title');
            const privacySelect = document.querySelector('#album-privacy');
            
            if (titleInput) titleInput.value = albumData.title;
            if (privacySelect) privacySelect.value = this.dbPrivacyToUI(albumData.privacy);
        } else {
            if (modalTitle) modalTitle.textContent = 'Create Album';
            if (submitBtn) submitBtn.textContent = 'Create Album';
            if (form) form.removeAttribute('data-album-id');
            
            if (form) form.reset();
        }
        
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
            setTimeout(() => modal.style.display = 'none', 300);
        });
        
        // Reset submission flag when closing modals
        this.isSubmitting = false;
    }

    async handleFormSubmit() {
        // Final protection against multiple submissions
        if (this.isSubmitting) {
            console.warn(`⚠️ Form submission already in progress in instance ${this.instanceId}`);
            return;
        }
        
        this.isSubmitting = true;
        
        const form = document.querySelector('#album-form');
        if (!form) {
            console.error('Form not found');
            this.isSubmitting = false;
            return;
        }
        
        const formData = new FormData(form);
        const albumId = form.dataset.albumId;
        const submitBtn = document.querySelector('.submit-btn');
        
        const data = {
            title: formData.get('title')?.trim(),
            privacy: this.uiPrivacyToDB(formData.get('privacy'))
        };

        // Validation
        if (!data.title || !formData.get('privacy')) {
            alert('Please fill in all fields');
            this.isSubmitting = false;
            return;
        }

        // Loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="btn-text">Saving...</span>';
        }

        try {
            
            let response;
            if (albumId) {
                response = await fetch(`/api/album/${albumId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(data)
                });
            } else {
                response = await fetch(`/api/album`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(data)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save album');
            }

            const result = await response.json();
            
            this.closeAllModals();
            await this.fetchMyAlbums();
            
        } catch (error) {
            console.error('Error saving album:', error);
            alert(`Error saving album: ${error.message}`);
        } finally {
            // Reset button state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span class="btn-text">${albumId ? 'Update Album' : 'Create Album'}</span>`;
            }
            
            // Reset submission flag
            this.isSubmitting = false;
        }
    }

    async editAlbum(albumId) {
        try {
            const album = this.myAlbums.find(a => a.id == albumId);
            if (album) {
                this.openModal(album);
            } else {
                throw new Error('Album not found');
            }
        } catch (error) {
            console.error('Error editing album:', error);
            alert(`Error editing album: ${error.message}`);
        }
    }

    confirmDeleteAlbum(albumId, albumTitle) {
        const deleteModal = document.querySelector('#delete-modal');
        if (!deleteModal) return;
        
        const deleteContent = deleteModal.querySelector('p');
        if (deleteContent) {
            deleteContent.textContent = `Are you sure you want to delete "${albumTitle}"?`;
        }
        
        const confirmBtn = document.querySelector('#confirm-delete');
        if (confirmBtn) {
            confirmBtn.onclick = () => this.deleteAlbum(albumId);
        }
        
        deleteModal.style.display = 'block';
        setTimeout(() => deleteModal.classList.add('show'), 10);
    }

    async deleteAlbum(albumId) {
        const confirmBtn = document.querySelector('#confirm-delete');
        
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Deleting...';
        }

        try {
            const response = await fetch(`/api/album/${albumId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete album');
            }

            this.closeAllModals();
            await this.fetchMyAlbums();
            
        } catch (error) {
            console.error('Error deleting album:', error);
            alert(`Error deleting album: ${error.message}`);
        } finally {
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Delete Album';
            }
        }
    }

    viewAlbum(album) {
        if (!album || !album.id) {
            console.error('Invalid album data:', album);
            return;
        }
        
        window.router.navigate(`/viewAlbum?album=${album.id}`);
    }
}

MyAlbumController.instance = null;

export default MyAlbumController;