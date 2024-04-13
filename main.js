
const minDelay = 0.07;
const maxDelay = 0.15;
const minSize = 10;
const maxSize = 30;
const minMod = 10;
const maxMod = 30;
const columns = 70;
const stripCount = 50;

/** @type {HTMLCanvasElement} */
const cnv = document.getElementById("cnv");
const ctx = cnv.getContext("2d");
const strips = [];
const usedColumns = [];
var screenWidth = 100, screenHeight = 100;
var initialized = false;
var time = undefined;

const characters = [];
function addCharacters(start, end) {
    for (var i = start; i <= end; i++)
        characters.push(String.fromCodePoint(i));
}

addCharacters(0xff66, 0xff9d) // Japanese kanji
// addCharacters(0x61, 0x7a)
// addCharacters(0x41, 0x5a)
// addCharacters(0x30, 0x39)

function randomInt(start, end) {
    return start + Math.floor(Math.random() * (end - start));
}

function randomFloat(start, end) {
    return start + Math.random() * (end - start);
}

function randomElement(arr) {
    return arr[randomInt(0, arr.length)];
}

function clearScreen() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, screenWidth, screenHeight);
}

function setFontSize(size) {
    //    if(size>1000) size = 1000;
    ctx.font = ctx.font.replace(/\d+(\.?\d+)/, size.toString());
}

class Strip {
    constructor() {
        this.reset();
        this.revealed = randomInt(0, 2 * this.chars.length)
    }
    reset() {
        if (this.n != undefined) usedColumns[this.n] = false;
        var n;
        do {
            n = randomInt(0, columns);
        } while (usedColumns[n]);
        usedColumns[n] = true;
        this.n = n;
        this.x = n * screenWidth / columns;
        this.y = 0;
        const size = randomInt(minSize, maxSize);
        const len = screenHeight / size;
        this.mod = randomInt(minMod, maxMod);
        this.fontSize = size;
        this.chars = [];
        this.revealed = 0;
        this.time = 0;
        this.delay = randomFloat(minDelay, maxDelay);
        for (var i = 0; i < len; i++) {
            this.chars.push(randomElement(characters));
        }
    }

    draw() {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#0f0';
        setFontSize(this.fontSize);
        for (var i = 0; i < this.revealed && i < this.chars.length; i++) {
            const y = this.y + this.fontSize + i * this.fontSize;
            const mod = 10;
            ctx.globalAlpha = Math.min((mod * 1000 + i - this.revealed) % mod / mod, Math.max(0, 1 + (this.chars.length - this.revealed) / this.chars.length));
            ctx.fillText(this.chars[i], this.x, y);
        }
        ctx.globalAlpha = 1;
    }

    update(dt) {
        this.time += dt;
        this.chars[randomInt(0, this.chars.length)] = randomElement(characters);
        this.chars[randomInt(0, this.chars.length)] = randomElement(characters);
        const hs = screenWidth / 2;
        const scale = 1.00 //+ 0.001 * this.fontSize / (maxSize - minSize)
        this.y = (screenHeight - this.chars.length * this.fontSize) / 2;
        //        this.fontSize *= scale;
        //        this.fontSize += dt * this.fontSize / this.chars.length
        this.x = (this.x - hs) * scale + hs;
        if (this.time > this.delay) {
            this.time -= this.delay;
            this.revealed++;
        }
        if (1 + (this.chars.length - this.revealed) / this.chars.length <= 0
            || this.x < -this.fontSize / 2
            || this.x > screenWidth + this.fontSize / 2) {
            this.reset();
        }
    }
}

function init() {
    if (initialized) return;
    initialized = true;
    for (var i = 0; i < stripCount; i++) {
        strips.push(new Strip());
    }
}

function redraw() {
    var currTime = new Date().getTime() / 1000;
    var dt;
    if (time === undefined) {
        dt = 0;
        time = currTime;
    } else {
        dt = currTime - time;
        time = currTime;
    }
    clearScreen();
    for (var i = 0; i < strips.length; i++) {
        strips[i].update(dt);
        strips[i].draw();
    }
}

function updateCanvas() {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    cnv.width = screenWidth;
    cnv.height = screenHeight;
    init();
}


window.addEventListener("resize", updateCanvas);
updateCanvas();
myInterval = setInterval(redraw, 50);
