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

// 2. XỬ LÝ ĐĂNG NHẬP / ĐĂNG XUẤT
// Tạo provider đăng nhập Google
const provider = new firebase.auth.GoogleAuthProvider();

// Hàm đăng nhập
function login() {
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      const user = result.user;

      // 🌟 CHỈNH SỬA: set email trực tiếp ra màn hình
      document.getElementById("email").innerText = user.email;

      createUserIfNotExist(user);
    })
    .catch((err) => console.log(err));
}

// Hàm đăng xuất
function logout() {
  firebase.auth().signOut()
    .then(() => {
      setStatus("👋 Đã đăng xuất");

      // 🌟 CHỈNH SỬA: reset hiển thị
      document.getElementById("email").innerText = "Chưa đăng nhập";
      document.getElementById("balance").innerText = "0";
    })
    .catch((err) => setStatus("❌ Lỗi đăng xuất: " + err.message));
}

// 3. TẠO USER TRONG DATABASE (Firestore)
function createUserIfNotExist(user) {
  const ref = db.collection("users").doc(user.uid);
  ref.get().then((doc) => {
    if (!doc.exists) {
      ref.set({
        email: user.email,
        balance: 0
      }).then(() => {
        // 🌟 Bắt đầu listener sau khi tạo user xong
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
    document.getElementById("balance").innerText = data.balance;
  });
}

// 5. NẠP TIỀN
function deposit(uid) {
  const ref = db.collection("users").doc(uid);

  ref.update({
    // Tăng thêm 100000
    balance: firebase.firestore.FieldValue.increment(100000)
  })
  .then(() => {
    setStatus("💰 Nạp tiền thành công");
  })
  .catch((err) => {
    setStatus("❌ Lỗi nạp tiền: " + err.message);
  });
}

// 6. THEO DÕI TRẠNG THÁI ĐĂNG NHẬP
firebase.auth().onAuthStateChanged((user) => {
  const depositBtn = document.getElementById("depositBtn");

  if (user) {
    // 1. ĐÃ ĐĂNG NHẬP
    console.log("Đã đăng nhập:", user.uid);
    logged = true;
    setStatus("🔓 Đã đăng nhập");

    // 🌟 Hiển thị email ngay (không chờ Firestore)
    document.getElementById("email").innerText = user.email;

    // 🌟 Lắng nghe dữ liệu realtime từ Firestore
    listenUser(user.uid);

    // 🌟 Bật nút nạp tiền
    depositBtn.disabled = false;

    // 🌟 Gán sự kiện click (viết rõ ràng để dễ debug)
    depositBtn.onclick = null;

    depositBtn.onclick = function () {
      if (!user) {
        alert("Chưa đăng nhập!");
        return;
      }

      console.log("CLICK NẠP TIỀN");
      deposit(user.uid);
    };

  } else {
    // 2. CHƯA ĐĂNG NHẬP
    logged = false;
    console.log("Chưa đăng nhập");

    setStatus("🔒 Chưa đăng nhập");

    // 🌟 Reset giao diện
    document.getElementById("email").innerText = "Chưa đăng nhập";
    document.getElementById("balance").innerText = "0";

    // 🌟 Tắt nút nạp tiền
    depositBtn.disabled = true;

    // 🌟 Xóa luôn sự kiện click để tránh bug
    depositBtn.onclick = null;
  }
});

// 7. Nạp tiền
function deposit(uid) {
  const user = firebase.auth().currentUser;
  console.log("👉 Bắt đầu nạp tiền cho UID:", uid);

  const ref = db.collection("users").doc(uid);

  // 🌟 Dùng set + merge để:
  // - Nếu chưa có document → tự tạo
  // - Nếu đã có → cập nhật
  ref.set({
    email: user.email, // 🌟 FIX QUAN TRỌNG
    balance: firebase.firestore.FieldValue.increment(100000)
  }, { merge: true })
  .then(() => {
    console.log("✅ Nạp tiền thành công");

    setStatus("💰 Đã nạp +100.000");

    // 🌟 FALLBACK (phòng trường hợp onSnapshot chưa chạy)
    // -> cập nhật UI ngay cho học sinh thấy
    const balanceEl = document.getElementById("balance");
    const current = Number(balanceEl.innerText) || 0;
    balanceEl.innerText = current + 100000;
  })
  .catch((err) => {
    console.error("❌ Lỗi khi nạp tiền:", err);
    setStatus("❌ Lỗi: " + err.message);
  });
}

// 8. HÀM HIỂN THỊ THÔNG BÁO
// function setStatus(message) {
//   document.getElementById("status").innerText = message;
// }
//#endregion

//#region main

fetch("./scripts/drinks.json")
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
    })
    .then(drinks => {
        document.querySelector(".all").innerHTML = drinks.map((drink) => `
            <div class="card">
                <img src="${drink.image}" alt="${drink.name}">
                <div class="desc">
                  <h2>${drink.name}</h2>
                  <p>${drink.description}</p>
                  <button onclick="buyDrink()">Mua hàng</button>
                </div>
            </div>
        `).join("");

    })
    .catch(err => console.error("Lỗi:", err));

function buyDrink() { 
    if (!logged) {
        alert("Vui lòng đăng nhập để mua hàng!");
        return;
    }

    console.log("Mua hàng!");
}
//#endregion