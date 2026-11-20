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
const uid = JSON.parse(localStorage.getItem("uid")) || [];
// Hàm đăng nhập

function GGlogin() {
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      const user = result.user;

      document.getElementById("email").innerText = user.email;

      createUserIfNotExist(user);
      localStorage.setItem("uid", JSON.stringify(user.uid));
      window.location.href = "index.html";
    })
    .catch((err) => console.log(err));
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
  const fav = db.collection("favourites").doc(user.uid);
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

  fav.get().then((doc) => {
    if (!doc.exists) {
      fav.set({
        uid: user.uid,
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
  });
}

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // 1. ĐÃ ĐĂNG NHẬP
    console.log("Đã đăng nhập:", user.uid);
    logged = true;

    // 🌟 Lắng nghe dữ liệu realtime từ Firestore
    listenUser(user.uid);

  } else {
    // 2. CHƯA ĐĂNG NHẬP
    localStorage.removeItem("uid");
    logged = false;
    console.log("Chưa đăng nhập");
  }
});

async function getUser(uid) {
  try {
    const doc = await db.collection("users").doc(uid).get();
    const user = {
      id: doc.id,
      ...doc.data(),
    };

    console.log("Fetched user:", user);
    return user;
  } catch (error) {
    console.error(error);
  }
}
const avatar = document.getElementsByClassName("avatar")[0];
const nameUser = document.getElementsByClassName("user-basic-info")[0];

getUser(uid).then((account) => {
  avatar.textContent = account.name[0];
  nameUser.textContent = account.name;
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
