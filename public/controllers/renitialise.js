import renitialise from '../views/renitialise.js';

class ReinitialiseMdpController {
    constructor() {
        this.app = document.getElementById('app');
        this.apiUrl = 'http://localhost:81';
        this.reinitialiseMdpView = new renitialise();
        this.token = null;
    }
    
    async run() {
        // Récupérer le token depuis l'URL
        this.token = this.getTokenFromUrl();
        
        if (!this.token) {
            this.showInvalidToken();
            return;
        }
        
        this.render();
        this.bindEvents();
    }
    
    // Récupérer le token depuis les paramètres URL
    getTokenFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('token');
    }
    
    showInvalidToken() {
        this.app.innerHTML = `
            <div class="auth-page">
                <div class="auth-container">
                    <div class="auth-header">
                        <h1>🚫 Lien invalide</h1>
                        <p class="auth-subtitle error">
                            Le lien de réinitialisation est invalide ou a expiré.
                        </p>
                    </div>
                    <div class="auth-footer">
                        <a href="/auth" class="auth-link">
                            ← Retour à la connexion
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Rendu de la vue
    render() {
        const view = this.reinitialiseMdpView.render();
        this.app.innerHTML = view;
    }
    
    // Lier les événements
    bindEvents() {
        // Formulaire de réinitialisation
        const form = this.app.querySelector('#reinitialiseMdpForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
        
        // Bouton retour
        const backBtn = this.app.querySelector('#backToAuth');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.router.navigate('/auth');
            });
        }
    }
    
    // Gérer la soumission du formulaire
    async handleSubmit() {
        const form = this.app.querySelector('#reinitialiseMdpForm');
        const submitBtn = this.app.querySelector('#submitBtn');
        const errorDiv = this.app.querySelector('#reinitialiseError');
        const successDiv = this.app.querySelector('#reinitialiseSuccess');
        
        // Réinitialiser les messages
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';
        
        // Récupérer les données
        const formData = new FormData(form);
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');
        
        // Validation
        if (!newPassword || !confirmPassword) {
            this.showError('Veuillez remplir tous les champs');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showError('Les mots de passe ne correspondent pas');
            return;
        }
        
        if (newPassword.length < 6) {
            this.showError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }
        
        // Désactiver le bouton
        submitBtn.disabled = true;
        submitBtn.textContent = '🔄 Réinitialisation...';
        form.classList.add('loading');
        
        try {
            const response = await fetch(`${this.apiUrl}/auth/renitialisePassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    token: this.token,
                    new_password: newPassword
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showSuccess('Mot de passe réinitialisé avec succès ! Redirection vers la connexion...');
                form.reset();
                
                // Redirection après 3 secondes
                setTimeout(() => {
                    window.router.navigate('/auth');
                }, 3000);
            } else {
                this.showError(data.error || 'Une erreur est survenue lors de la réinitialisation');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showError('Impossible de se connecter au serveur');
        } finally {
            // Réactiver le bouton
            submitBtn.disabled = false;
            submitBtn.textContent = '🔐 Réinitialiser le mot de passe';
            form.classList.remove('loading');
        }
    }
    
    // Afficher une erreur
    showError(message) {
        const errorDiv = this.app.querySelector('#reinitialiseError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }
    
    // Afficher un succès
    showSuccess(message) {
        const successDiv = this.app.querySelector('#reinitialiseSuccess');
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.style.display = 'block';
        }
    }
}

export default ReinitialiseMdpController;