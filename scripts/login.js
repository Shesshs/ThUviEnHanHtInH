function emailLogin(){
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const passEmError = document.getElementById("error");
  const emailError = document.querySelector("#emailError");

  if(email.includes("@gmail.com")){
    emailError.style.display = "block";
    setTimeout(() => {
      emailError.style.display = "none"
    }, 1000);
    return;
  }
  if(!email.includes("@") || !email.includes(".") || password.trim().length < 8 || password.trim().length > 20){
    passEmError.style.display = "block";
    setTimeout(() => {
      passEmError.style.display = "none"
    }, 500);
    return;
  }
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log(user);
      window.location.href = "index.html";
    })
    .catch((error) => {
      if (error.code === "auth/invalid-credential"){
        passEmError.style.display = "block";
        setTimeout(() => {
          passEmError.style.display = "none"
        }, 1000);
        return;
      }
      else{
        console.log(error.message);
      }
    });
}