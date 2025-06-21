class ReinitialiseMdpView {
    
    render() {
        const view = `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-header">
                    <h1>🔐 Nouveau mot de passe</h1>
                    <p class="auth-subtitle">
                        Saisissez votre nouveau mot de passe
                    </p>
                </div>
                
                <form class="auth-form" id="reinitialiseMdpForm">
                    <div class="form-group">
                        <label for="newPassword">Nouveau mot de passe</label>
                        <input type="password" id="newPassword" name="newPassword" required 
                               placeholder="Minimum 6 caractères">
                    </div>
                    
                    <div class="form-group">
                        <label for="confirmPassword">Confirmer le mot de passe</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required 
                               placeholder="Confirmer le mot de passe">
                    </div>
                    
                    <button type="submit" class="auth-submit" id="submitBtn">
                        🔐 Réinitialiser le mot de passe
                    </button>
                    
                    <div class="auth-error" id="reinitialiseError" style="display: none;"></div>
                    <div class="auth-success" id="reinitialiseSuccess" style="display: none;"></div>
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

export default ReinitialiseMdpView;