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
        const readerURL =
            found.formats["text/html"] ||
            found.formats["text/plain"] ||
            found.formats["application/epub+zip"];

        document.querySelector("iframe").src = readerURL;

        console.log("Book:", found.title);
        console.log("Reader:", readerURL);
    });

function back(){
    window.location.href = "book-info.html?id="+bookID;
}
const ta = document.querySelector('textarea');
const cmtButtons = document.getElementsByClassName('user-comment-buttons')[0];

ta.addEventListener('input', () => {
    ta.style.height = 'auto';                 // reset first so it can shrink too
    cmtButtons.style.display = "flex"
    ta.style.height = ta.scrollHeight + 'px'; // then fit to content
    if (ta.value === '') {
        cmtButtons.style.display = 'none';
    }
});
ta.addEventListener('blur', () => {
    if (ta.scrollHeight > 37){
        ta.style.width = "75vw"
    }
});

function clearText(){
    ta.value = "";
    cmtButtons.style.display = 'none';
    ta.focus();
}

async function addComment(){
    const text = ta.value.trim();
    if (!text) return;

    const cmtRef = db.collection("comments").doc(bookID).collection("items");
    await cmtRef.add({
        uid: uid,
        text: text,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        clearText();
    });
}