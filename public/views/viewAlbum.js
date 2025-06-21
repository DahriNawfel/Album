class viewAlbumView {
    render(){
        return `
            <div class="container">
                <div class="header">
                    <div class="header-left">
                        <button id="back-btn" class="back-btn">← Back</button>
                        <div class="album-info-header">
                            <h1 id="album-title">Loading...</h1>
                            <div id="album-meta" class="album-meta"></div>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button id="add-photo" class="add-photo-btn" style="display: none;">
                            <span class="btn-icon">📸</span>
                            Add Photo
                        </button>
                        <button id="logout" class="logout-btn">Logout</button>
                    </div>
                </div>
                
                <div class="album-content">
                    <div id="album-stats" class="album-stats-section">
                        <div class="loading">Loading album...</div>
                    </div>
                    
                    <div id="photos-section" class="photos-section">
                        <div class="section-header">
                            <h2>Photos</h2>
                            <div id="photos-count" class="photos-count"></div>
                        </div>
                        <div id="photos-grid" class="photos-grid">
                            <div class="loading">Loading photos...</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal pour ajouter une photo -->
            <div id="photo-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add Photo</h3>
                        <span class="close">&times;</span>
                    </div>
                    <form id="photo-form">
                        <div class="form-group">
                            <label for="photo-file">Select Photo</label>
                            <input type="file" id="photo-file" name="picture" accept="image/*" required>
                            <div class="file-preview" id="file-preview"></div>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="cancel-btn">Cancel</button>
                            <button type="submit" class="submit-btn">
                                <span class="btn-text">Add Photo</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- NOUVEAU: Modal ChatGPT -->
            <div id="chatgpt-modal" class="modal">
                <div class="modal-content chatgpt-modal-content">
                    <div class="modal-header">
                        <h3>🤖 Ask ChatGPT about this image</h3>
                        <span class="close">&times;</span>
                    </div>
                    <div class="chatgpt-content">
                        <div id="chatgpt-image-preview" class="chatgpt-image-preview"></div>
                        <form id="chatgpt-form">
                            <div class="form-group">
                                <label for="chatgpt-question">What would you like to know about this image?</label>
                                <textarea 
                                    id="chatgpt-question" 
                                    name="question" 
                                    placeholder="e.g., What do you see in this image? Describe the colors and composition. What's the mood of this photo?"
                                    rows="3"
                                    required
                                ></textarea>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="cancel-btn">Cancel</button>
                                <button type="submit" id="chatgpt-submit-btn" class="submit-btn chatgpt-submit">
                                    <span class="btn-text">🤖 Ask ChatGPT</span>
                                </button>
                            </div>
                        </form>
                        <div id="chatgpt-response" class="chatgpt-response"></div>
                    </div>
                </div>
            </div>

            <!-- Modal de confirmation de suppression -->
            <div id="delete-photo-modal" class="modal">
                <div class="modal-content delete-modal-content">
                    <div class="modal-header">
                        <h3>Delete Photo</h3>
                        <span class="close">&times;</span>
                    </div>
                    <div class="delete-content">
                        <div class="delete-icon">🗑️</div>
                        <p>Are you sure you want to delete this photo?</p>
                        <p class="delete-warning">This action cannot be undone.</p>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="cancel-btn">Cancel</button>
                        <button type="button" id="confirm-delete-photo" class="delete-confirm-btn">Delete Photo</button>
                    </div>
                </div>
            </div>

            <!-- Modal pour voir la photo en grand -->
            <div id="photo-viewer-modal" class="modal photo-viewer">
                <div class="modal-content photo-viewer-content">
                    <span class="close photo-viewer-close">&times;</span>
                    <div class="photo-viewer-container">
                        <img id="photo-viewer-img" src="" alt="">
                        <div class="photo-viewer-info">
                            <h3 id="photo-viewer-title"></h3>
                            <p id="photo-viewer-description"></p>
                            <div id="photo-viewer-actions" class="photo-viewer-actions"></div>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    renderFilePreview(file, e, sizeFormatted, isLarge){
        return `
                <div class="preview-image">
                    <img src="${e.target.result}" alt="Preview">
                    <div class="preview-info">
                        <p><strong>File:</strong> ${file.name}</p>
                        <p><strong>Original Size:</strong> ${sizeFormatted}</p>
                        ${isLarge ? `
                            <div class="compression-notice">
                                <span class="notice-icon">⚠️</span>
                                <span>Large image detected - will be compressed automatically</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `
    }

    renderErrorAlbum(error) {
        return `
                <div class="error-message">
                    <div class="error-icon">❌</div>
                    <p>Error loading album</p>
                    <p class="error-details">${error.message}</p>
                    <button onclick="location.reload()" class="retry-btn">Try Again</button>
                </div>
            `
    }

    renderAlbumInfo(album, pictureCount) {
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📸</div>
                    <div class="stat-info">
                        <div class="stat-number">${pictureCount}</div>
                        <div class="stat-label">Photos</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">👤</div>
                    <div class="stat-info">
                        <div class="stat-number">${album.username || 'Unknown'}</div>
                        <div class="stat-label">Owner</div>
                    </div>
                </div>
            </div>
        `
    }

    renderNoPhotos(isOwner) {
        return `
                <div class="empty-state">
                    <div class="empty-icon">📷</div>
                    <h3>No Photos Yet</h3>
                    <p>This album doesn't contain any photos.</p>
                    ${isOwner ? '<button id="add-first-photo" class="create-first-btn">Add Your First Photo</button>' : ''}
                </div>
            `
    }

    // MODIFIÉ : Ajout du bouton ChatGPT pour chaque photo
    renderPhoto(photo, index, isOwner) { 
        return `
            <div class="photo-item" data-id="${photo.id}" style="animation-delay: ${index * 0.05}s">
                <div class="photo-container">
                    <img src="${photo.picture || '/placeholder.jpg'}" alt="${photo.title || 'Photo'}" loading="lazy">
                    <div class="photo-overlay">
                        <div class="photo-info">
                        </div>
                        <div class="photo-actions">
                            <button class="action-btn chatgpt-btn" title="Ask ChatGPT about this photo">
                                <span class="btn-icon">🤖</span>
                            </button>
                            ${isOwner ? `
                                <button class="action-btn delete-photo-btn" title="Delete photo">
                                    <span class="btn-icon">🗑️</span>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    renderDelete(photo) {
        return `
                <button class="action-btn delete-photo-btn" onclick="this.closest('.modal').querySelector('.close').click(); document.querySelector('[data-id=\\"${photo.id}\\"] .delete-photo-btn').click();">
                    <span class="btn-icon">🗑️</span>
                    Delete Photo
                </button>
            `
    }
}

export default viewAlbumView