const form = document.getElementById("registerForm");
let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
let uid = 0;
form.addEventListener("submit", function (event) {
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    event.preventDefault();

    if (username.value.trim().length < 5) {
        const error = document.querySelector("#usernameError");
        error.textContent = "*Min 5 chars";
        setTimeout(() => {
        error.textContent = "";
        }, 500);
        return;
    }
    if(!email.value.includes("@") || !email.value.includes(".")){
        const error = document.querySelector("#emailError");
        error.textContent = "*Not an email";
        setTimeout(() => {
        error.textContent = "";
        }, 500);
        return;
    }

    if (accounts.some(account => account.email === email.value)) {
        const error = document.querySelector("#emailError");
        error.textContent = "*Email exists";
        setTimeout(() => {
        error.textContent = "";
        }, 500);
        return;
    }

    if (password.value.trim().length < 8 || password.value.trim().length > 20){
        const error = document.querySelector("#passwordError");
        error.textContent = "*Min Pass:8 | Max Pass:20";
        setTimeout(() => {
        error.textContent = "";
        }, 500);
        return;
    }
    
    const account = {
        username: username.value.trim(),
        email: email.value.trim(),
        password: password.value.trim(),
        
        favourites: [],
        bookmarks: [],
        recently: [],
        uid: Math.floor(100000 + Math.random() * 900000)
    };
    accounts.push(account);

    localStorage.setItem("accounts", JSON.stringify(accounts));
    registerForm.reset();

    window.location.href = 'login.html';
});