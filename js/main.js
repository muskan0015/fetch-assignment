document.addEventListener("DOMContentLoaded", () => {
const loginForm = document.getElementById("login_form");
const logoutButton = document.getElementById("logout");
const publicSection = document.getElementById("public");
const authorizedSection = document.getElementById("authorized");
const loadedSection = document.querySelector(".loaded");
const loadingSection = document.querySelector(".loading");
const errorDialog = document.getElementById("errorDialog");
const errorMessage = document.getElementById("errorMessage");
const closeDialog = document.getElementById("closeDialog");


 const showError = (message) => {
    errorMessage.textContent = message;
    errorDialog.showModal();
};

const toggleVisibility = (isLoggedIn) => {
    publicSection.classList.toggle("active", !isLoggedIn);
    authorizedSection.classList.toggle("active", isLoggedIn);
};

const fetchPostsByUserId = async (userId, token) => {
    try {
    loadingSection.style.display = "block";
    const response = await fetch(`https://dummyjson.com/posts/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error(`Failed to fetch posts for user ID ${userId}`);

    const data = await response.json();
    loadingSection.style.display = "none";

    if (data.posts.length === 0) {
        loadedSection.innerHTML = `<p>No posts found for this user.</p>`;
        return;
    }

    loadedSection.innerHTML = data.posts
        .map(
        (post) => `
        <article>
        <h3>${post.title}</h3>
        <p>${post.body}</p>
        </article>`
        )
        .join("");
    } catch (error) {
    loadingSection.style.display = "none";
    showError(error.message);
    }
};

const handleLogin = async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("pass").value.trim();

    try {
    const response = await fetch("https://dummyjson.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) throw new Error("Invalid username or password");

    const userData = await response.json();
    sessionStorage.setItem("user", JSON.stringify(userData));
    document.querySelector("header h1 span").textContent = `${userData.firstName} ${userData.lastName}`;
    document.querySelector("nav.logout").style.display = "block";

    toggleVisibility(true);

      // Fetch posts for the logged-in user
    fetchPostsByUserId(userData.id, userData.token);
    } catch (error) {
    showError(error.message);
    }
 };

const handleLogout = () => {
    sessionStorage.removeItem("user");
    document.querySelector("header h1 span").textContent = "";
    document.querySelector("nav.logout").style.display = "none";
    loadedSection.innerHTML = "";
    toggleVisibility(false);
};

  // Event listeners
loginForm.addEventListener("submit", handleLogin);
logoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    handleLogout();
});

closeDialog.addEventListener("click", () => errorDialog.close());

  // On load
const storedUser = JSON.parse(sessionStorage.getItem("user"));
if (storedUser) {
    document.querySelector("header h1 span").textContent = `${storedUser.firstName} ${storedUser.lastName}`;
    document.querySelector("nav.logout").style.display = "block";
    toggleVisibility(true);

    // Fetch posts for the logged-in user
    fetchPostsByUserId(storedUser.id, storedUser.token);
} else {
    toggleVisibility(false);
}
});
