import ProfileView from "../views/profile.js";

class UserController {
    constructor() {
        this.app = document.querySelector('#app');

        this.apiUrl = 'http://localhost:81';
        this.currentUserData = null;
        this.ProfileView = new ProfileView();
        this.selectedImageFile = null;
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.user = await this.getUserInfo();
        this.render();
        this.fetchUserProfile();
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

    render() {
        this.app.innerHTML = this.ProfileView.render();
        this.setupEventListeners();
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
        // Navigation
        document.querySelector('#back-home').addEventListener('click', () => {
            window.history.back();
        });

        document.querySelector('#logout').addEventListener('click', () => {
            this.logout().then(() => {
                window.router.navigate('/auth');
            }).catch(error => {
                console.error('Logout error:', error);
            });
        });

        // Event delegation for profile actions
        document.querySelector('#profile-content').addEventListener('click', (e) => {
            if (e.target.closest('#edit-profile')) {
                this.openEditModal();
            }
        });

        // Modal events
        this.setupModalEvents();
    }

    setupModalEvents() {
        const modal = document.querySelector('#profile-modal');
        const closeBtn = document.querySelector('.close');
        const cancelBtn = document.querySelector('.cancel-btn');
        const form = document.querySelector('#profile-form');
        const selectImageBtn = document.querySelector('#select-image-btn');
        const fileInput = document.querySelector('#profile-picture-input');
        const removeImageBtn = document.querySelector('#remove-image');

        // File input events
        selectImageBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            this.handleImageSelection(e);
        });

        removeImageBtn.addEventListener('click', () => {
            this.removeSelectedImage();
        });

        // Close modal
        closeBtn.addEventListener('click', () => {
            this.closeModal();
        });

        cancelBtn.addEventListener('click', () => {
            this.closeModal();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProfileUpdate();
        });
    }

    async handleImageSelection(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        // Show original file size
        const originalSize = this.formatFileSize(file.size);

        try {
            // Compress the image
            const compressedBlob = await this.compressImage(file);
            const compressedSize = this.formatFileSize(compressedBlob.size);
            

            // Store the compressed blob
            this.selectedImageFile = compressedBlob;
            
            // Update UI
            document.querySelector('#selected-file-name').textContent = file.name;
            
            // Show preview
            const previewUrl = URL.createObjectURL(compressedBlob);
            const previewImg = document.querySelector('#preview-img');
            const previewContainer = document.querySelector('#image-preview');
            
            previewImg.src = previewUrl;
            previewContainer.style.display = 'block';

        } catch (error) {
            console.error('Error processing image:', error);
            alert('Error processing image. Please try another file.');
        }
    }

    removeSelectedImage() {
        this.selectedImageFile = null;
        document.querySelector('#profile-picture-input').value = '';
        document.querySelector('#selected-file-name').textContent = 'No file selected';
        document.querySelector('#image-preview').style.display = 'none';
        
        // Clean up preview URL
        const previewImg = document.querySelector('#preview-img');
        if (previewImg.src.startsWith('blob:')) {
            URL.revokeObjectURL(previewImg.src);
        }
    }

    async fetchUserProfile() {
        try {
            const response = await fetch(`/api/me`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }
            
            const data = await response.json();
            this.currentUserData = data;
            this.renderProfile();
        } catch (error) {
            console.error('Error fetching profile:', error);
            document.querySelector('#profile-content').innerHTML = this.ProfileView.renderErrorProfile(error);
        }
    }

    renderProfile() {
        if (!this.currentUserData) return;

        const profileContainer = document.querySelector('#profile-content');
        const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiNlNWU3ZWIiLz4KPHN2ZyB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KPHN2ZyB4PSIwIiB5PSIwIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOWNhM2FmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+CjxwYXRoIGQ9Im0zIDlsOSA5IDktOSIvPgo8L3N2Zz4KPGNpcmNsZSBjeD0iMTIiIGN5PSI4IiByPSI1Ii8+CjxwYXRoIGQ9Im0zIDIwYTEzIDEzIDAgMSAxIDE4IDAiLz4KPC9zdmc+Cjwvc3ZnPgo=';

        profileContainer.innerHTML = this.ProfileView.renderProfile(this.currentUserData, defaultAvatar);
    }


    openEditModal() {
        if (!this.currentUserData) return;

        const modal = document.querySelector('#profile-modal');
        
        // Populate form with current data
        document.querySelector('#username').value = this.currentUserData.username || '';
        document.querySelector('#bio').value = this.currentUserData.bio || '';
        document.querySelector('#password').value = '';
        
        // Reset image selection
        this.selectedImageFile = null;
        document.querySelector('#profile-picture-input').value = '';
        document.querySelector('#selected-file-name').textContent = 'No file selected';
        document.querySelector('#image-preview').style.display = 'none';
        
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    closeModal() {
        const modal = document.querySelector('#profile-modal');
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
        
        // Clean up preview URL
        const previewImg = document.querySelector('#preview-img');
        if (previewImg.src.startsWith('blob:')) {
            URL.revokeObjectURL(previewImg.src);
        }
        
        // Reset form and image selection
        this.selectedImageFile = null;
        document.querySelector('#profile-form').reset();
        document.querySelector('#selected-file-name').textContent = 'No file selected';
        document.querySelector('#image-preview').style.display = 'none';
    }

    async compressImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                try {
                    // Calculer les nouvelles dimensions en gardant le ratio
                    let { width, height } = img;
                    
                    // Redimensionner si nécessaire
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
                    
                    // Forcer une compression minimale pour les gros fichiers
                    if (width === img.width && height === img.height && file.size > 500 * 1024) {
                        width = Math.min(width, maxWidth * 0.8);
                        height = Math.min(height, maxHeight * 0.8);
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
                                // Vérifier si la compression est suffisante
                                if (blob.size > 1024 * 1024 && quality > 0.3) {
                                    // Recompresser avec une qualité moindre
                                    canvas.toBlob(
                                        (compressedBlob) => {
                                            resolve(compressedBlob || blob);
                                        },
                                        'image/jpeg',
                                        quality * 0.7
                                    );
                                } else {
                                    resolve(blob);
                                }
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

    // Fonction pour convertir un fichier en base64 (compatible avec les blobs)
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    async handleProfileUpdate() {
        const form = document.querySelector('#profile-form');
        const formData = new FormData(form);
        const submitBtn = document.querySelector('.submit-btn');
        
        const data = {
            username: formData.get('username').trim(),
            bio: formData.get('bio').trim()
        };

        // Only include password if it's provided
        const password = formData.get('password').trim();
        if (password) {
            data.password = password;
        }

        if (!data.username) {
            alert('Username is required');
            return;
        }

        // Loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-text">Updating...</span>';

        try {
            // Convert image to base64 if selected
            if (this.selectedImageFile) {
                submitBtn.innerHTML = '<span class="btn-text">Processing image...</span>';
                
                // Convert the compressed blob to base64
                const base64Image = await this.blobToBase64(this.selectedImageFile);
                data.pfp = base64Image;
            }

            submitBtn.innerHTML = '<span class="btn-text">Updating profile...</span>';

            // Send everything in one request to PUT /user/:id
            const response = await fetch(`/api/user/${this.user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }
            
            this.closeModal();
            this.fetchUserProfile(); // Refresh the profile
            
            // Show success message
            alert('Profile updated successfully!');
            
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(`Error updating profile: ${error.message}`);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="btn-text">Update Profile</span>';
        }
    }
}

export default UserController;