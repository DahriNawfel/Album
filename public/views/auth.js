class Authview {
    
    render(isLoginMode) {
        const view = `
        <div class="auth-page">
                <div class="auth-container">
                    <div class="auth-header">
                        <h1>📸 Album Photo</h1>
                        <div class="auth-tabs">
                            <button class="tab-btn ${isLoginMode ? 'active' : ''}" data-mode="login">
                                Connexion
                            </button>
                            <button class="tab-btn ${!isLoginMode ? 'active' : ''}" data-mode="register">
                                Inscription
                            </button>
                        </div>
                    </div>
                    
                    <form class="auth-form" id="authForm">
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="text" id="email" name="email" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="password">Mot de passe</label>
                            <input type="password" id="password" name="password" required>
                        </div>
                        
                        ${!isLoginMode ? `
                            <div class="form-group">
                                <label for="confirmPassword">Confirmer le mot de passe</label>
                                <input type="password" id="confirmPassword" name="confirmPassword" required>
                                <label for="secret">Secret</label>
                                <input type="text " id="secret" name="secret" required>
                            </div>
                        ` : ''}
                        
                        <button type="submit" class="auth-submit" id="submitBtn">
                            ${isLoginMode ? '🔐 Se connecter' : '📝 S\'inscrire'}
                        </button>

                        <div class="auth-footer">
                            <a href="http://localhost:3000/resetpassword" id="forgotPassword" class="auth-link">
                                Mot de passe oublié ?
                            </a>
                        </div>
                        
                        <div class="auth-error" id="authError" style="display: none;"></div>
                        <div class="auth-success" id="authSuccess" style="display: none;"></div>
                    </form>
                </div>
            </div>
        `;
        return view;
    }

}


export default Authview;