const bookID = String(
    new URLSearchParams(window.location.search).get("id")
);

let thisbook = [];
const likeButton = document.getElementsByClassName("like")[0];
const bookmarkButton = document.getElementsByClassName("bookmark")[0];

const hisRef = db.collection("recently").doc(uid).collection("items").doc(bookID);
function recent() {
    hisRef.set({
        timeAdd: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        likeButton.classList.add("anim");

        db.collection("recently").doc(uid).collection("items")
            .orderBy("timeAdd", "desc")
            .get()
            .then((snap) => {
                const batch = db.batch();

                snap.docs.slice(16).forEach(doc => {
                    batch.delete(doc.ref);
                });

                batch.commit().then(() => {
                    listenUser(uid);
                });
            });
    });
}
recent();
// function addHistory(thisbook){
//     const data = dataAccount.find(acc => acc.email === account.email);
    
//     const index = data.recently.findIndex(
//         book => book.id === thisbook.id
//     );

//     if (index !== -1) {
//         data.recently.splice(index, 1);
//         data.recently.unshift(thisbook);
//     } else {
//         data.recently.unshift(thisbook);
//         data.recently.splice(15,1)
//     }

//     localStorage.setItem("accounts", JSON.stringify(dataAccount));

//     account.recently = data.recently;
//     localStorage.setItem("loggedAccount", JSON.stringify(account));
// }
const favRef = db.collection("favourites").doc(uid).collection("items").doc(bookID);
const markRef = db.collection("bookmarks").doc(uid).collection("items").doc(bookID);
function favourite() {
    favRef.get().then((doc) => {
        if (!doc.exists) {
            favRef.set({
                timeAdd: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                likeButton.classList.add("anim");
                listenUser(uid);
            });
        } else {
            favRef.delete().then(() => {
                likeButton.classList.remove("anim");
                listenUser(uid);
            });
        }
    });
}
function bookmark() {
    markRef.get().then((doc) => {
        if (!doc.exists) {
            markRef.set({
                timeAdd: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                bookmarkButton.classList.add("anim");
                listenUser(uid);
            });
        } else {
            markRef.delete().then(() => {
                bookmarkButton.classList.remove("anim");
                listenUser(uid);
            });
        }
    });
}

markRef.get().then((doc) => {
    if (doc.exists){
        bookmarkButton.classList.add("anim");
    }
});
favRef.get().then((doc) => {
    if (doc.exists){
        likeButton.classList.add("anim");
    }
});
fetch("https://gutendex.com/books/" + bookID)
    .then(res => res.json())
    .then(found => {
        thisbook = found;
        // if (data.bookmarks.some(book => book.id === thisbook.id)) {
        //     bookmarkButton.classList.add("anim");
        // }
        
        const readerURL =
            found.formats["text/html"] ||
            found.formats["text/plain"] ||
            found.formats["application/epub+zip"];

        document.querySelector("iframe").src = readerURL;

        console.log("Book:", found.title);
        console.log("Reader:", readerURL);
    });

// function bookmark(){
//     const data = dataAccount.find(acc => acc.email === account.email);
//     bookmarkButton.classList.toggle("anim");
//     const index = data.bookmarks.findIndex(
//         book => book.id === thisbook.id
//     );

//     if (index !== -1) {
//         data.bookmarks.splice(index, 1);
//     } else {
//         data.bookmarks.push(thisbook);
//     }

//     localStorage.setItem("accounts", JSON.stringify(dataAccount));

//     account.bookmarks = data.bookmarks;
//     localStorage.setItem("loggedAccount", JSON.stringify(account));
// }
function back(){
    window.location.href = "book-info.html?id="+bookID;
}