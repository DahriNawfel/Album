class Router {
    constructor() {
        this.routes = {};
        this.controllers = {};
        this.currentController = null;
        
        // Écouter les changements d'URL
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
        
        // Intercepter les clics sur les liens
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.getAttribute('href')) {
                const href = e.target.getAttribute('href');
                if (href.startsWith('/') || href.startsWith('#')) {
                    e.preventDefault();
                    this.navigate(href);
                }
            }
        });
    }
    
    // Enregistrer une route avec son contrôleur
    register(path, controllerClass) {
        this.routes[path] = controllerClass;
    }
    
    // Navigation programmatique
    navigate(path, options = {}) {
        if (path.startsWith('#')) {
            path = path.substring(1);
        }
        
        // Stocker les options dans l'état si nécessaire
        const state = options.state || {};
        window.history.pushState(state, '', path);
        this.handleRoute();
    }
    
    // Extraire les paramètres de l'URL
    extractParams(path) {
        const parts = path.split('/').filter(part => part);
        return {
            route: parts[0] || 'home',
            params: parts.slice(1)
        };
    }
    
    // Gérer le routage
    handleRoute() {
        const path = window.location.pathname === '/' ? '/home' : window.location.pathname;
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;

        const { route, params } = this.extractParams(cleanPath);

        let ControllerClass = this.routes[route];
        if (!ControllerClass) {
            // Vérifications spéciales pour les routes paramétrées
            // Ajouter d'autres vérifications si nécessaire
        }
        
        if (ControllerClass) {
            // Nettoyer le contrôleur précédent
            if (this.currentController && typeof this.currentController.destroy === 'function') {
                this.currentController.destroy();
            }
            
            // Créer une nouvelle instance du contrôleur
            this.currentController = new ControllerClass();
            
            // Passer les paramètres au contrôleur si disponibles
            if (params.length > 0 && typeof this.currentController.setParams === 'function') {
                this.currentController.setParams(params);
            }
            
            // Exécuter le contrôleur
            if (typeof this.currentController.run === 'function') {
                this.currentController.run();
            }
        } else {
            // Route non trouvée - 404
            this.handle404();
        }
    }
    
    // Gérer les erreurs 404
    handle404() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="container">
                <div class="error-page">
                    <div class="error-icon">🔍</div>
                    <h1>404 - Page Not Found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                    <div class="error-actions">
                        <button onclick="window.router.navigate('/home')" class="primary-btn">Go Home</button>
                        <button onclick="window.history.back()" class="secondary-btn">Go Back</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Démarrer le routeur
    start() {
        this.handleRoute();
    }
}

// Instance globale du routeur
window.router = new Router();