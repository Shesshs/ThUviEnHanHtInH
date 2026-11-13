let displayBooksStart = 0;
const displayBooksNumbRow = 8;//books per row
const totalBookShow = 16;//total of books per shelf
const sectionCount = Math.floor(totalBookShow/displayBooksNumbRow);//number of rows
const cateLimit = 5;//number of categories shown
let currentGlobalShelfNumb = 0;
let nextAble = undefined;
let notPrevAble = true;

let searchText = "";
let categoryText = "";
let artistText = "";
let controller = undefined;
const account = JSON.parse(localStorage.getItem("loggedAccount"));

function getNumb(_var) {
    const numbers = String(_var);
    let hei = 0;
    const minH = 50
    for (let i = 0; i < numbers.length - 1; i++) {
        hei = Math.max(hei, Number(numbers.slice(i, i + 2)));
    }
    
    return Math.max(hei,minH);;
}

function getHex(_var) {
    const numbers = String(_var);

    if (numbers.length < 6) {
        return numbers.padEnd(6, "0");
    }

    return numbers.slice(0, 6);
}

//#region get/draw books
let shelfNumb = 0;

function drawBooks(){
    const books = account.recently;
        let printBooks = "";
        for(let i = 0;i<sectionCount;i++){
            const startBook = shelfNumb * totalBookShow + i * displayBooksNumbRow;
            const sectionBook = books.slice(startBook,startBook+displayBooksNumbRow);
            printBooks += 

            '<div class="section"' +
                `style="
                    grid-template-columns: repeat(${(displayBooksNumbRow)}, auto);
            ">` +
            sectionBook.map(function(thisbook) {

                let heigh = getNumb(thisbook.id);
                let hex = getHex(thisbook.id);
                return (
                    '<div class="book-card"' +
                    `id="${thisbook.id}"`+
                    `style="
                            height:${heigh}px;
                            background-color:#${hex}
                        ">` +
                        `<a href="./book-info.html?id=${thisbook.id}"></a>` +
                    '</div>'
                );

            }).join('') +

            '</div>';
        }
        const bookData = new Map();

        // Store the actual book objects
        books.forEach(book => {
            bookData.set(book.id, book);
        });
        

        document.querySelector(".popular").innerHTML = printBooks;


        const bookCards = document.querySelectorAll('.book-card');

        bookCards.forEach(card => {

            card.addEventListener('mouseenter', () => {

                // Get the ID from the card
                const Bid = Number(card.id);

                // Get the actual book object
                const book = bookData.get(Bid);

                const cover = book.formats["image/jpeg"] || "";
                const title = book.title;

                const desc = book.summaries[0] ?? "*No description";

                const cateFull = book.bookshelves.map(repl => repl.replace("Category:", ""));
                const cate = cateFull.slice(0,cateLimit);
                const delCate = cateFull.length-cateLimit;

                const hoverBox = document.createElement('div');

                hoverBox.classList.add('hover-box');

                hoverBox.innerHTML =
                    '<div class="book-info">' +
                        `<div><img src="${cover}" alt=""></div>` +
                        '<div class="book-text">' +
                            `<h2>${title}</h2>` +
                            `<h3>${desc}</h3>` +
                            `<div class="categories"></div>`+
                        '</div>' +
                    '</div>';
                const categories = hoverBox.querySelector(".categories");
                    cate.forEach(category => {
                        const subject = document.createElement("div");
                        subject.textContent = category;
                        categories.appendChild(subject);
                });
                if (delCate>0){
                    const more = document.createElement("div");
                    more.id = "moreCate";
                    more.textContent = String(delCate)+" More...";
                    categories.appendChild(more);
                }
                card.appendChild(hoverBox);

    // Get positions and sizes
                const cardRect = card.getBoundingClientRect();
                const spaceRight = window.innerWidth - cardRect.right;
                const spaceLeft = cardRect.left;
                const spaceTop = cardRect.top;
                const spaceBottom = window.innerHeight - cardRect.bottom;

                // Horizontal
                if (spaceRight >= spaceLeft) {
                    hoverBox.style.left = "100%";
                    hoverBox.style.right = "";
                } else {
                    hoverBox.style.right = "100%";
                    hoverBox.style.left = "";
                }

                // Vertical
                if (spaceTop >= spaceBottom) {
                    hoverBox.style.bottom = "0";
                    hoverBox.style.top = "";
                } else {
                    hoverBox.style.top = "0";
                    hoverBox.style.bottom = "";
                }

                card.hoverBox = hoverBox;
                

            });


            card.addEventListener('mouseleave', () => {

                if (card.hoverBox) {
                    card.hoverBox.remove();
                    card.hoverBox = null;
                }

            });

        });
    }
drawBooks(`https://gutendex.com/books/?page=`,2);
//#endregion 
//#region effects
const shelf = document.querySelector(".bookshelf");
const shelfCount = document.querySelector(".shelf-count");
async function shelfOut(){
    shelf.classList.add("active");
    shelfCount.classList.add("deactive");
    await new Promise(resolve => setTimeout(resolve, 300));
}
async function shelfIn() {
    
    shelf.style.transition = "none";
    shelf.classList.add("active2");

    shelf.style.transition = "";

    await new Promise(resolve => setTimeout(resolve, 80));

    shelf.classList.remove("active");
    
    await new Promise(resolve => setTimeout(resolve, 300));
    shelfCount.textContent = `Shelf ${shelfNumb+1}`
    shelfCount.classList.remove("deactive");
    shelf.classList.remove("active2");
}

const nextNav = document.getElementsByClassName("next")[0];
const prevNav = document.getElementsByClassName("prev")[0];
const max = Math.ceil((account.bookmarks.length)/totalBookShow)-1;
function checknav(){

    // if (shelfNumb <= 0){
    //     prevNav.classList.add("disabled")
    // }else{
    //     prevNav.classList.remove("disabled")
    // }
    // if (shelfNumb >= max){
    //     nextNav.classList.add("disabled")
    // }else{
    //     nextNav.classList.remove("disabled")
    // }
}
checknav();

const nextNavi = document.querySelector(".naviNext");
const prevNavi = document.querySelector(".naviPrev");

nextNavi.addEventListener("click", async () => {
    await shelfOut();
    shelfNumb += 1;
    console.log("+1");
    drawBooks();
    checknav();
    await shelfIn();
    
});

prevNavi.addEventListener("click", async () => {
    await shelfOut();
    shelfNumb -= 1;
    console.log("-1");
    drawBooks();
    checknav();
    await shelfIn();
});
//#endregion

//#region search

document.getElementById("form-shelf").onsubmit = async function(event) {
    event.preventDefault();
    
    const sText = document.getElementsByClassName("shelf-page-search");
    const searchTextNumb = sText[0].value;
    const searchNumb = Number(searchTextNumb);
    
    if (searchTextNumb.length > 0) {
        document.activeElement.blur();
        await shelfOut();
        shelfNumb = searchNumb ? Math.min(Math.max(0, searchNumb - 1),max) : 0;
        console.log("Page: " + searchTextNumb);
        this.reset();
        await shelfIn();
    }
};
//#endregion