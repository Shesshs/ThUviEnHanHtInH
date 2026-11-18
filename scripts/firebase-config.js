// 1. KHỞI TẠO FIREBASE
// Thông tin project Firebase (lấy từ Firebase Console)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
let logged = false;
//#region fire
const firebaseConfig = {
    apiKey: "AIzaSyDal2XiUTjPmuEo4EZxqIANpKnEBw4-nrA",
    authDomain: "gaia-libwary.firebaseapp.com",
    projectId: "gaia-libwary",
    storageBucket: "gaia-libwary.firebasestorage.app",
    messagingSenderId: "400779014736",
    appId: "1:400779014736:web:34ae236a6f83d9f4cf9755",
    measurementId: "G-662JK7YLXW"
  };

// Kết nối tới Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 2. XỬ LÝ ĐĂNG NHẬP / ĐĂNG XUẤT
// Tạo provider đăng nhập Google
const provider = new firebase.auth.GoogleAuthProvider();

// Hàm đăng nhập

function GGlogin() {
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      const user = result.user;

      document.getElementById("email").innerText = user.email;

      createUserIfNotExist(user);
      window.location.href = "index.html";
    })
    .catch((err) => console.log(err));
}

function emailLogin(){
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const passEmError = document.getElementById("error");
  if(!email.includes("@") || !email.includes(".") || password.trim().length < 8 || password.trim().length > 20){
    passEmError.style.display = "block";
    setTimeout(() => {
      passEmError.style.display = "none"
    }, 1000);
    return;
  }
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log(user);
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
    }, 2500);
    return;
  }
  //#endregion
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return user.updateProfile({ displayName: name }).then(() => {
        createUserIfNotExist(user, name);
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
// Hàm đăng xuất
function logout() {
  firebase.auth().signOut()
    .then(() => {

    })
    .catch((err) => console.log(err));
}

// 3. TẠO USER TRONG DATABASE (Firestore)
function createUserIfNotExist(user) {
  const ref = db.collection("users").doc(user.uid);
  ref.get().then((doc) => {
    if (!doc.exists) {
      ref.set({
        email: user.email,
        name: user.displayName || "Anonymous",
        photoURL: user.photoURL || "",
      }).then(() => {
        window.location.href = "index.html";
        listenUser(user.uid);
      });
    } else {
      listenUser(user.uid);
    }
  });
}

// 4. LẤY DỮ LIỆU USER (REALTIME)
// Biến để lưu listener (tránh bị lặp)
// Listener realtime
let unsubscribe = null;

function listenUser(uid) {
  const ref = db.collection("users").doc(uid);
  if (unsubscribe) unsubscribe(); // huỷ listener cũ nếu có
  unsubscribe = ref.onSnapshot((doc) => {
    if (!doc.exists) return;
    const data = doc.data();

    // 🌟 update email + balance realtime
    document.getElementById("email").innerText = data.email;
  });
}


// 6. THEO DÕI TRẠNG THÁI ĐĂNG NHẬP
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // 1. ĐÃ ĐĂNG NHẬP
    console.log("Đã đăng nhập:", user.uid);
    logged = true;

    // 🌟 Hiển thị email ngay (không chờ Firestore)
    document.getElementById("email").innerText = user.email;

    // 🌟 Lắng nghe dữ liệu realtime từ Firestore
    listenUser(user.uid);

  } else {
    // 2. CHƯA ĐĂNG NHẬP
    logged = false;
    console.log("Chưa đăng nhập");
  }
});

// // 7. Nạp tiền
// function deposit(uid) {
//   const user = firebase.auth().currentUser;
//   console.log("👉 Bắt đầu nạp tiền cho UID:", uid);

//   const ref = db.collection("users").doc(uid);

//   // 🌟 Dùng set + merge để:
//   // - Nếu chưa có document → tự tạo
//   // - Nếu đã có → cập nhật
//   ref.set({
//     email: user.email, // 🌟 FIX QUAN TRỌNG
//     balance: firebase.firestore.FieldValue.increment(100000)
//   }, { merge: true })
//   .then(() => {
//     console.log("✅ Nạp tiền thành công");

//     // 🌟 FALLBACK (phòng trường hợp onSnapshot chưa chạy)
//     // -> cập nhật UI ngay cho học sinh thấy
//     const balanceEl = document.getElementById("balance");
//     const current = Number(balanceEl.innerText) || 0;
//     balanceEl.innerText = current + 100000;
//   })
//   .catch((err) => {
//     console.log(err)
//   });
// }
//#endregion
