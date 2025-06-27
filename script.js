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
    angle += 0.01; // adjust speed as needed
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