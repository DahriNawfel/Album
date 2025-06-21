class MyalbumView {



    renderAvatar(currentUserData, defaultAvatar) {
        return `
                <div class="profile-avatar">
                    <img src="${currentUserData.pfp || defaultAvatar}" 
                        alt="Profile" 
                        onerror="this.src='${defaultAvatar}'">
                </div>
                <span class="profile-name">${currentUserData.username || 'User'}</span>
            `
    }
    render() {
        return `
            <div class="container">
                <div class="header">
                    <h1>My Albums</h1>
                    <div class="header-actions">
                        <button id="back-home" class="back-btn">← Back</button>
                        <button id="logout" class="logout-btn">Logout</button>
                    </div>
                </div>
                <div id="profile-icon" class="profile-icon" title="View Profile">
                    <div class="profile-placeholder">
                        <span>👤</span>
                        <span class="profile-name">Loading...</span>
                    </div>
                </div>
                
                <div class="create-section">
                    <button id="create-album" class="create-album-btn">
                        <span class="btn-icon">+</span>
                        Create New Album
                    </button>
                </div>

                <div class="albums-section">
                    <div id="my-albums" class="albums-grid">
                        <div class="loading">Loading your albums...</div>
                    </div>
                </div>
            </div>

            <!-- Modal pour créer/modifier un album -->
            <div id="album-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modal-title">Create Album</h3>
                        <span class="close">&times;</span>
                    </div>
                    <form id="album-form">
                        <div class="form-group">
                            <label for="album-title">Album Title</label>
                            <input type="text" id="album-title" name="title" placeholder="Enter album title..." required>
                        </div>
                        <div class="form-group">
                            <label for="album-privacy">Privacy Setting</label>
                            <select id="album-privacy" name="privacy" required>
                                <option value="">Select privacy level</option>
                                <option value="public">🌍 Public - Everyone can see</option>
                                <option value="private">🔒 Private - Only you can see</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="cancel-btn">Cancel</button>
                            <button type="submit" class="submit-btn">
                                <span class="btn-text">Save Album</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Modal de confirmation de suppression -->
            <div id="delete-modal" class="modal">
                <div class="modal-content delete-modal-content">
                    <div class="modal-header">
                        <h3>Delete Album</h3>
                        <span class="close">&times;</span>
                    </div>
                    <div class="delete-content">
                        <div class="delete-icon">🗑️</div>
                        <p>Are you sure you want to delete this album?</p>
                        <p class="delete-warning">This action cannot be undone.</p>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="cancel-btn">Cancel</button>
                        <button type="button" id="confirm-delete" class="delete-confirm-btn">Delete Album</button>
                    </div>
                </div>
            </div>
        `
    }

    renderErrorMyAlbums(error) {
        return `
                <div class="error-message">
                    <div class="error-icon">❌</div>
                    <p>Error loading your albums</p>
                    <p class="error-details">${error.message}</p>
                    <button onclick="location.reload()" class="retry-btn">Try Again</button>
                </div>
            `
    }


    renderNoMyAlbums() {
        return `
                <div class="empty-state">
                    <div class="empty-icon">📁</div>
                    <h3>No Albums Yet</h3>
                </div>
            `
    }


    renderAlbums(album, index, privacyUI) {
        return `
                <div class="album-card" data-id="${album.id}" style="animation-delay: ${index * 0.1}s">
                    <div class="album-header">
                        <h3 class="album-title">${album.title}</h3>
                        <div class="album-privacy ${privacyUI}">
                            ${privacyUI === 'public' ? '🌍' : '🔒'} ${privacyUI}
                        </div>
                    </div>
                    <div class="album-actions">
                        <button class="action-btn view-btn">
                            <span class="btn-icon">👁️</span>
                            View
                        </button>
                        <button class="action-btn edit-btn">
                            <span class="btn-icon">✏️</span>
                            Edit
                        </button>
                        <button class="action-btn delete-btn">
                            <span class="btn-icon">🗑️</span>
                            Delete
                        </button>
                    </div>
                </div>
            `
    }
}


export default MyalbumView;