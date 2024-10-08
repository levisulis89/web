// Canvas elem kiválasztása és 2D kontextus megszerzése
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d'); // Canvas kötelező metódusa

// Beállítjuk a canvas méreteit
canvas.width = 1000; // Canvas szélessége pixelben
canvas.height = 500; // Canvas magassága pixelben
canvas.style.marginLeft = '50px'; // Margin a bal oldalon
canvas.style.border = '3px solid #000'; // Képkeret
canvas.style.boxShadow = '0 0 30px black'; // Árnyék hozzáadása

// A cellák mérete az új canvas méretekhez igazítva
const CELL_SIZE = 25; // Cella mérete pixelben
const WORLD_WIDTH = Math.floor(canvas.width / CELL_SIZE); // A játék világ szélessége cellákban
const WORLD_HEIGHT = Math.floor(canvas.height / CELL_SIZE); // A játék világ magassága cellákban
const MOVE_INTERVAL = 300; // Milyen sűrűn mozogjon a kígyó feje (300 millimásodperc)
const FOOD_SPAWN_INTERVAL = 1000; // Milyen gyakran jelenjen meg új étel (1000 millimásodperc)

let input; // Felhasználói input változó
let snake; // Kígyó állapot
let foods; // Ételek tömb
let foodSpawnElapsed; // Idő az utolsó étel megjelenítése óta
let gameOver; // Játék állapota (vég)
let score; // Játékos eredménye
let level; // Játékos szintje
const deathSound = new Audio('/public/img/menjel_csaje_haza_magadnak.mp3'); // Halál hang
const eatSound = new Audio('/public/img/eating-sound-effect.mp3'); // Étkezési hang
const mikrofonSound = new Audio('/public/img/milyen_csodas_ez_a_nap.mp3'); // Mikrofon hang

// Inicializálja a játékot
function reset() {
    input = {}; // Input változó inicializálása
    snake = {
        moveElapsed: 0, // Idő a kígyó mozgásához
        length: 4, // Kígyó hossza
        parts: [{ x: Math.floor(WORLD_WIDTH / 2), y: Math.floor(WORLD_HEIGHT / 2) }], // Kígyó kezdeti helyzete
        dir: null, // Jelenlegi irány
        newDir: { x: 1, y: 0 }, // Új irány (jobbra)
        color: 'green' // Kígyó színe
    };
    foods = []; // Ételek tömbjének inicializálása
    foodSpawnElapsed = 0; // Idő az utolsó étel megjelenítése óta
    gameOver = false; // Játék vége állapota
    score = 0; // Pontszám inicializálása
    level = 1; // Kezdeti szint
    lastTimestamp = null; // Utolsó időbélyeg resetelése
}

// Ételtípusok és képek betöltése
const foodTypes = [
    { type: 'apple', points: 1, image: new Image() }, // Alma típus
    { type: 'banana', points: 2, image: new Image() }, // Banán típus
    { type: 'cherry', points: 3, image: new Image() }, // Cseresznye típus
    { type: 'laci', points: 0, image: new Image() }, // 'laci' típus
    { type: 'mikrofon', points: 5, image: new Image() } // Mikrofon típus
];

// Képek forrása
foodTypes[0].image.src = 'img/apple.png'; // Alma kép
foodTypes[1].image.src = 'img/banana.svg'; // Banán kép
foodTypes[2].image.src = 'img/cherry.png'; // Cseresznye kép
foodTypes[3].image.src = 'img/laci.png'; // 'laci' kép
foodTypes[4].image.src = 'img/mikrofon.jpg'; // Mikrofon kép

// Kört rajzoló függvény
function fillCircle(x, y, radius) {
    ctx.beginPath(); // Új útvonal kezdése
    ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2); // Kör rajzolása
    ctx.fill(); // Kör kitöltése
}

// Kígyó mozgásának frissítése
function update(delta) {
    if (gameOver) { // Ha a játék véget ért
        return; // Kilépés, ha a játék véget ért
    }

    // Kígyó irányának frissítése
    if (input.ArrowLeft && snake.dir.x !== 1) {
        snake.newDir = { x: -1, y: 0 }; // Balra fordulás
    } else if (input.ArrowUp && snake.dir.y !== 1) {
        snake.newDir = { x: 0, y: -1 }; // Felfelé fordulás
    } else if (input.ArrowRight && snake.dir.x !== -1) {
        snake.newDir = { x: 1, y: 0 }; // Jobbra fordulás
    } else if (input.ArrowDown && snake.dir.y !== -1) {
        snake.newDir = { x: 0, y: 1 }; // Lefelé fordulás
    }

    // Kígyó mozgásának kezelése
    snake.moveElapsed += delta; // Frissítjük az időt
    if (snake.moveElapsed > MOVE_INTERVAL) { // Ha elérte a mozgási intervallumot
        snake.dir = snake.newDir; // Beállítjuk az új irányt
        snake.moveElapsed -= MOVE_INTERVAL; // Reseteljük az időt
        const newSnakePart = { // Új kígyó rész létrehozása
            x: snake.parts[0].x + snake.dir.x,
            y: snake.parts[0].y + snake.dir.y
        };
        
        // Ellenőrizzük a falnak és a saját magának ütközést
        if (newSnakePart.x < 0 || newSnakePart.x >= WORLD_WIDTH || newSnakePart.y < 0 || newSnakePart.y >= WORLD_HEIGHT || 
            snake.parts.some(part => part.x === newSnakePart.x && part.y === newSnakePart.y)) {
            gameOver = true; // Játék vége
            return; // Kilépés
        }

        snake.parts.unshift(newSnakePart); // Új rész hozzáadása a kígyó elejéhez

        // Ha a kígyó hossza meghaladja a szükséges hosszt, eltávolítjuk a végét
        if (snake.parts.length > snake.length) {
            snake.parts.pop(); // Ha túl hosszú a kígyó, eltávolítjuk a végéről egy darabot
        }

        const head = snake.parts[0]; // Kígyó fejének koordinátái
        const foodEatenIndex = foods.findIndex(f => f.x === head.x && f.y === head.y); // Ellenőrizzük, hogy a kígyó eszik-e valamit
        if (foodEatenIndex >= 0) {
            const eatenFood = foods[foodEatenIndex]; // Elfogyasztott étel
            if (eatenFood.foodType.type === 'mikrofon') { // Ha a mikrofont eszi
                mikrofonSound.play(); // Mikrofon hang lejátszása
                score += eatenFood.foodType.points; // Pontszám növelése
            } else if (eatenFood.foodType.type === 'laci') { // Ha a 'laci' ételt eszi
                deathSound.play(); // Halál hang lejátszása
                gameOver = true; // Játék vége
            } else {
                score += eatenFood.foodType.points; // Pontszám növelése
                eatSound.play(); // Étkezési hang lejátszása
                snake.length++; // Kígyó hosszának növelése
            }

            foods.splice(foodEatenIndex, 1); // Eltávolítjuk az elfogyasztott ételt
        }

        // Ellenőrizzük, hogy elértük-e a szintet
        if (score >= level * 5) { // Szint növelés
            level++; // Szint növelése
            snake.color = getColorForLevel(level); // Kígyó színének megváltoztatása
            if (level > 10) { // Ha elértük a maximális szintet
                gameOver = true; // Játék vége
                alert('Nyertél!'); // Nyertes üzenet
            }
        }
    }
}

// Ételt generáló függvény
function spawnFood() {
    // Új ételt generálunk
    const foodType = foodTypes[Math.floor(Math.random() * foodTypes.length)]; // Véletlenszerű ételt választunk
    const food = {
        x: Math.floor(Math.random() * WORLD_WIDTH), // Véletlenszerű x koordináta
        y: Math.floor(Math.random() * WORLD_HEIGHT), // Véletlenszerű y koordináta
        foodType: foodType // Az étel típusa
    };
    foods.push(food); // Hozzáadjuk az ételt a listához
}

// Szint színének meghatározása
function getColorForLevel(level) {
    switch (level) {
        case 1: return 'green';
        case 2: return 'blue';
        case 3: return 'purple';
        case 4: return 'red';
        case 5: return 'orange';
        case 6: return 'yellow';
        case 7: return 'cyan';
        case 8: return 'magenta';
        case 9: return 'lime';
        case 10: return 'gold';
        default: return 'green';
    }
}

// Rajzoló függvény
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas törlése

    // Kígyó rajzolása
    for (let i = 0; i < snake.parts.length; i++) {
        const part = snake.parts[i];
        ctx.fillStyle = snake.color; // Kígyó színének beállítása
        fillCircle(part.x * CELL_SIZE, part.y * CELL_SIZE, CELL_SIZE / 2); // Kígyó részeinek kirajzolása
    }

    // Ételek rajzolása
    for (const food of foods) {
        ctx.drawImage(food.foodType.image, food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE); // Étel kirajzolása
    }

    // Pontszám és szint megjelenítése
    ctx.fillStyle = 'black'; // Szöveg színe
    ctx.font = '20px Arial'; // Betűtípus
    ctx.fillText(`Score: ${score}`, 10, 30); // Pontszám kiírása
    ctx.fillText(`Level: ${level}`, 10, 60); // Szint kiírása

    // Játék vége üzenet
    if (gameOver) {
        ctx.fillStyle = 'red'; // Játék vége szín
        ctx.fillText('Game Over!', canvas.width / 2 - 50, canvas.height / 2); // Játék vége üzenet középre
        ctx.fillText('Press R to restart', canvas.width / 2 - 80, canvas.height / 2 + 30); // Újraindítás üzenet
    }
}

// Játék ciklus
let lastTimestamp = null; // Utolsó időbélyeg
function gameLoop(timestamp) {
    if (lastTimestamp === null) lastTimestamp = timestamp; // Ha még nem volt utolsó időbélyeg, akkor beállítjuk

    const delta = timestamp - lastTimestamp; // Delta idő kiszámítása
    lastTimestamp = timestamp; // Frissítjük az utolsó időbélyeget

    update(delta); // Kígyó frissítése
    draw(); // Rajzolás

    // Étel generálás
    foodSpawnElapsed += delta; // Eltelt idő
    if (foodSpawnElapsed > FOOD_SPAWN_INTERVAL) {
        spawnFood(); // Ételt generálunk
        foodSpawnElapsed -= FOOD_SPAWN_INTERVAL; // Reseteljük az időt
    }

    requestAnimationFrame(gameLoop); // Kérés a következő animációs keretre
}

// Keyboard események kezelése
document.addEventListener('keydown', (e) => {
    input[e.key] = true; // Input beállítása
    if (e.key === 'r' || e.key === 'R') { // Ha R gombot nyomunk
        reset(); // Játék újraindítása
    }
});

// Keyboard események feloldása
document.addEventListener('keyup', (e) => {
    input[e.key] = false; // Input visszaállítása
});

// Játék inicializálás
reset(); // Reset és játék indítása
requestAnimationFrame(gameLoop); // Játék ciklus indítása
