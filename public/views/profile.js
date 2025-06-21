class ProfileView {


    render(){
        return `
            <div class="container">
                <div class="header">
                    <h1>My Profile</h1>
                    <div class="header-actions">
                        <button id="back-home" class="back-btn">← Back</button>
                        <button id="logout" class="logout-btn">Logout</button>
                    </div>
                </div>
                
                <div class="profile-section">
                    <div id="profile-content" class="profile-content">
                        <div class="loading">Loading profile...</div>
                    </div>
                </div>
            </div>

            <!-- Modal pour modifier le profil -->
            <div id="profile-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit Profile</h3>
                        <span class="close">&times;</span>
                    </div>
                    <form id="profile-form">
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" name="username" placeholder="Enter username..." required>
                        </div>
                        <div class="form-group">
                            <label for="profile-picture-input">Profile Picture</label>
                            <div class="file-input-container">
                                <input type="file" id="profile-picture-input" name="profile_picture" accept="image/*" style="display: none;">
                                <button type="button" id="select-image-btn" class="file-select-btn">
                                    <span class="btn-icon">📷</span>
                                    Choose Image
                                </button>
                                <span id="selected-file-name" class="selected-file">No file selected</span>
                            </div>

                            <div id="image-preview" class="image-preview" style="display: none;">
                                <img id="preview-img" src="" alt="Preview">
                                <button type="button" id="remove-image" class="remove-btn">Remove</button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="bio">Bio</label>
                            <textarea id="bio" name="bio" placeholder="Tell us about yourself..." rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="password">New Password (optional)</label>
                            <input type="password" id="password" name="password" placeholder="Leave empty to keep current password">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="cancel-btn">Cancel</button>
                            <button type="submit" class="submit-btn">
                                <span class="btn-text">Update Profile</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `
    }


    renderErrorProfile(error) {
        return `
                <div class="error-message">
                    <div class="error-icon">❌</div>
                    <p>Error loading profile</p>
                    <p class="error-details">${error.message}</p>
                    <button onclick="location.reload()" class="retry-btn">Try Again</button>
                </div>
            `
    }


    renderProfile(currentUserData, defaultAvatar) {
        return `
            <div class="profile-card">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <img src="${currentUserData.pfp || defaultAvatar}" 
                             alt="Profile" 
                             onerror="this.src='${defaultAvatar}'">
                    </div>
                    <div class="profile-info">
                        <h2 class="profile-name">${currentUserData.username || 'No username'}</h2>
                        ${currentUserData.bio ? `<p class="profile-bio">${currentUserData.bio}</p>` : ''}
                        <div class="profile-meta">
                            <span class="profile-role">
                                <span class="role-icon">${currentUserData.role === 'admin' ? '👑' : '👤'}</span>
                                ${currentUserData.role || 'user'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="profile-actions">
                    <button id="edit-profile" class="edit-profile-btn">
                        <span class="btn-icon">✏️</span>
                        Edit Profile
                    </button>
                </div>
            </div>
        `;
    }

}

export default ProfileView;