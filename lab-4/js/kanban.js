//Local storage

function saveState() {
  localStorage.setItem("kanbanCards", JSON.stringify(cards));
}

function loadState() {
  try {
    const data = JSON.parse(localStorage.getItem("kanbanCards"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}


//Card counter

let cards = loadState();
let noteCount = cards.length ? Math.max(...cards.map(c => c.id)) + 1 : 0;

let board1Count = 0;
let board2Count = 0;
let board3Count = 0;

const toDoCount   = document.getElementById("toDoCount");
const doingCount  = document.getElementById("doingCount");
const doneCount   = document.getElementById("doneCount");

function updateCounters() {
  board1Count = cards.filter(c => c.board === "board1").length;
  board2Count = cards.filter(c => c.board === "board2").length;
  board3Count = cards.filter(c => c.board === "board3").length;

  toDoCount.textContent  = board1Count;
  doingCount.textContent = board2Count;
  doneCount.textContent  = board3Count;

  saveState();
}


//Create card

function renderCard(card) {
  const { id, text, color, board } = card;

  const boardEl = document.getElementById(board);
  const s = document.createElement("div");
  const t = document.createElement("textarea");
  const x = document.createElement("div");
  const r = document.createElement("div");

  s.className = "shape square";
  t.rows = 5;
  t.cols = 16;
  t.value = text;
  t.style.backgroundColor = color;

  x.textContent = "X";
  x.className = "delete";

  r.textContent = "Zmień kolor";
  r.className = "colorChange";

  //Set card text
  t.addEventListener("input", () => {
    card.text = t.value;
    updateCounters();
  });

  //Set card color
  r.addEventListener("click", () => {
    const newColor = randomHsl();
    t.style.backgroundColor = newColor;
    card.color = newColor;
    updateCounters();
  });

  //Delete card
  x.addEventListener("click", () => {
    s.remove();
    cards = cards.filter(c => c.id !== id);
    updateCounters();
  });

  //Move card
  if (board === "board1") {
    const a = document.createElement("div");
    a.className = "arrow";
    a.textContent = ">";
    a.addEventListener("click", () => moveCard(id, "board2"));
    s.style.backgroundColor = "#A01C1C";
    s.appendChild(a);

  } else if (board === "board2") {
    const a1 = document.createElement("div");
    const a2 = document.createElement("div");
    a1.className = "arrow";
    a2.className = "arrow";
    a1.textContent = "<";
    a2.textContent = ">";
    a1.addEventListener("click", () => moveCard(id, "board1"));
    a2.addEventListener("click", () => moveCard(id, "board3"));
    s.style.backgroundColor = "#CBA328";
    s.appendChild(a2);
    s.appendChild(a1);

  } else if (board === "board3") {
    const a = document.createElement("div");
    a.className = "arrow";
    a.textContent = "<";
    a.addEventListener("click", () => moveCard(id, "board2"));
    s.style.backgroundColor = "#1CA022";
    s.appendChild(a);
  }

  s.appendChild(x);
  s.appendChild(t);
  s.appendChild(r);

  boardEl.appendChild(s);
}


//Create card

function create(board, content = "") {
  const card = {
  id: noteCount++,
  text: content,
  color: randomHsl(),
  board: board,
  createdAt: Date.now()  
};


  cards.push(card);
  renderCard(card);
  updateCounters();
}


//Moving cards

function moveCard(id, newBoard) {
  const card = cards.find(c => c.id === id);
  if (!card) return;
  card.board = newBoard;
  rerender();
}


//Render cards

function rerender() {
  document.getElementById("board1").innerHTML = "";
  document.getElementById("board2").innerHTML = "";
  document.getElementById("board3").innerHTML = "";

  cards.forEach(renderCard);
  updateCounters();
}


//Color

function randomHsl() {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 75%)`;
}


//Recolor

function recolor(boardId) {
  cards
    .filter(c => c.board === boardId)
    .forEach(c => c.color = randomHsl());

  rerender();
}


//Buttons

document.getElementById("b1").addEventListener("click", () => create("board1"));
document.getElementById("b2").addEventListener("click", () => create("board2"));
document.getElementById("b3").addEventListener("click", () => create("board3"));

document.getElementById("bc1").addEventListener("click", () => recolor("board1"));
document.getElementById("bc2").addEventListener("click", () => recolor("board2"));
document.getElementById("bc3").addEventListener("click", () => recolor("board3"));


// Sort cards
function sortColumn(boardId, type) {

  const boardEl = document.getElementById(boardId);

  const colCards = cards.filter(c => c.board === boardId);

  if (type === "az") {
    colCards.sort((a, b) => a.text.localeCompare(b.text));
  } 
  else if (type === "dateAsc") {
    colCards.sort((a, b) => a.createdAt - b.createdAt);
  } 
  else if (type === "dateDesc") {
    colCards.sort((a, b) => b.createdAt - a.createdAt);
  }

  boardEl.innerHTML = "";

  colCards.forEach(c => renderCard(c));

  const otherCards = cards.filter(c => c.board !== boardId);

  cards = [...otherCards, ...colCards];

  updateCounters();
}

document.querySelectorAll(".sortAZ").forEach(btn => {
  btn.addEventListener("click", () => {
    sortColumn(btn.dataset.board, "az");
  });
});

document.querySelectorAll(".sortDateAsc").forEach(btn => {
  btn.addEventListener("click", () => {
    sortColumn(btn.dataset.board, "dateAsc");
  });
});

document.querySelectorAll(".sortDateDesc").forEach(btn => {
  btn.addEventListener("click", () => {
    sortColumn(btn.dataset.board, "dateDesc");
  });
});



rerender();
