class ResetPasswordView {
    
    render() {
        const view = `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-header">
                    <h1>🔐 Réinitialisation du mot de passe</h1>
                    <p class="auth-subtitle">
                        Saisissez votre adresse email
                    </p>
                </div>
                
                <form class="auth-form" id="resetPasswordForm">
                    <div class="form-group">
                        <label for="email">Adresse email</label>
                        <input type="email" id="email" name="email" required 
                               placeholder="votre.email@exemple.com">
                        <label for="secret">Secret</label>
                        <input type="text" id="secret" name="secret" required 
                               placeholder="Entrez votre secret">
                    </div>
                    
                    <button type="submit" class="auth-submit" id="submitBtn">
                        📧 Envoyer le lien
                    </button>
                    
                    <div class="auth-error" id="resetError" style="display: none;"></div>
                    <div class="auth-success" id="resetSuccess" style="display: none;"></div>
                </form>
                
                <div class="auth-footer">
                    <a href="#" id="backToAuth" class="auth-link">
                        ← Retour à la connexion
                    </a>
                </div>
            </div>
        </div>
        `;
        return view;
    }
}

export default ResetPasswordView;