const albumCanvas = document.getElementById('albumCanvas');
const albumCtx = albumCanvas.getContext('2d');
const cdCanvas = document.getElementById('cdCanvas');
const cdCtx = cdCanvas.getContext('2d');

const albumImg = new Image();
const cdImg = new Image();
albumImg.src = 'images/fond_photo.png';
cdImg.src = 'images/taylorCD.png';

// Gem sources
const gemImages = [];
const gemSources = [
    'images/gem_red.png',
    'images/gem_diamant.png',
    'images/gem_color.png',
    'images/gem_pink.png',
    'images/gem_saphir.png',
    'images/gem_green.png',
    'images/gem_jaune.png',
    'images/gem_blanc.png',
    'images/gem_blue.png',
    'images/gem_ambré.png',
    'images/gem_blu.png',
    'images/gem_bluefonce.png',
    'images/gem_fushia.png',
    'images/gem_lime.png',
    'images/gem_rose.png',
    'images/gem_rosepetant.png',
    'images/gem_rouge.png',
    'images/gem_sparkling.png',
    'images/gem_vert.png',
    'images/gem_vieux_rose.png',
    'images/gem_violet.png',
    'images/gem_yellow.png',
    'images/gems_green.png'
];

let gemsLoaded = 0;
gemSources.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
        gemsLoaded++;
        if (gemsLoaded === gemSources.length) {
            startGemAnimation();
        }
    };
    gemImages.push(img);
});

const fallingGems = [];
const settledGems = [];

const taylorCenterX = albumCanvas.width / 2;
const taylorCenterY = albumCanvas.height * 0.9;
const arcRadius = 210; 
const totalArcGems = 40;
let arcGemCount = 0;

class Gem {
    constructor(targetAngle = null, isArcGem = false) {
        this.size = Math.random() * 15 + 20; // Random size between 30-50px (increased from 15-25)
        this.rotation = Math.random() * Math.PI * 3;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.image = gemImages[Math.floor(Math.random() * gemImages.length)];
        this.settled = false;
        this.isArcGem = isArcGem;
        this.targetAngle = targetAngle;

        if (this.isArcGem && this.targetAngle !== null) {
            this.targetX = taylorCenterX + Math.cos(this.targetAngle) * arcRadius;
            // Make arc longer at the ends by using a different vertical calculation
            const verticalStretch = 2; // Factor to stretch the arc vertically at the ends
            this.targetY = taylorCenterY - Math.abs(Math.sin(this.targetAngle)) * arcRadius * verticalStretch;
            this.x = this.targetX;
            this.y = this.targetY - 100; // tombe depuis au-dessus
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

            if (this.y >= this.targetY - 10) {
                this.settleInArc();
            }
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

function createArcGem() {
    if (arcGemCount < totalArcGems) {
        const angleRange = Math.PI * 1.4; // Increased from Math.PI to create more spacing
        const startAngle = -0.2 * Math.PI; // Start a bit before 0 degrees
        const targetAngle = startAngle + (arcGemCount / (totalArcGems - 1)) * angleRange;

        const arcGem = new Gem(targetAngle, true);
        fallingGems.push(arcGem);
        arcGemCount++;
    }
}

let arcGemTimer = 0;
function addRandomGem() {
    arcGemTimer++;
    if (arcGemTimer > 30 && arcGemCount < totalArcGems) {
        createArcGem();
        arcGemTimer = 0;
    }
}

// Album Vinyle Animation
albumImg.onload = () => {
    albumCtx.drawImage(albumImg, 0, 0, albumCanvas.width, albumCanvas.height);
};

let angle = 0;
function animateCD() {
    cdCtx.clearRect(0, 0, cdCanvas.width, cdCanvas.height);
    cdCtx.save();
    cdCtx.translate(cdCanvas.width / 2, cdCanvas.height / 2);
    cdCtx.rotate(angle);
    cdCtx.drawImage(cdImg, -cdCanvas.width / 2, -cdCanvas.height / 2, cdCanvas.width, cdCanvas.height);
    cdCtx.restore();
    angle += 0.006; // speed
    requestAnimationFrame(animateCD);
}

cdImg.onload = animateCD;

function animateGems() {
    // Clear and redraw album background
    albumCtx.clearRect(0, 0, albumCanvas.width, albumCanvas.height);
    albumCtx.drawImage(albumImg, 0, 0, albumCanvas.width, albumCanvas.height);
    
    // Update and draw falling gems
    fallingGems.forEach(gem => {
        gem.update();
        gem.draw(albumCtx);
    });
    
    // Draw settled gems
    settledGems.forEach(gem => {
        gem.draw(albumCtx);
    });
    
    // Add new gems occasionally
    addRandomGem();
    
    requestAnimationFrame(animateGems);
}

function startGemAnimation() {
    // Start creating arc gems immediately
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            if (arcGemCount < totalArcGems) {
                createArcGem();
            }
        }, i * 500);
    }
    animateGems();
}
let nameReveal = 0;

function animateName() {
    albumCtx.clearRect(0, 0, albumCanvas.width, albumCanvas.height);
    albumCtx.drawImage(albumImg, 0, 0, albumCanvas.width, albumCanvas.height);

    // Draw the animated name
    const nameWidth = nameImg.width * (albumCanvas.width / albumImg.width);
    const nameHeight = nameImg.height * (albumCanvas.height / albumImg.height);
    const revealWidth = nameWidth * nameReveal;
    const nameX = (albumCanvas.width - nameWidth) / 2;
    const nameY = 8;

    albumCtx.save();
    albumCtx.beginPath();
    albumCtx.rect(nameX, nameY, revealWidth, nameHeight);
    albumCtx.clip();
    albumCtx.drawImage(
        nameImg,
        0, 0, nameImg.width, nameImg.height,
        nameX, nameY, nameWidth, nameHeight
    );
    albumCtx.restore();

    if (logoImg.complete && logoImg.naturalWidth > 0) {
        const logoWidth = albumCanvas.width * 0.3;
        const logoHeight = logoImg.height * (logoWidth / logoImg.width);
        const logoX = (albumCanvas.width - logoWidth) / 2;
        const logoY = albumCanvas.height - logoHeight;
        albumCtx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
    }

    if (nameReveal < 1) {
        nameReveal += 0.01; // speed
        requestAnimationFrame(animateName);
    }
}

function startNameAnimation() {
    nameReveal = 0;
    animateName();
}

nameImg.onload = () => {
    startNameAnimation();
    setInterval(startNameAnimation, 5000);
};

if (logoImg.complete) {
    const logoWidth = albumCanvas.width * 0.4; // 40% of album width, adjust as needed
    const logoHeight = logoImg.height * (logoWidth / logoImg.width);
    const logoX = (albumCanvas.width - logoWidth) / 2;
    const logoY = albumCanvas.height - logoHeight - 24; // 24px from bottom, adjust as needed
    albumCtx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
}

logoImg.onload = animateName;

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
    
    // Main glow
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
    
    // Bright center
    starCtx.fillStyle = `hsla(${h},${s}%,${Math.min(l + 20, 100)}%,${twinkle})`;
    starCtx.beginPath();
    starCtx.arc(star.x, star.y, dynamicRadius * 0.8, 0, Math.PI * 2);
    starCtx.fill();
    
    // Cross sparkle for some stars
    if (star.sparkleType === 'cross' && twinkle > 0.6) {
        starCtx.strokeStyle = `hsla(${h},${s}%,${l + 10}%,${twinkle * 0.7})`;
        starCtx.lineWidth = 0.5;
        starCtx.lineCap = 'round';
        
        const sparkleLength = dynamicRadius * 8;
        // Vertical line
        starCtx.beginPath();
        starCtx.moveTo(star.x, star.y - sparkleLength);
        starCtx.lineTo(star.x, star.y + sparkleLength);
        starCtx.stroke();
        
        // Horizontal line
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
        
        // Keep stars within bounds
        if (star.x < -20) star.x = starCanvas.width + 20;
        if (star.x > starCanvas.width + 20) star.x = -20;
        if (star.y < -20) star.y = starCanvas.height + 20;
        if (star.y > starCanvas.height + 20) star.y = -20;
        
        drawStar(star);
    }
    
    requestAnimationFrame(animateStars);
}
animateStars();

const coverContainer = document.querySelector('.cover-container');
let mouseX = 0;
let currentCDPosition = 0;
const maxCDMovement = 332;

coverContainer.addEventListener('mousemove', (e) => {
    const rect = coverContainer.getBoundingClientRect();
    mouseX = e.clientX - rect.left;

    // Calculate progress (0 = left, 1 = right)
    const mouseProgress = Math.min(Math.max(mouseX / albumCanvas.width, 0), 1);
    const targetPosition = mouseProgress * maxCDMovement;

    animateCDPosition(targetPosition);
});

coverContainer.addEventListener('mouseleave', () => {
    // Return CD to fully hidden position
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