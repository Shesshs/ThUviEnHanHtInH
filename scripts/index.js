let displayBooksStart = 0;
const displayBooksNumbRow = 16;//books per row
const totalBookShow = 64;//total of books per shelf
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

async function getBooks(link,pagesToFetch,searchN,searchC,searchA){
    if (controller){controller.abort()};
    controller = new AbortController();
    let books = [];
    const startPage = shelfNumb * 2 + 1;

    for (let i = 0; i < pagesToFetch; i++) {
        const search = [searchN, searchA].filter(Boolean).join("+");
        const page = startPage + i;
        const url =
            `${link}${page}` +
            `${search ? `&search=${search}` : ""}` +
            `${searchC ? `&topic=${encodeURIComponent(searchC)}` : ""}`;
        console.log("FETCH: "+ url);

        const res = await fetch(url,{ signal: controller.signal});
        
        if (!res.ok){
            throw new Error('Failed to fetch books');
        }

        const data = await res.json();

        console.log("Page:", page, data);

        books.push(...data.results);
        nextAble = data.next;
        notPrevAble = (shelfNumb == 0);
        const nextNav = document.getElementsByClassName("next")[0];
        const prevNav = document.getElementsByClassName("prev")[0];
        if (!nextAble){
            
            nextNav.classList.add("disabled");
            break;
        }else{
            nextNav.classList.remove("disabled");
        }
        if (notPrevAble){
            prevNav.classList.add("disabled");
            
        }else{
            prevNav.classList.remove("disabled");
        }
        console.log("NEXTO+ "+ nextAble);
    }
    // if (!search){
    //     currentGlobalShelfNumb = shelfNumb;
    //     console.log("Shelfnumb: "+currentGlobalShelfNumb);
    // }
    return books;
}

async function drawBooks(link,pagesToFetch,searchN="",searchC="",searchA=""){
    return getBooks(link,pagesToFetch,searchN,searchC,searchA)
    .then(books => {
        let printBooks = "";
        for(let i = 0;i<sectionCount;i++){
            const startBook = i*displayBooksNumbRow;
            const sectionBook = books.slice(startBook,startBook+displayBooksNumbRow);
            printBooks += 

            '<div class="section"' +
                `style="
                    grid-template-columns: repeat(${String(displayBooksNumbRow)}, auto);
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

        

    })
    .catch(error => {
        if (error.name === "AbortError"){return null};
        console.log(error);
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
const nextNavi = document.querySelector(".naviNext");
const prevNavi = document.querySelector(".naviPrev");

nextNavi.addEventListener("click", async () => {
    await shelfOut();
    shelfNumb += 1;
    console.log("+1");

    const result = await drawBooks(
                    `https://gutendex.com/books/?page=`,2,
                    searchText,categoryText,artistText
                );
    if (result === null) return;
    await shelfIn();
    
});

prevNavi.addEventListener("click", async () => {
    await shelfOut();
    shelfNumb -= 1;
    console.log("-1");

    const result = await drawBooks(
                    `https://gutendex.com/books/?page=`,2,
                    searchText,categoryText,artistText
                );
    if (result === null) return;

    await shelfIn();
});
//#endregion

//#region search
const form = document.getElementById("form");
form.addEventListener("keydown",async function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); 
        const sText = document.getElementsByClassName('name-search')[0].value.trim();
        const sCateText = document.getElementsByClassName('cate-xsearch')[0].value.trim();
        const sArtText = document.getElementsByClassName('artist-xsearch')[0].value.trim();

        console.log("AAAAAAAA"+sText);
        searchText = encodeURIComponent(sText);
        categoryText = encodeURIComponent(sCateText);
        artistText = encodeURIComponent(sArtText);
        const bookName = document.getElementById('book-name');
        const bookCate = document.getElementById('book-cate');
        const bookArtist = document.getElementById('book-artist');
        if (searchText.length > 0 || categoryText.length > 0 || artistText.length > 0){
            document.activeElement.blur();
            if (categoryText.length > 0){
                bookCate.classList.remove("active");
                await new Promise(resolve => setTimeout(resolve, 250));
                bookCate.textContent = sCateText;
                bookCate.classList.add("active");  
            }
            if (searchText.length > 0){
                bookName.classList.remove("active");
                await new Promise(resolve => setTimeout(resolve, 250));
                bookName.textContent = sText;
                bookName.classList.add("active");  
            }
            if (artistText.length > 0){
                bookArtist.classList.remove("active");
                await new Promise(resolve => setTimeout(resolve, 250));
                bookArtist.textContent = sArtText;
                bookArtist.classList.add("active");  
            }
            await shelfOut();
            shelfNumb = 0;
            const result = await drawBooks(
                    `https://gutendex.com/books/?page=`,2,
                    searchText,categoryText,artistText
                );
            if (result === null) return;
            
            console.log("KEYWORD: " + searchText+categoryText+artistText);
            await shelfIn();
        }
    }
})

document.getElementById("form-shelf").onsubmit = async function(event) {
    event.preventDefault();
    
    const sText = document.getElementsByClassName("shelf-page-search");
    const searchTextNumb = sText[0].value;
    const searchNumb = Number(searchTextNumb);
    
    if (searchTextNumb.length > 0) {
        document.activeElement.blur();
        await shelfOut();
        shelfNumb = Math.max(0, searchNumb - 1);

        const result = await drawBooks(
                    `https://gutendex.com/books/?page=`,2,
                    searchText,categoryText,artistText
                );
        if (result === null) return;
        console.log("Page: " + searchTextNumb);
        await shelfIn();
    }
};

const search = document.getElementsByClassName('name-search')[0];

const extraInputs = document.querySelectorAll(".extra-search");

search.addEventListener("focus", function() {
    extraInputs.forEach(function(input) {
        search.placeholder = "Search Books";
        input.classList.add("appear");
    });
});
form.addEventListener("focusout", function(event) {
    if (!form.contains(event.relatedTarget)) {
        extraInputs.forEach(function(input) {
            search.placeholder = "Search Books/Categories/Artists";
            input.classList.remove("appear");
        });
    }
});
//#endregion
//#region headers/user

//----------------avatar...
const avatar = document.getElementsByClassName("avatar")[0];
const utils = document.getElementsByClassName("user-utils")[0];
const nameUser = document.getElementsByClassName("user-basic-info")[0];
console.log(avatar);
avatar.style.backgroundColor = `#${account.uid}`;
avatar.textContent = account.username[0]
nameUser.textContent = account.username;

function avaclick() {
    utils.classList.toggle("clicked");
};
function signout(){
    account.remember = false;
    localStorage.setItem("loggedAccount", JSON.stringify(account));
    window.location.href = "login.html";
}