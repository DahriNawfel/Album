import resetpassword from '../views/resetPassword.js';

class resetpasswordController {
    constructor() {
        this.app = document.getElementById('app');
        this.resetPasswordView = new resetpassword();
        this.apiUrl = 'http://localhost:81';
    }
    
    async run() {
        this.render();
        this.bindEvents();
    }
    
    // Rendu de la vue
    render() {
        const view = this.resetPasswordView.render();
        this.app.innerHTML = view;
    }
    
    // Lier les événements
    bindEvents() {
        // Formulaire de reset
        const form = this.app.querySelector('#resetPasswordForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
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
        const form = this.app.querySelector('#resetPasswordForm');
        const submitBtn = this.app.querySelector('#submitBtn');
        const errorDiv = this.app.querySelector('#resetError');
        const successDiv = this.app.querySelector('#resetSuccess');
        
        // Réinitialiser les messages
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';
        
        // Récupérer les données avec debugging renforcé
        const formData = new FormData(form);
        const email = formData.get('email');
        const secret = formData.get('secret');
        console.log('Email:', email);
        console.log('Secret:', secret);
        
        if (!email || email.trim() === '') {
            this.showError('Veuillez saisir votre adresse email');
            return;
        }

        if (!secret || secret.trim() === '') {
            this.showError('Veuillez saisir votre code secret');
            return;
        }
        
        // Validation basique de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            this.showError('Veuillez saisir une adresse email valide');
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = '🔄 Envoi en cours...';
        form.classList.add('loading');
        
        // Préparer les données à envoyer (nettoyées)
        const cleanEmail = email.trim();
        const cleanSecret = secret.trim();
        
        const requestData = {
            email: cleanEmail,
            secret: cleanSecret
        };

        
        try {
            const response = await fetch(`${this.apiUrl}/auth/resetPassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(requestData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showSuccess('Lien de réinitialisation envoyé avec succès !');
                form.reset();
                
                // Redirection après 3 secondes
                setTimeout(() => {
                    window.router.navigate('/renitialise?token=' + data.reset_token);
                }, 3000);
            } else {
                this.showError(data.error || 'Une erreur est survenue lors de l\'envoi du lien');
            }
        } catch (error) {
            console.error('Erreur complète:', error);
            this.showError('Impossible de se connecter au serveur');
        } finally {
            // Réactiver le bouton
            submitBtn.disabled = false;
            submitBtn.textContent = '📧 Envoyer le lien';
            form.classList.remove('loading');
        }
    }
    
    // Afficher une erreur
    showError(message) {
        const errorDiv = this.app.querySelector('#resetError');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    
    // Afficher un succès
    showSuccess(message) {
        const successDiv = this.app.querySelector('#resetSuccess');
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    }
}

export default resetpasswordController;