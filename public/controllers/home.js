import HomeView from '../views/home.js';

class HomeController {

    constructor() {
        this.app = document.querySelector('#app');

        this.apiUrl = 'http://localhost:81';
        this.albums = [];
        this.homeView = new HomeView();
        this.myAlbums = [];
        this.init();
    }

    async init() {

        await this.checkAuth();
        this.user = await this.getUserInfo();
        this.render();
        this.fetchAlbums();
        this.fetchMyAlbums();
        this.setupEventListeners();
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
                // Clear user data
                this.currentUserData = null;
                this.user = null;
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    setupEventListeners() {
        document.querySelector('#logout').addEventListener('click', () => {
            this.logout().then(() => {
                window.router.navigate('/auth');
            }).catch(error => {
                console.error('Logout error:', error);
            });
        });

        // Event listener pour le bouton "Tout voir" des albums
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'view-all-albums') {
                window.router.navigate('/albums');
            }
            if (e.target && e.target.id === 'view-all-myalbums') {
                window.router.navigate('/myalbum');
            }
            if (e.target && e.target.id === 'create-album') {
                window.router.navigate('/myalbum');
            }
        });
    }

    render() {
        this.app.innerHTML = this.homeView.render(this.user);
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
            // Vérifier si data est un tableau, sinon utiliser un tableau vide
            this.albums = Array.isArray(data) ? data : [];
            this.renderAlbums();
        } catch (error) {
            console.error('Error fetching albums:', error);
            this.app.innerHTML = `<p>Error loading albums: ${error.message}</p>`;
        }
    }

    async fetchMyAlbums() {
        try {
            const response = await fetch(`/api/myalbums`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Failed to fetch my albums');
            }
            const data = await response.json();
            // Vérifier si data est un tableau, sinon utiliser un tableau vide
            this.myAlbums = Array.isArray(data) ? data : [];
            this.renderMyAlbums();
        }
        catch (error) {
            console.error('Error fetching my albums:', error);
            this.app.innerHTML = `<p>Error loading my albums: ${error.message}</p>`;
        }
    }

    renderAlbums() {
        const albumsContainer = document.querySelector('#albums');
        if (!albumsContainer) {
            console.error('Albums container not found');
            return;
        }
        

        albumsContainer.innerHTML = '<h2>Available Albums</h2>';
        
        if (this.albums.length === 0) {
            albumsContainer.innerHTML += '<p>No albums available.</p>';
            return;
        }

        const albumsToShow = this.albums.slice(0, 5);
        
        albumsToShow.forEach(album => {
            const albumElement = document.createElement('div');
            albumElement.className = 'album';
            albumElement.innerHTML = `
                <h3>${album.title}</h3>
            `;
            albumsContainer.appendChild(albumElement);
        });

            const viewAllButton = document.createElement('button');
            viewAllButton.id = 'view-all-albums';
            viewAllButton.textContent = `Tout voir (${this.albums.length} albums)`;
            viewAllButton.className = 'view-all-btn';
            albumsContainer.appendChild(viewAllButton);
    }

    renderMyAlbums() {
        const myAlbumsContainer = document.querySelector('#my-albums');
        if (!myAlbumsContainer) {
            console.error('My albums container not found');
            return;
        }
        
        myAlbumsContainer.innerHTML = '<h2>Your Albums</h2>';
        
        if (this.myAlbums.length === 0) {
            myAlbumsContainer.innerHTML += '<p>You have no albums.</p>';
            const createButton = document.createElement('button');
            createButton.id = 'create-album';
            createButton.textContent = 'Créer un album';
            createButton.className = 'create-album-btn';
            myAlbumsContainer.appendChild(createButton);
            return;
        }
        
        const myAlbumsToShow = this.myAlbums.slice(0, 5);
        
        myAlbumsToShow.forEach(album => {
            const albumElement = document.createElement('div');
            albumElement.className = 'album';
            albumElement.innerHTML = `
                <h3>${album.title}</h3>
            `;
            myAlbumsContainer.appendChild(albumElement);
        });

            const viewAllButton = document.createElement('button');
            viewAllButton.id = 'view-all-myalbums';
            viewAllButton.textContent = `Tout voir (${this.myAlbums.length} albums)`;
            viewAllButton.className = 'view-all-btn';
            myAlbumsContainer.appendChild(viewAllButton);
    }

    parseJwtToken(token) {
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Invalid token format', e);
            return null;
        }
    }
}

export default HomeController;