class HomeView {
    render(user) {
        return `
            <div class="container">
                <h1>Welcome, ${user ? user.username : 'Guest'}</h1>
                <button id="logout">Logout</button>
                <div id="albums">
                    <h2>Available Albums</h2>
                </div>
                <div id="my-albums">
                    <h2>Your Albums</h2>
                </div>
            </div>
        `;
    }
}

export default HomeView;