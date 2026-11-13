const bookID = Number(
    new URLSearchParams(window.location.search).get("id")
);
let thisbook = [];
const account = JSON.parse(localStorage.getItem("loggedAccount"));
const dataAccount = JSON.parse(localStorage.getItem("accounts"));
const likeButton = document.getElementsByClassName("like")[0];
const bookmarkButton = document.getElementsByClassName("bookmark")[0];

function addHistory(thisbook){
    const data = dataAccount.find(acc => acc.email === account.email);
    
    const index = data.recently.findIndex(
        book => book.id === thisbook.id
    );

    if (index !== -1) {
        data.recently.splice(index, 1);
        data.recently.unshift(thisbook);
    } else {
        data.recently.unshift(thisbook);
        data.recently.splice(15,1)
    }

    localStorage.setItem("accounts", JSON.stringify(dataAccount));

    account.recently = data.recently;
    localStorage.setItem("loggedAccount", JSON.stringify(account));
}

fetch("https://gutendex.com/books/" + bookID)
    .then(res => res.json())
    .then(found => {
        thisbook = found;
        addHistory(thisbook);
        const data = dataAccount.find(acc => acc.email === account.email);
        if (data.favourites.some(book => book.id === thisbook.id)) {
            likeButton.classList.add("anim");
        }
        if (data.bookmarks.some(book => book.id === thisbook.id)) {
            bookmarkButton.classList.add("anim");
        }
        
        const readerURL =
            found.formats["text/html"] ||
            found.formats["text/plain"] ||
            found.formats["application/epub+zip"];

        document.querySelector("iframe").src = readerURL;

        console.log("Book:", found.title);
        console.log("Reader:", readerURL);
    });

function like(){
    const data = dataAccount.find(acc => acc.email === account.email);
    likeButton.classList.toggle("anim");
    const index = data.favourites.findIndex(
        book => book.id === thisbook.id
    );

    if (index !== -1) {
        data.favourites.splice(index, 1);
    } else {
        data.favourites.push(thisbook);
    }

    localStorage.setItem("accounts", JSON.stringify(dataAccount));

    account.favourites = data.favourites;
    localStorage.setItem("loggedAccount", JSON.stringify(account));
}
function bookmark(){
    const data = dataAccount.find(acc => acc.email === account.email);
    bookmarkButton.classList.toggle("anim");
    const index = data.bookmarks.findIndex(
        book => book.id === thisbook.id
    );

    if (index !== -1) {
        data.bookmarks.splice(index, 1);
    } else {
        data.bookmarks.push(thisbook);
    }

    localStorage.setItem("accounts", JSON.stringify(dataAccount));

    account.bookmarks = data.bookmarks;
    localStorage.setItem("loggedAccount", JSON.stringify(account));
}
function back(){
    window.location.href = "book-info.html?id="+bookID;
}