import AlbumView from "../views/album.js";

class AlbumController {
    constructor() {
        this.app = document.querySelector('#app');
        this.albums = [];
        this.albumView = new AlbumView();
        this.currentUserData = null;
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.user = await this.getUserInfo();
        this.fetchCurrentUserData();
        this.render();
        this.fetchAlbums();
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


    async checkAuth() {
        fetch(`/api/auth/checkAuth`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            
        })
        .then(response => response.json())
        .then(data => {
            if (!data || data.authenticated === false) {
                window.location.href = '/auth';
            }
        })
        .catch(() => {
            window.location.href = '/auth';
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
            profileIcon.innerHTML = this.albumView.renderAvatar(this.currentUserData, defaultAvatar);
        }
    }

    // Fonction pour convertir les valeurs de privacy de la DB vers l'interface
    dbPrivacyToUI(dbValue) {
        return dbValue == 1 ? 'private' : 'public';
    }

    render() {
        this.app.innerHTML = this.albumView.render();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Navigation
        document.querySelector('#back-home').addEventListener('click', () => {
            window.history.back();
        });

        document.querySelector('#my-albums').addEventListener('click', () => {
            window.router.navigate('/myalbum');
        });

        document.querySelector('#logout').addEventListener('click', () => {
            this.logout().then(() => {
                window.router.navigate('/auth');
            }).catch(error => {
                console.error('Logout error:', error);
            });
        });

        // Profile icon click
        document.querySelector('#profile-icon').addEventListener('click', () => {
            window.router.navigate('/profile');
        });

        // Event delegation pour les boutons d'albums
        document.querySelector('#albums-list').addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            const albumCard = target.closest('.album-card');
            if (!albumCard) return;

            const albumId = albumCard.dataset.id;
            const album = this.albums.find(a => a.id == albumId);

            if (target.classList.contains('view-btn')) {
                this.viewAlbum(album);
            }
        });
    }

    async fetchAlbums() {
        try {
            const response = await fetch(`/api/albums`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch albums');
            }
            
            const data = await response.json();
            this.albums = data;
            this.renderAlbums();
        } catch (error) {
            console.error('Error fetching albums:', error);
            document.querySelector('#albums-list').innerHTML = this.albumView.renderErrorAlbums(error);
        }
    }

    renderAlbums() {
        const albumsContainer = document.querySelector('#albums-list');
        
        if (!this.albums || this.albums.length === 0) {
            albumsContainer.innerHTML = this.albumView.renderNoAlbums();
            
            // Ajouter event listener pour le bouton create
            document.querySelector('#create-first').addEventListener('click', () => {
                window.router.navigate('/myalbums');
            });
            return;
        }

        albumsContainer.innerHTML = this.albums.map((album, index) => {
            const privacyUI = this.dbPrivacyToUI(album.privacy);
            const isOwner = album.user_id == this.user.user_id;
            
            return this.albumView.renderAlbums(album, index, privacyUI, isOwner);
        }).join('');
    }

    viewAlbum(album) {
        if (!album || !album.id) {
            console.error('Invalid album data:', album);
            return;
        }
        
        window.router.navigate(`/viewAlbum?album=${album.id}`);
    }
}

export default AlbumController;