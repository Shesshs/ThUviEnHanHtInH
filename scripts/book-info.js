const categoryLimit = 2
let cateLimit = categoryLimit;

let thisbook = [];
const bookID = Number(
    new URLSearchParams(window.location.search).get("id")
);
console.log(bookID)
function categoring(){
    const cateFull = thisbook.bookshelves.map(
        repl => repl.replace("Category:", "")
    );

    const cate = cateFull.slice(0, cateLimit);
    const delCate = cateFull.length - cateLimit;

    const categories = document.querySelector(".categories");
    categories.innerHTML = "";

    cate.forEach(category => {
        const subject = document.createElement("div");
        subject.textContent = category;
        categories.appendChild(subject);
    });

    if (delCate > 0){
        const more = document.createElement("div");
        more.id = "moreCate";
        more.textContent = delCate + " More...";
        categories.appendChild(more);
    }
}

fetch("https://gutendex.com/books/" + bookID)
    .then(res => res.json())
    .then(book => {
                thisbook = book;
                const cover = book.formats["image/jpeg"] || "";
                const title = book.title;

                const desc = book.summaries[0] ?? "*No description";
                const artists = book.authors;
                let artistList = [];
                artists.forEach((artist) => {
                    artistList.push(artist["name"].replace(",",""));
                });
                document.querySelector("h3").textContent = `Authors: ${artistList.join(", ")}`;

                console.log(artistList);
                document.querySelector("img").src = cover; 
                document.getElementById("title").textContent = title;
                document.querySelector("p").textContent = desc;
                categoring();
    });


function showhide(){
    cateLimit = cateLimit === categoryLimit ? 100 : categoryLimit;
    categoring();
    document.getElementsByClassName("book-info-texts")[0].classList.toggle("toggled");
    const showMoreText = document.getElementsByClassName("more")[0];
    showMoreText.textContent = showMoreText.textContent === "Show more" ? "Show less" : "Show more";
}
function reading(){
    window.location.href = `read.html?id=${bookID}`;
}