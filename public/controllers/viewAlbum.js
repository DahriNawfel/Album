import viewAlbumView from '../views/viewAlbum.js';

class ViewAlbumController {
    constructor() {
        this.app = document.querySelector('#app');
        
        this.apiUrl = 'http://localhost:81';
        this.album = null;
        this.pictures = [];
        this.albumId = null;
        this.viewAlbumView = new viewAlbumView();
        this.isOwner = false;
        
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.user = await this.getUserInfo();
        this.albumId = this.getAlbumFromUrl();
        
        if (!this.albumId || isNaN(this.albumId)) {
            window.router.navigate('/albums');
            return;
        }

        this.render();
        this.fetchAlbumData();
    }

    getAlbumFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('album');
    }

    async checkAuth() {
        try {
            const response = await fetch(`${this.apiUrl}/auth/checkAuth`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            const authData = await response.json();
            if (!authData || authData.authenticated === false) {
                window.location.href = '/auth';
            }
        } catch (error) {
            console.error('Error during authentication check:', error);
            window.location.href = '/auth';
        }
    }

    async getUserInfo() {
        try {
            const response = await fetch(`${this.apiUrl}/user-info`, {
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


    dbPrivacyToUI(dbValue) {
        return dbValue == 1 ? 'private' : 'public';
    }

    checkOwnership() {
        if (!this.album || !this.user) {
            return false;
        }
        let isOwner = false;
        if (this.user && this.album) {
            const userId = this.user.id;
            const albumOwnerId = this.album.user_id;

            if (userId !== undefined && albumOwnerId !== undefined) {
                if (String(userId) === String(albumOwnerId) || parseInt(userId) === parseInt(albumOwnerId)) {
                    isOwner = true;
                }
            }
        }

        return isOwner;
    }

    render() {
        this.app.innerHTML = this.viewAlbumView.render();
        this.setupEventListeners();
    }

    async logout() {
        try {
            const response = await fetch(`${this.apiUrl}/auth/logout`, {
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
        // Navigation
        document.querySelector('#back-btn').addEventListener('click', () => {
            window.history.back();
        });

        document.querySelector('#logout').addEventListener('click', () => {
            this.logout().then(() => {
                window.router.navigate('/auth');
            }).catch(error => {
                console.error('Logout error:', error);
            });
        });

        // Add photo button
        document.querySelector('#add-photo').addEventListener('click', () => {
            this.openPhotoModal();
        });

        // Event delegation for photo actions
        document.querySelector('#photos-grid').addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) {
                const img = e.target.closest('.photo-item img');
                if (img) {
                    const photoCard = img.closest('.photo-item');
                    const photoId = photoCard.dataset.id;
                    const photo = this.pictures.find(p => p.id == photoId);
                    if (photo) {
                        this.viewPhoto(photo);
                    }
                }
                return;
            }

            const photoCard = target.closest('.photo-item');
            if (!photoCard) return;

            const photoId = photoCard.dataset.id;
            const photo = this.pictures.find(p => p.id == photoId);

            if (target.classList.contains('delete-photo-btn')) {
                this.confirmDeletePhoto(photoId, photo.title || 'this photo');
            }
            else if (target.classList.contains('chatgpt-btn')) {
                this.openChatGPTModal(photo);
            }
        });

        // Event listener pour le bouton "Add Your First Photo"
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'add-first-photo') {
                this.openPhotoModal();
            }
        });

        this.setupModalEvents();
    }

    setupModalEvents() {
        const photoModal = document.querySelector('#photo-modal');
        const deleteModal = document.querySelector('#delete-photo-modal');
        const viewerModal = document.querySelector('#photo-viewer-modal');
        const chatgptModal = document.querySelector('#chatgpt-modal');
        const closeBtns = document.querySelectorAll('.close');
        const cancelBtns = document.querySelectorAll('.cancel-btn');
        const form = document.querySelector('#photo-form');
        const fileInput = document.querySelector('#photo-file');

        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        cancelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target === photoModal || e.target === deleteModal || e.target === viewerModal) {
                this.closeAllModals();
            }
        });
        const chatgptForm = document.querySelector('#chatgpt-form');
        if (chatgptForm) {
            chatgptForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleChatGPTSubmit();
            });
        }

        // Event listener amélioré pour la sélection de fichier
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            const preview = document.querySelector('#file-preview');
            
            // Réinitialiser l'affichage
            preview.innerHTML = '';
            
            if (!file) return;
            
            try {
                // Valider le fichier
                this.validateImageFile(file);
                
                // Afficher la prévisualisation
                await this.handleFilePreview(file);
                
            } catch (error) {
                // Afficher l'erreur
                preview.innerHTML = `
                    <div class="file-error">
                        ${error.message}
                    </div>
                `;
                
                // Réinitialiser l'input
                e.target.value = '';
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePhotoSubmit();
        });
    }

    // Méthode pour valider les fichiers d'image
    validateImageFile(file) {
        const allowedTypes = [
            'image/jpeg', 
            'image/jpg', 
            'image/png', 
            'image/gif', 
            'image/webp',
            'image/bmp',
            'image/tiff'
        ];
        const maxSize = 100 * 1024 * 1024; // 100MB max (avant compression)
        
        if (!allowedTypes.includes(file.type.toLowerCase())) {
            throw new Error('Please select a valid image file (JPEG, PNG, GIF, WebP, BMP, or TIFF)');
        }
        
        if (file.size > maxSize) {
            throw new Error(`File too large (${this.formatFileSize(file.size)}). Please select an image smaller than 100MB`);
        }
        
        if (file.size === 0) {
            throw new Error('The selected file appears to be empty');
        }
        
        return true;
    }

    openChatGPTModal(photo) {
        this.currentChatGPTPhoto = photo;
        const modal = document.querySelector('#chatgpt-modal');
        const form = document.querySelector('#chatgpt-form');
        const responseDiv = document.querySelector('#chatgpt-response');
        const imagePreview = document.querySelector('#chatgpt-image-preview');
        
        // Reset du formulaire
        form.reset();
        responseDiv.innerHTML = '';
        responseDiv.style.display = 'none';
        
        // Afficher l'image dans le modal
        imagePreview.innerHTML = `<img src="${photo.picture}" alt="Photo" style="max-width: 200px; max-height: 200px; border-radius: 8px;">`;
        
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Focus sur le champ de question
        document.querySelector('#chatgpt-question').focus();
    }


    async handleChatGPTSubmit() {
        const questionInput = document.querySelector('#chatgpt-question');
        const submitBtn = document.querySelector('#chatgpt-submit-btn');
        const responseDiv = document.querySelector('#chatgpt-response');
        const question = questionInput.value.trim();

        if (!question) {
            alert('Please enter a question');
            return;
        }

        submitBtn.disabled = true;
        const originalButtonText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="btn-text">Analyzing...</span>';

        responseDiv.style.display = 'block';
        responseDiv.innerHTML = `
            <div class="chatgpt-loading">
                <div class="loading-spinner"></div>
                <p>ChatGPT is analyzing your image...</p>
            </div>
        `;

        try {
            const response = await this.sendImageToChatGPT(this.currentChatGPTPhoto.picture, question);
            
            responseDiv.innerHTML = `
                <div class="chatgpt-response-content">
                    <h4>ChatGPT Response:</h4>
                    <div class="response-text">${this.formatChatGPTResponse(response.message)}</div>
                    ${response.usage ? `<div class="usage-info">Tokens used: ${response.usage.total_tokens}</div>` : ''}
                </div>
            `;
            
        } catch (error) {
            console.error('ChatGPT Error:', error);
            responseDiv.innerHTML = `
                <div class="chatgpt-error">
                    <h4>Error:</h4>
                    <p>${error.message}</p>
                </div>
            `;
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalButtonText;
        }
    }


    async sendImageToChatGPT(imageBase64, question) {
        try {
            const response = await fetch(`${this.apiUrl}/chat/image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    message: question,
                    image: imageBase64
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.status !== 'success') {
                throw new Error(data.message || 'Unknown error occurred');
            }
            
            return data.data;
            
        } catch (error) {
            console.error('Error calling ChatGPT API:', error);
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error - please check your connection');
            }
            
            throw new Error(`ChatGPT Error: ${error.message}`);
        }
    }

    
    formatChatGPTResponse(response) {
        return response
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    // Méthode pour compresser une image
    async compressImage(file, maxWidth = 1200, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            try {
                // Calculer les nouvelles dimensions en gardant le ratio
                let { width, height } = img;
                
                // Always resize if larger than max dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                
                // Ensure minimum compression happens
                if (width === img.width && height === img.height && file.size > 500 * 1024) {
                    // Force resize even if within limits for large files
                    width = Math.min(width, maxWidth);
                    height = Math.min(height, maxHeight);
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Améliorer la qualité de rendu
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // Dessiner l'image redimensionnée
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convertir en blob avec compression
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            } catch (error) {
                reject(new Error(`Compression failed: ${error.message}`));
            }
        };
        
        img.onerror = () => {
            reject(new Error('Failed to load image for compression'));
        };
        
        img.src = URL.createObjectURL(file);
    });
}

    // Méthode pour convertir un blob en base64
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Méthode pour afficher la taille du fichier de manière lisible
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async handleFilePreview(file) {
        const preview = document.querySelector('#file-preview');
        
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const sizeFormatted = this.formatFileSize(file.size);
                const isLarge = file.size > 5 * 1024 * 1024; // Plus de 5MB
                
                preview.innerHTML = this.viewAlbumView.renderFilePreview(file, e, sizeFormatted, isLarge);
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '';
        }
    }

    async fetchAlbumData() {
        try {
            // Récupérer les détails de l'album
            const albumResponse = await fetch(`${this.apiUrl}/album/${this.albumId}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!albumResponse.ok) {
                throw new Error('Failed to fetch album details');
            }

            const albumData = await albumResponse.json();
            this.album = Array.isArray(albumData) ? albumData[0] : albumData;
            
            
            // Utiliser la méthode centralisée
            this.isOwner = this.checkOwnership();
            
            // Récupérer les photos de l'album
            const photosResponse = await fetch(`${this.apiUrl}/byalbum/${this.albumId}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (photosResponse.ok) {
                const photosData = await photosResponse.json();
                this.pictures = Array.isArray(photosData) ? photosData : [];
            } else {
                this.pictures = [];
            }

            this.renderAlbumInfo();
            this.renderPhotos();
        } catch (error) {
            console.error('Error fetching album data:', error);
            document.querySelector('#album-stats').innerHTML = this.viewAlbumView.renderErrorAlbum(error);
        }
    }


    renderAlbumInfo() {
        if (!this.album) return;

        const privacyUI = this.dbPrivacyToUI(this.album.privacy);
        
        document.querySelector('#album-title').textContent = this.album.title;
        document.querySelector('#album-meta').innerHTML = `
            <div class="album-privacy ${privacyUI}">
                ${privacyUI === 'public' ? '🌍' : '🔒'} ${privacyUI}
            </div>
            ${this.isOwner ? '<div class="owner-badge">👤 Your Album</div>' : ''}
        `;

        const pictureCount = Array.isArray(this.pictures) ? this.pictures.length : 0;

        document.querySelector('#album-stats').innerHTML = this.viewAlbumView.renderAlbumInfo(this.album, pictureCount);

        // Affichage du bouton d'ajout
        const addPhotoBtn = document.querySelector('#add-photo');
        
        if (this.isOwner && addPhotoBtn) {
            addPhotoBtn.style.display = 'flex';
        } else {
            if (addPhotoBtn) addPhotoBtn.style.display = 'none';
        }
    }

    renderPhotos() {
        const photosGrid = document.querySelector('#photos-grid');
        const photosCount = document.querySelector('#photos-count');
        
        const picturesArray = Array.isArray(this.pictures) ? this.pictures : [];
        
        photosCount.textContent = `${picturesArray.length} photo${picturesArray.length !== 1 ? 's' : ''}`;

        if (picturesArray.length === 0) {
            photosGrid.innerHTML = this.viewAlbumView.renderNoPhotos(this.isOwner);
            return;
        }

        photosGrid.innerHTML = picturesArray.map((photo, index) => this.viewAlbumView.renderPhoto(photo, index, this.isOwner)).join('');
    }

    openPhotoModal() {
        const modal = document.querySelector('#photo-modal');
        const form = document.querySelector('#photo-form');
        
        form.reset();
        document.querySelector('#file-preview').innerHTML = '';
        
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
            setTimeout(() => modal.style.display = 'none', 300);
        });
    }

    // Méthode améliorée pour gérer l'upload avec compression
    async handlePhotoSubmit() {
    const fileInput = document.querySelector('#photo-file');
    const file = fileInput.files[0];
    const submitBtn = document.querySelector('.submit-btn');
    const preview = document.querySelector('#file-preview');

    if (!file) {
        alert('Please select a file');
        return;
    }

    submitBtn.disabled = true;
    let originalButtonText = submitBtn.innerHTML;

    try {
        // Valider à nouveau le fichier
        this.validateImageFile(file);
        
        submitBtn.innerHTML = '<span class="btn-text">Processing...</span>';

        let processedFile = file;
        let compressionInfo = '';
        
        const maxSizeBeforeCompression = 500 * 1024; // 500KB
        
        if (file.size > maxSizeBeforeCompression ) {
            submitBtn.innerHTML = '<span class="btn-text">Compressing image...</span>';
            
            const originalSize = file.size;
            
            try {
                // Use more aggressive compression settings
                processedFile = await this.compressImage(file, 1200, 800, 0.7); // Smaller max dimensions, lower quality
                const newSize = processedFile.size;
                
                compressionInfo = `Compressed from ${this.formatFileSize(originalSize)} to ${this.formatFileSize(newSize)}`;
                
                // If still too large after compression, compress more aggressively
                if (processedFile.size > 800 * 1024) { // Still larger than 800KB
                    processedFile = await this.compressImage(file, 800, 600, 0.5);
                    compressionInfo += ` → ${this.formatFileSize(processedFile.size)} (aggressive)`;
                }
                
                // Afficher l'info de compression dans la préview
            } catch (compressionError) {
                console.error('Compression failed:', compressionError);
                throw new Error(`Failed to compress image: ${compressionError.message}`);
            }
        }
        
        submitBtn.innerHTML = '<span class="btn-text">Uploading...</span>';
        
        const base64 = await this.blobToBase64(processedFile);
        
        // Check final base64 size (should be under ~1MB for safety)
        const base64SizeKB = base64.length / 1024;
        
        if (base64SizeKB > 1024) { // Larger than 1MB in base64
            throw new Error(`Image still too large after compression (${base64SizeKB.toFixed(2)} KB). Please try a smaller image.`);
        }
        
        // Données pour l'API
        const data = {
            album_id: parseInt(this.albumId),
            picture: base64
        };


        const response = await fetch(`${this.apiUrl}/picture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            let errorMessage = `Upload failed (${response.status})`;
            
            if (response.status === 413) {
                errorMessage = 'Image is too large for the server. Please try a smaller image.';
            } else if (response.status === 400) {
                errorMessage = 'Invalid image data. Please try a different image.';
            } else {
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // Keep default error message if JSON parsing fails
                }
            }
            
            throw new Error(errorMessage);
        }

        const result = await response.json();
        
        this.closeAllModals();
        this.fetchAlbumData(); // Recharger les données
        
        
    } catch (error) {
        console.error('Error uploading photo:', error);
        
        // Afficher l'erreur dans la preview aussi
        const errorDiv = document.createElement('div');
        errorDiv.className = 'file-error';
        errorDiv.textContent = error.message;
        preview.appendChild(errorDiv);
        
        alert(`Error uploading photo: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalButtonText;
    }
}

    confirmDeletePhoto(photoId, photoTitle) {
        const deleteModal = document.querySelector('#delete-photo-modal');
        const deleteContent = deleteModal.querySelector('p');
        
        deleteContent.textContent = `Are you sure you want to delete "${photoTitle}"?`;
        
        const confirmBtn = document.querySelector('#confirm-delete-photo');
        confirmBtn.onclick = () => this.deletePhoto(photoId);
        
        deleteModal.style.display = 'block';
        setTimeout(() => deleteModal.classList.add('show'), 10);
    }

    async deletePhoto(photoId) {
        const confirmBtn = document.querySelector('#confirm-delete-photo');
        
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Deleting...';

        try {
            const response = await fetch(`${this.apiUrl}/picture/${photoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete photo');
            }

            this.closeAllModals();
            this.fetchAlbumData();
            
        } catch (error) {
            console.error('Error deleting photo:', error);
            alert(`Error deleting photo: ${error.message}`);
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Delete Photo';
        }
    }

    viewPhoto(photo) {
        const modal = document.querySelector('#photo-viewer-modal');
        const img = document.querySelector('#photo-viewer-img');
        const actions = document.querySelector('#photo-viewer-actions');
        
        img.src = photo.picture || '/placeholder.jpg';
        
        let actionsHTML = `
            <button class="action-btn chatgpt-btn" onclick="document.querySelector('.photo-viewer-close').click(); setTimeout(() => { const photo = ${JSON.stringify(photo).replace(/"/g, '&quot;')}; window.viewAlbumController.openChatGPTModal(photo); }, 100);">
                <span class="btn-icon">🤖</span>
                Ask ChatGPT
            </button>
        `;
        
        if (this.isOwner) {
            actionsHTML += this.viewAlbumView.renderDelete(photo);
        }
        
        actions.innerHTML = actionsHTML;
        
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
    }


}

export default ViewAlbumController;