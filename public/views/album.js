class AlbumView {

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
                    <h1>Public Albums</h1>
                    <div class="header-actions">
                        <button id="back-home" class="back-btn">← Back</button>
                        <br>
                        <button id="my-albums" class="my-albums-btn">My Albums</button>
                        <div id="profile-icon" class="profile-icon" title="View Profile">
                            <div class="profile-placeholder">
                                <span>👤</span>
                                <span class="profile-name">Loading...</span>
                            </div>
                        </div>
                        <button id="logout" class="logout-btn">Logout</button>
                    </div>
                </div>
                
                <div class="albums-section">
                    <div class="section-header">
                        <h2>Discover Albums</h2>
                        <p>Browse public albums shared by the community</p>
                    </div>
                    <div id="albums-list" class="albums-grid">
                        <div class="loading">Loading albums...</div>
                    </div>
                </div>
            </div>
        `
    }


    renderErrorAlbums(error) {
        return `
                <div class="error-message">
                    <div class="error-icon">❌</div>
                    <p>Error loading albums</p>
                    <p class="error-details">${error.message}</p>
                    <button onclick="location.reload()" class="retry-btn">Try Again</button>
                </div>
            `
    }


    renderNoalbums() {
        return `
                <div class="empty-state">
                    <div class="empty-icon">📸</div>
                    <h3>No Public Albums</h3>
                    <p>No albums have been shared publicly yet.</p>
                    <button id="create-first" class="create-first-btn">
                        Create Your First Album
                    </button>
                </div>
            `
    }


    renderAlbums(album, index, privacyUI, isOwner) {
        return `
                <div class="album-card" data-id="${album.id}" style="animation-delay: ${index * 0.1}s">
                    <div class="album-header">
                        <h3 class="album-title">${album.title}</h3>
                        <div class="album-meta">
                            <div class="album-privacy ${privacyUI}">
                                ${privacyUI === 'public' ? '🌍' : '🔒'} ${privacyUI}
                            </div>
                            ${isOwner ? '<div class="owner-badge">👤 Your Album</div>' : ''}
                        </div>
                    </div>
                    
                    <div class="album-info">
                        <div class="album-stats">
                            <span class="stat-item">
                                <span class="stat-icon">👤</span>
                                <span class="stat-text">by ${album.username || 'Unknown'}</span>
                            </span>
                        </div>
                    </div>

                    <div class="album-actions">
                        <button class="action-btn view-btn primary">
                            <span class="btn-icon">👁️</span>
                            View Album
                        </button>
                    </div>
                </div>
            `
    }

}

export default AlbumView;