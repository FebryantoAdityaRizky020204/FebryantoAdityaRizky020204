// *Canvas
let canvas = document.getElementById("hero-canvas");
let ctx = canvas.getContext("2d");

// *Canvas Size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let scale = window.devicePixelRatio || 1;
let width = window.innerWidth * scale;
let height = window.innerHeight * scale;

canvas.width = width;
canvas.height = height;

const IMAGE_REPEAT_COUNT = 6;
const imagesToLoad = [
    { src: "./assets/img/css.png" },
    { src: "./assets/img/html.png" },
    { src: "./assets/img/javascript.png" },
    { src: "./assets/img/bootstrap.png" },
    { src: "./assets/img/nodejs.png" },
    { src: "./assets/img/laravel.png" },
    { src: "./assets/img/laragon.png" },
    { src: "./assets/img/php.png" },
    { src: "./assets/img/phpmyadmin.png" },
    { src: "./assets/img/react.png" },
];

let imageParticles = [];
let images = {};
let loaded = 0;
let pointerX, pointerY;
let velocity = { x: 0, y: 0, tx: 0, ty: 0, z: 0.0005 };
let touchInput = false;
let lastScrollY = window.scrollY;
let scrollSpeed = 0;

function resizeCanvas() {
    width = window.innerWidth * scale;
    height = window.innerHeight * scale;
    canvas.width = width;
    canvas.height = height;
}

function loadImages() {
    imagesToLoad.forEach((imgData) => {
        const img = new Image();
        img.src = imgData.src;
        img.onload = () => {
            images[imgData.src] = img;
            loaded++;
            if (loaded === imagesToLoad.length) {
                createParticles();
                animate();
            }
        };
        img.onerror = () => console.error("Failed to load", imgData.src);
    });
}

function createParticles() {
    for (let i = 0; i < imagesToLoad.length; i++) {
        const img = images[imagesToLoad[i].src];
        for (let j = 0; j < IMAGE_REPEAT_COUNT; j++) {
            const heightTarget = 3 + Math.random() * 15;
            const aspect = img.width / img.height;
            const widthTarget = heightTarget * aspect;

            imageParticles.push({
                img,
                width: widthTarget,
                height: heightTarget,
                x: Math.random() * width,
                y: Math.random() * height,
                z: 0.2 + Math.random() * 0.8,
            });
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    updateParticles();
    renderParticles();

    requestAnimationFrame(animate);
}

function updateParticles() {
    velocity.tx *= 0.96;
    velocity.ty *= 0.96;
    velocity.x += (velocity.tx - velocity.x) * 0.8;
    velocity.y += (velocity.ty - velocity.y) * 0.8;

    // Hanya turunkan velocity.z jika tidak sedang scroll
    if (scrollSpeed === 0) {
        velocity.z *= 1;
    }

    imageParticles.forEach((p) => {
        p.x += velocity.x * p.z;
        p.y += velocity.y * p.z;
        p.x += (p.x - width / 2) * velocity.z * p.z;
        p.y += (p.y - height / 2) * velocity.z * p.z;
        p.z += velocity.z;

        if (p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.z = 0.2 + Math.random() * 0.8;
        }
    });

    // Reset scroll speed agar z tidak terus meningkat
    scrollSpeed = 0;
}

function renderParticles() {
    imageParticles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = 0.85;

        // Efek glow putih
        ctx.shadowColor = "rgba(255, 255, 255, 0.7)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.drawImage(p.img, p.x, p.y, p.width, p.height);

        ctx.restore();
    });
}

function movePointer(x, y) {
    if (typeof pointerX === "number" && typeof pointerY === "number") {
        let ox = x - pointerX,
            oy = y - pointerY;
        velocity.tx += (ox / 200) * scale * (touchInput ? 1 : -1);
        velocity.ty += (oy / 200) * scale * (touchInput ? 1 : -1);
    }
    pointerX = x;
    pointerY = y;
}

function onMouseMove(event) {
    touchInput = false;
    movePointer(event.clientX, event.clientY);
}
function onTouchMove(event) {
    touchInput = true;
    movePointer(event.touches[0].clientX, event.touches[0].clientY, true);
    event.preventDefault();
}
function onMouseLeave() {
    pointerX = null;
    pointerY = null;
}

window.addEventListener("resize", resizeCanvas);
canvas.addEventListener("mousemove", onMouseMove);
canvas.addEventListener("touchmove", onTouchMove);
canvas.addEventListener("touchend", onMouseLeave);

let scrollTimeout = null;
window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    scrollSpeed = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    // Percepat ke depan hanya saat scroll aktif
    velocity.z += scrollSpeed * 0.0002;

    // Batasi kecepatan z
    if (velocity.z > 0.03) velocity.z = 0.03;
    if (velocity.z < -0.01) velocity.z = -0.01;

    // Reset setelah scroll selesai (misal 100ms setelah scroll terakhir)
    if (scrollTimeout !== null) {
        clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(() => {
        velocity.z = 0.001; // Kembalikan ke nilai default
        scrollSpeed = 0; // Reset scroll speed
    }, 100);
});

document.addEventListener("mouseleave", onMouseLeave);

resizeCanvas();
loadImages();
