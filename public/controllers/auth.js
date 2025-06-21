import AuthView from '../views/auth.js';
class AuthController {
    constructor() {
        this.app = document.getElementById('app');
        this.isLoginMode = true;
        this.authView = new AuthView();
        this.apiUrl = 'http://localhost:81';
    }
    
    async run() {
        await this.checkAuth();
        this.render();
        this.bindEvents();
    }
    async checkAuth() {
        try {
            const response = await fetch(`${this.apiUrl}/auth/checkAuth`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            const authData = await response.json();
            if (authData.authenticated === true) {
                window.router.navigate('/');
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'authentification:', error);
        }
    }
    
    // Rendu de la vue
    render() {
        const view = this.authView.render(this.isLoginMode);
        
        this.app.innerHTML = view;
    }
    
    // Lier les événements
    bindEvents() {
        // Onglets
        const tabBtns = this.app.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.isLoginMode = mode === 'login';
                this.render();
                this.bindEvents();
            });
        });
        
        // Formulaire
        const form = this.app.querySelector('#authForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }
    
    // Gérer la soumission du formulaire
    async handleSubmit() {
        const form = this.app.querySelector('#authForm');
        const submitBtn = this.app.querySelector('#submitBtn');
        const errorDiv = this.app.querySelector('#authError');
        const successDiv = this.app.querySelector('#authSuccess');
        
        // Réinitialiser les messages
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';
        
        // Récupérer les données
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const secret = formData.get('secret');
        
        // Validation
        if (!email || !password) {
            this.showError('Veuillez remplir tous les champs');
            return;
        }
        
        if (!this.isLoginMode && password !== confirmPassword) {
            this.showError('Les mots de passe ne correspondent pas');
            return;
        }
        
        if (!this.isLoginMode && password.length < 6) {
            this.showError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }
        
        // Désactiver le bouton
        submitBtn.disabled = true;
        submitBtn.textContent = this.isLoginMode ? '🔄 Connexion...' : '🔄 Inscription...';
        form.classList.add('loading');
        
        try {
            const endpoint = this.isLoginMode ? '/auth/login' : '/auth/register';
            const body = {
                email: email,
                password: password
            };
            if (!this.isLoginMode) {
                body.secret = secret;
            }
            const response = await fetch(`${this.apiUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(body)
            });
            
            const data = await response.json();    
            if (response.ok) {
                if (this.isLoginMode) {
                    // Connexion réussie
                        this.showSuccess('Connexion réussie ! Redirection...');
                        setTimeout(() => {
                            window.router.navigate('/');
                        }, 1000);
                } else {
                    // Inscription réussie
                    this.showSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
                    setTimeout(() => {
                        this.isLoginMode = true;
                        this.render();
                        this.bindEvents();
                    }, 2000);
                }
            } else {
                this.showError(data.error || 'Une erreur est survenue');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showError('Impossible de se connecter au serveur');
        } finally {
            // Réactiver le bouton
            submitBtn.disabled = false;
            submitBtn.textContent = this.isLoginMode ? '🔐 Se connecter' : '📝 S\'inscrire';
            form.classList.remove('loading');
        }
    }
    
    // Afficher une erreur
    showError(message) {
        const errorDiv = this.app.querySelector('#authError');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    
    // Afficher un succès
    showSuccess(message) {
        const successDiv = this.app.querySelector('#authSuccess');
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    }
    
}

export default AuthController;