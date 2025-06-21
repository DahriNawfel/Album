// Fonction pour charger dynamiquement un contrôleur
async function loadController(name) {
    try {
        console.log(`Tentative de chargement du contrôleur: ${name}`);
        
        // Vérifier si nous sommes en production (Vercel)
        const isProduction = window.location.hostname !== 'localhost';
        
        // Construire l'URL du contrôleur
        const controllerUrl = `./controllers/${name}.js`;
        
        // Vérifier si le fichier existe avant de l'importer
        if (isProduction) {
            const response = await fetch(controllerUrl);
            if (!response.ok) {
                throw new Error(`Controller file not found: ${controllerUrl}`);
            }
        }
        
        // Importer le contrôleur
        const module = await import(controllerUrl);
        console.log(`Contrôleur ${name} chargé avec succès`);
        return module.default;
    } catch (error) {
        console.error(`Erreur lors du chargement du contrôleur ${name}:`, error);
        
        // Afficher une erreur plus détaillée
        showError(`Impossible de charger le contrôleur "${name}". Vérifiez que le fichier controllers/${name}.js existe.`);
        return null;
    }
}

// Fonction pour afficher les erreurs
function showError(message) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="error-page">
                <div class="error-icon">⚠️</div>
                <h1>Erreur de chargement</h1>
                <p>${message}</p>
                <div class="error-actions">
                    <button onclick="window.location.reload()" class="primary-btn">Recharger</button>
                    <button onclick="window.router.navigate('/home')" class="secondary-btn">Accueil</button>
                </div>
            </div>
        </div>
    `;
}

// Configuration des routes
const routes = [
    'home',
    'auth',
    'albums',
    'myalbum',
    'viewAlbum',
    'profile',
    'resetpassword',
    'renitialise'
];

// Fonction d'initialisation
async function init() {
    try {
        console.log('Initialisation de l\'application...');
        
        // Masquer le loading
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
        
        // Charger tous les contrôleurs automatiquement
        let loadedCount = 0;
        for (const routeName of routes) {
            const ControllerClass = await loadController(routeName);
            if (ControllerClass) {
                window.router.register(routeName, ControllerClass);
                loadedCount++;
            }
        }
        
        console.log(`${loadedCount}/${routes.length} contrôleurs chargés`);
        
        if (loadedCount === 0) {
            showError('Aucun contrôleur n\'a pu être chargé. Vérifiez la structure de vos fichiers.');
            return;
        }
        
        // Démarrer le routeur
        window.router.start();
        console.log('Router démarré');
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        showError('Erreur lors de l\'initialisation de l\'application.');
    }
}

// Attendre que le DOM soit chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}