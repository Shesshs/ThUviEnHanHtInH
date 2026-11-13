const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const error = document.getElementById("error");

form.addEventListener("submit", function (event) {
    event.preventDefault();
    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    const account = accounts.find(
        acc => acc.email === email.value.trim()
    );

    if (!account || password.value.trim() !== account.password) {
        error.textContent = "Incorrect Email or Password";
        error.style.cssText = `
            background-color: red;
            padding: 24px;
            margin-bottom: 24px;
        `;
        //csstxt:REPLACE the inline html style css,does not replace the external css using <link>
        setTimeout(() => {
            error.textContent = "";
            error.style.cssText = "";
        }, 1000);

        return;
    }
    
    account.remember = document.getElementById("remember").checked;
    localStorage.setItem("loggedAccount", JSON.stringify(account));

    
    window.location.href = "index.html";
});
const remembered = JSON.parse(localStorage.getItem("loggedAccount")) || [];
    if (remembered.remember === true){
        document.getElementById("remember").checked = true;
        email.value = remembered.email;
        password.value = remembered.password;
        console.log("ZZZ")
        form.requestSubmit();
    }