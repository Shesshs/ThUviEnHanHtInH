function emailSignup(){
  const name = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const nameError = document.querySelector("#usernameError");
  const emailError = document.querySelector("#emailError");
  const passError = document.querySelector("#passwordError");

  let allDone = true;
  //#region checking register
  if (name.trim().length < 5) {
    nameError.textContent = "*Minimum username length is 5 characters";
    allDone = false;
  }
  if(!email.includes("@") || !email.includes(".")){
    emailError.textContent = "*Not an email";
    allDone = false;
  }
  if(email.includes("@gmail.com")){
    emailError.textContent = "*Please use Sign in with Google";
    allDone = false;
  }
  if (password.trim().length < 8){
    passError.textContent = "*Minimum password length is 8 characters";
    allDone = false;
  }
  if (password.trim().length > 20){
    passError.textContent = "*Maximum password length is 20 characters";
    allDone = false;
  }
  if (!allDone){
    setTimeout(() => {
      nameError.textContent = "";
      emailError.textContent = "";
      passError.textContent = "";
    }, 1500);
    return;
  }
  //#endregion
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      localStorage.setItem("uid", JSON.stringify(user.uid));
      return user.updateProfile({ displayName: name }).then(() => {
        createUserIfNotExist(user);
      });
    })
    .catch((error) => {
      if (error.code === "auth/invalid-email") {
        emailError.textContent = "*Not an email";
        setTimeout(() => {
          emailError.textContent = "";
        }, 1500);
      }
      else if (error.code === "auth/email-already-in-use"){
        emailError.textContent = "*Email already in use";
        setTimeout(() => {
          emailError.textContent = "";
        }, 1500);
      }
      else{
        console.log(error.message);
      }
    })
}