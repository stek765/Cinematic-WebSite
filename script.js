const html = document.documentElement;
const canvas = document.getElementById("product-canvas");
const context = canvas.getContext("2d");
const loadingOverlay = document.querySelector(".loading-overlay");
const loadPercentDisplay = document.getElementById("load-percent");
const scrollSteps = document.querySelectorAll(".scroll-step");

// Emergency dismiss
if (loadingOverlay) {
    loadingOverlay.addEventListener('click', () => {
        finishLoading();
    });
}

// --- Menu Interaction ---
const menuToggle = document.getElementById("menu-toggle");
const menuOverlay = document.querySelector(".menu-overlay");
const navbar = document.querySelector(".navbar");

menuToggle.addEventListener("click", () => {
    menuOverlay.classList.toggle("open");
    navbar.classList.toggle("nav-open");

    // Toggle body scroll lock
    if (menuOverlay.classList.contains("open")) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "";
    }
});

// --- Configuration ---
const frameCount = 240;
const currentFrame = index => (
    `./frames-webp/ezgif-frame-${index.toString().padStart(3, '0')}.webp`
);

let images = [];
let imagesLoaded = 0;

// --- Smooth Scroll State ---
let targetFrameIndex = 1;
let currentFrameIndex = 1;
const easeFactor = 0.08;

// --- Canvas Helper: Cover Fit ---
const drawImageProp = (ctx, img, x, y, w, h, offsetX, offsetY) => {
    if (typeof offsetX !== "number") offsetX = 0.5;
    if (typeof offsetY !== "number") offsetY = 0.5;

    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    let iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,
        nh = ih * r,
        cx, cy, cw, ch, ar = 1;

    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
    nw *= ar;
    nh *= ar;

    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
};

// --- Render Loop ---
const render = () => {
    const scrollTop = html.scrollTop;
    const maxScrollTop = html.scrollHeight - window.innerHeight;
    const scrollFraction = scrollTop / maxScrollTop;

    // We want the bottle to be closed (frame 1) during the big hero title
    // Then start opening as we scroll down.
    // Let's bias the start slightly so it stays closed for the first 5% of scroll
    let adjustedFraction = (scrollFraction - 0.05) * 1.05;
    if (adjustedFraction < 0) adjustedFraction = 0;
    if (adjustedFraction > 1) adjustedFraction = 1;

    const rawTarget = (adjustedFraction * (frameCount - 1)) + 1;

    targetFrameIndex = Math.min(frameCount, Math.max(1, rawTarget));

    const diff = targetFrameIndex - currentFrameIndex;
    if (Math.abs(diff) > 0.001) {
        currentFrameIndex += diff * easeFactor;
    } else {
        currentFrameIndex = targetFrameIndex;
    }

    const frameToDraw = Math.round(currentFrameIndex);
    const safeIndex = Math.min(frameCount, Math.max(1, frameToDraw));
    const imgArrayIndex = safeIndex - 1;

    if (images[imgArrayIndex] && images[imgArrayIndex].complete) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawImageProp(context, images[imgArrayIndex], 0, 0, canvas.width, canvas.height, 0.5, 0.5);
    }

    requestAnimationFrame(render);
};

// --- Helper Functions in Global Scope ---
const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};
window.addEventListener('resize', resizeCanvas);

const finishLoading = () => {
    if (loadingOverlay) loadingOverlay.classList.add("hidden");
    resizeCanvas();
    requestAnimationFrame(render);
};

// --- Loading Logic ---
const preloadImages = () => {
    // Increase timeout safety for slow connections (15s instead of 4s)
    const safetyTimeout = setTimeout(() => {
        if (!loadingOverlay.classList.contains("hidden")) {
            console.warn("Forcing start due to timeout");
            finishLoading();
        }
    }, 15000);

    let loadedCount = 0;
    const criticalFrames = 60;
    let hasStarted = false;

    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        images.push(img); // Mantieni l'ordine
        img.src = currentFrame(i);

        img.onload = () => {
            loadedCount++;
            imagesLoaded++;

            if (loadPercentDisplay) {
                const percent = Math.floor((imagesLoaded / frameCount) * 100);
                loadPercentDisplay.innerText = `${percent}%`;
            }

            if (!hasStarted && imagesLoaded >= criticalFrames) {
                console.log("Critical frames loaded. Starting experience...");
                hasStarted = true;
                finishLoading();
            }

            if (imagesLoaded === frameCount) {
                if (!hasStarted) finishLoading();
                clearTimeout(safetyTimeout);
            }
        };

        img.onerror = () => {
            console.error(`Frame ${i} failed`);
            imagesLoaded++;
            if (imagesLoaded >= criticalFrames && !hasStarted) {
                hasStarted = true;
                finishLoading();
            }
        };
    }
};

// --- Intersection Observer for Text ---
const observerOptions = {
    threshold: 0.3
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        } else {
            entry.target.classList.remove('active');
        }
    });
}, observerOptions);

scrollSteps.forEach(step => {
    observer.observe(step);
});

// Start
preloadImages();

