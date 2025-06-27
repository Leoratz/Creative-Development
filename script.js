// Canvas setup
const albumCanvas = document.getElementById('albumCanvas');
const albumCtx = albumCanvas.getContext('2d');
const cdCanvas = document.getElementById('cdCanvas');
const cdCtx = cdCanvas.getContext('2d');

// Images from HTML
const albumImg = document.getElementById('albumImg');
const cdImg = document.getElementById('cdImg');
const nameImg = document.getElementById('nameImg');
const logoImg = document.getElementById('logoImg');
const star1Img = document.getElementById('star1Img');
const star2Img = document.getElementById('star2Img');
const star3Img = document.getElementById('star3Img');

// Gem images loading
const gemImages = [];
const gemSources = [
    'images/gem_red.png', 'images/gem_diamant.png', 'images/gem_color.png', 'images/gem_pink.png',
    'images/gem_saphir.png', 'images/gem_green.png', 'images/gem_jaune.png', 'images/gem_blanc.png',
    'images/gem_blue.png', 'images/gem_ambré.png', 'images/gem_blu.png', 'images/gem_bluefonce.png',
    'images/gem_fushia.png', 'images/gem_lime.png', 'images/gem_rose.png', 'images/gem_rosepetant.png',
    'images/gem_rouge.png', 'images/gem_sparkling.png', 'images/gem_vert.png', 'images/gem_vieux_rose.png',
    'images/gem_violet.png', 'images/gem_yellow.png', 'images/gems_green.png'
];
let gemsLoaded = 0;
gemSources.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
        gemsLoaded++;
        if (gemsLoaded === gemSources.length) startGemAnimation();
    };
    gemImages.push(img);
});

// Gem animation variables
const fallingGems = [];
const settledGems = [];
const taylorCenterX = albumCanvas.width / 2;
const taylorCenterY = albumCanvas.height * 0.9;
const arcRadius = 210;
const totalArcGems = 40;
let arcGemCount = 0;
let arcGemTimer = 0;

// Name reveal animation
let nameReveal = 0;

// Gem class
class Gem {
    constructor(targetAngle = null, isArcGem = false) {
        this.size = Math.random() * 15 + 20;
        this.rotation = Math.random() * Math.PI * 3;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.image = gemImages[Math.floor(Math.random() * gemImages.length)];
        this.settled = false;
        this.isArcGem = isArcGem;
        this.targetAngle = targetAngle;

        if (isArcGem && targetAngle !== null) {
            const verticalStretch = 2;
            this.targetX = taylorCenterX + Math.cos(targetAngle) * arcRadius;
            this.targetY = taylorCenterY - Math.abs(Math.sin(targetAngle)) * arcRadius * verticalStretch;
            this.x = this.targetX;
            this.y = this.targetY - 100;
        } else {
            this.x = Math.random() * albumCanvas.width;
            this.y = -50;
            this.speed = Math.random() * 2 + 1;
        }
    }

    update() {
        if (!this.settled && this.isArcGem) {
            this.y += 2;
            this.rotation += this.rotationSpeed;
            if (this.y >= this.targetY - 10) this.settleInArc();
        }
    }

    settleInArc() {
        this.settled = true;
        this.speed = 0;
        this.rotationSpeed *= 0.2;
        this.x = this.targetX;
        this.y = this.targetY;
        const index = fallingGems.indexOf(this);
        if (index > -1) {
            fallingGems.splice(index, 1);
            settledGems.push(this);
        }
    }

    draw(ctx) {
        ctx.save();
        if (this.isArcGem && this.settled) {
            ctx.shadowColor = 'white';
            ctx.shadowBlur = 25;
        }
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

// Gem creation helpers
function createArcGem() {
    if (arcGemCount < totalArcGems) {
        const angleRange = Math.PI * 1.4;
        const startAngle = -0.2 * Math.PI;
        const targetAngle = startAngle + (arcGemCount / (totalArcGems - 1)) * angleRange;
        const arcGem = new Gem(targetAngle, true);
        fallingGems.push(arcGem);
        arcGemCount++;
    }
}
function addRandomGem() {
    arcGemTimer++;
    if (arcGemTimer > 30 && arcGemCount < totalArcGems) {
        createArcGem();
        arcGemTimer = 0;
    }
}

// Main album animation loop
function animateGems() {
    albumCtx.clearRect(0, 0, albumCanvas.width, albumCanvas.height);
    albumCtx.drawImage(albumImg, 0, 0, albumCanvas.width, albumCanvas.height);

    // Draw animated name
    const nameWidth = nameImg.width * (albumCanvas.width / albumImg.width);
    const nameHeight = nameImg.height * (albumCanvas.height / albumImg.height);
    const revealWidth = nameWidth; // Always show the full name after animation
    const nameX = (albumCanvas.width - nameWidth) / 2;
    const nameY = 8;
    albumCtx.save();
    albumCtx.beginPath();
    albumCtx.rect(nameX, nameY, revealWidth, nameHeight);
    albumCtx.clip();
    albumCtx.drawImage(nameImg, 0, 0, nameImg.width, nameImg.height, nameX, nameY, nameWidth, nameHeight);
    albumCtx.restore();

    // Draw logo at center bottom
    if (logoImg.complete && logoImg.naturalWidth > 0) {
        const logoWidth = albumCanvas.width * 0.3;
        const logoHeight = logoImg.height * (logoWidth / logoImg.width);
        const logoX = (albumCanvas.width - logoWidth) / 2;
        const logoY = albumCanvas.height - logoHeight;
        albumCtx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
    }

    // Draw shining stars at top right
    drawShiningStars();

    // Update and draw gems
    fallingGems.forEach(gem => { gem.update(); gem.draw(albumCtx); });
    settledGems.forEach(gem => { gem.draw(albumCtx); });

    addRandomGem();

    // Animate name reveal
    if (nameReveal < 1) {
        nameReveal += 0.01;
        if (nameReveal > 1) nameReveal = 1;
    }

    requestAnimationFrame(animateGems);
}

// Shining stars animation (top right)
function drawShiningStars() {
    const now = Date.now() / 1000;
    const starImgs = [star1Img, star2Img, star3Img];
    const baseX = albumCanvas.width - 90;
    const baseY = 24;
    const starSpacing = 28;
    starImgs.forEach((img, i) => {
        const shine = 0.6 + 0.4 * Math.abs(Math.sin(now * 0.5 + i));
        albumCtx.save();
        albumCtx.globalAlpha = shine;
        albumCtx.drawImage(
            img,
            baseX + i * starSpacing,
            baseY + Math.sin(now * 0.7 + i) * 4,
            24, 24
        );
        albumCtx.restore();
    });
}

// Start everything when images are loaded
nameImg.onload = () => {
    nameReveal = 0;
    animateGems();
};

// CD Animation
let angle = 0;
function animateCD() {
    cdCtx.clearRect(0, 0, cdCanvas.width, cdCanvas.height);
    cdCtx.save();
    cdCtx.translate(cdCanvas.width / 2, cdCanvas.height / 2);
    cdCtx.rotate(angle);
    cdCtx.drawImage(cdImg, -cdCanvas.width / 2, -cdCanvas.height / 2, cdCanvas.width, cdCanvas.height);
    cdCtx.restore();
    angle += 0.006;
    requestAnimationFrame(animateCD);
}
cdImg.onload = animateCD;

// Starfield (background sparkles)
const starCanvas = document.createElement('canvas');
starCanvas.width = albumCanvas.width;
starCanvas.height = albumCanvas.height;
const starCtx = starCanvas.getContext('2d');
document.querySelector('.cover-container').appendChild(starCanvas);
starCanvas.style.position = 'absolute';
starCanvas.style.left = '0';
starCanvas.style.top = '0';
starCanvas.style.pointerEvents = 'none';
starCanvas.style.zIndex = 3;

const stars = [];
const STAR_COUNT = 200;
for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height,
        r: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.6 + 0.4,
        twinkleSpeed: Math.random() * 0.008 + 0.002,
        twinklePhase: Math.random() * Math.PI * 2,
        color: [
            Math.floor(Math.random() * 80 + 180),
            Math.floor(Math.random() * 40 + 60),
            Math.floor(Math.random() * 30 + 70)
        ],
        size: Math.random() * 0.8 + 0.2,
        sparkleType: Math.random() < 0.3 ? 'cross' : 'circle'
    });
}
function drawStar(star) {
    const [h, s, l] = star.color;
    const twinkle = Math.sin(Date.now() * star.twinkleSpeed + star.twinklePhase) * 0.5 + 0.5;
    const dynamicRadius = star.r * star.size * (1 + twinkle * 0.8);
    starCtx.save();
    starCtx.globalAlpha = star.opacity * twinkle * 0.9;
    const gradient = starCtx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, dynamicRadius * 6
    );
    gradient.addColorStop(0, `hsla(${h},${s}%,${l}%,0.9)`);
    gradient.addColorStop(0.2, `hsla(${h},${s}%,${l}%,0.6)`);
    gradient.addColorStop(0.4, `hsla(${h},${s}%,${l}%,0.3)`);
    gradient.addColorStop(0.7, `hsla(${h},${s}%,${l}%,0.1)`);
    gradient.addColorStop(1, `hsla(${h},${s}%,${l}%,0)`);
    starCtx.fillStyle = gradient;
    starCtx.beginPath();
    starCtx.arc(star.x, star.y, dynamicRadius * 6, 0, Math.PI * 2);
    starCtx.fill();
    starCtx.fillStyle = `hsla(${h},${s}%,${Math.min(l + 20, 100)}%,${twinkle})`;
    starCtx.beginPath();
    starCtx.arc(star.x, star.y, dynamicRadius * 0.8, 0, Math.PI * 2);
    starCtx.fill();
    if (star.sparkleType === 'cross' && twinkle > 0.6) {
        starCtx.strokeStyle = `hsla(${h},${s}%,${l + 10}%,${twinkle * 0.7})`;
        starCtx.lineWidth = 0.5;
        starCtx.lineCap = 'round';
        const sparkleLength = dynamicRadius * 8;
        starCtx.beginPath();
        starCtx.moveTo(star.x, star.y - sparkleLength);
        starCtx.lineTo(star.x, star.y + sparkleLength);
        starCtx.stroke();
        starCtx.beginPath();
        starCtx.moveTo(star.x - sparkleLength, star.y);
        starCtx.lineTo(star.x + sparkleLength, star.y);
        starCtx.stroke();
    }
    starCtx.restore();
}
function animateStars() {
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    starCtx.imageSmoothingEnabled = true;
    starCtx.imageSmoothingQuality = 'high';
    for (const star of stars) {
        star.x += Math.sin(Date.now() * 0.0001 + star.twinklePhase) * 0.015;
        star.y += Math.cos(Date.now() * 0.0001 + star.twinklePhase) * 0.015;
        if (star.x < -20) star.x = starCanvas.width + 20;
        if (star.x > starCanvas.width + 20) star.x = -20;
        if (star.y < -20) star.y = starCanvas.height + 20;
        if (star.y > starCanvas.height + 20) star.y = -20;
        drawStar(star);
    }
    requestAnimationFrame(animateStars);
}
animateStars();

// CD hover/mouse movement
const coverContainer = document.querySelector('.cover-container');
let mouseX = 0;
let currentCDPosition = 0;
const maxCDMovement = 332;
coverContainer.addEventListener('mousemove', (e) => {
    const rect = coverContainer.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    const mouseProgress = Math.min(Math.max(mouseX / albumCanvas.width, 0), 1);
    const targetPosition = mouseProgress * maxCDMovement;
    animateCDPosition(targetPosition);
});
coverContainer.addEventListener('mouseleave', () => {
    animateCDPosition(0);
});
function animateCDPosition(targetPosition) {
    const animate = () => {
        const diff = targetPosition - currentCDPosition;
        currentCDPosition += diff * 0.1;
        cdCanvas.style.left = currentCDPosition + 'px';
        if (Math.abs(diff) > 0.5) {
            requestAnimationFrame(animate);
        } else {
            currentCDPosition = targetPosition;
            cdCanvas.style.left = currentCDPosition + 'px';
        }
    };
    animate();
}