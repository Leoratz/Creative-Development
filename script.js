// Canvas setup
const albumCanvas = document.getElementById("albumCanvas");
const albumCtx = albumCanvas.getContext("2d");
const cdCanvas = document.getElementById("cdCanvas");
const cdCtx = cdCanvas.getContext("2d");

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
  "images/gem_red.png",
  "images/gem_diamant.png",
  "images/gem_color.png",
  "images/gem_pink.png",
  "images/gem_saphir.png",
  "images/gem_green.png",
  "images/gem_jaune.png",
  "images/gem_blanc.png",
  "images/gem_blue.png",
  "images/gem_ambré.png",
  "images/gem_blu.png",
  "images/gem_bluefonce.png",
  "images/gem_fushia.png",
  "images/gem_lime.png",
  "images/gem_rose.png",
  "images/gem_rosepetant.png",
  "images/gem_rouge.png",
  "images/gem_sparkling.png",
  "images/gem_vieux_rose.png",
  "images/gem_violet.png",
  "images/gem_yellow.png",
  "images/gems_green.png",
];
let gemsLoaded = 0;
gemSources.forEach((src) => {
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
const taylorCenterY = albumCanvas.height * 0.9; // Adjusted to 90% of height for better positioning
const arcRadius = 210;
const totalArcGems = 19;
let arcGemCount = 0;
let arcGemTimer = 0;

// Name reveal animation
let nameReveal = 0;

// Gem class
class Gem {
  constructor(targetAngle = null, isArcGem = false) {
    this.size = Math.random() * 15 + 16;
    this.rotation = Math.random() * Math.PI * 3;
    this.rotationSpeed = (Math.random() - 0.5) * 0.05;
    this.image = gemImages[Math.floor(Math.random() * gemImages.length)];
    this.settled = false;
    this.isArcGem = isArcGem;
    this.targetAngle = targetAngle;

    if (isArcGem && targetAngle !== null) {
      const verticalStretch = 2;
      this.targetX = taylorCenterX + Math.cos(targetAngle) * arcRadius;
      this.targetY =
        taylorCenterY -
        Math.abs(Math.sin(targetAngle)) * arcRadius * verticalStretch;
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
    // Check for collisions with already settled gems
    let finalX = this.targetX;
    let finalY = this.targetY;
    let collision = false;
    
    // Check collision with all settled gems
    for (let settledGem of settledGems) {
      const distance = Math.sqrt(
        Math.pow(finalX - settledGem.x, 2) + 
        Math.pow(finalY - settledGem.y, 2)
      );
      
      if (distance < (this.size + settledGem.size) * 0.8) {
        collision = true;
        break;
      }
    }
    
    // If collision detected, find the nearest free position along the arc
    if (collision) {
      const verticalStretch = 2;
      let bestDistance = Infinity;
      let bestX = finalX;
      let bestY = finalY;
      
      // Try positions slightly to the left and right along the arc
      for (let offset = -0.15; offset <= 0.15; offset += 0.03) {
        const testAngle = this.targetAngle + offset;
        const testX = taylorCenterX + Math.cos(testAngle) * arcRadius;
        const testY = taylorCenterY - Math.abs(Math.sin(testAngle)) * arcRadius * verticalStretch;
        
        // Check if this position is free
        let positionFree = true;
        for (let settledGem of settledGems) {
          const testDistance = Math.sqrt(
            Math.pow(testX - settledGem.x, 2) + 
            Math.pow(testY - settledGem.y, 2)
          );
          
          if (testDistance < (this.size + settledGem.size) * 0.8) {
            positionFree = false;
            break;
          }
        }
        
        if (positionFree) {
          const distanceFromOriginal = Math.sqrt(
            Math.pow(testX - this.targetX, 2) + 
            Math.pow(testY - this.targetY, 2)
          );
          
          if (distanceFromOriginal < bestDistance) {
            bestDistance = distanceFromOriginal;
            bestX = testX;
            bestY = testY;
          }
        }
      }
      
      finalX = bestX;
      finalY = bestY;
    }
    
    this.settled = true;
    this.speed = 0;
    this.rotationSpeed *= 0.2;
    this.x = finalX;
    this.y = finalY;
    
    const index = fallingGems.indexOf(this);
    if (index > -1) {
      fallingGems.splice(index, 1);
      settledGems.push(this);
    }
  }

  draw(ctx) {
    ctx.save();
    
    // Calculate opacity based on falling progress for arc gems
    if (this.isArcGem) {
      ctx.shadowColor = "white";
      ctx.shadowBlur = 25;
      
      if (!this.settled) {
        // During falling: opacity increases from 30% to 100% based on fall progress
        const fallStartY = this.targetY - 100;
        const fallEndY = this.targetY;
        const fallProgress = Math.max(0, Math.min(1, (this.y - fallStartY) / (fallEndY - fallStartY)));
        const opacity = 0.3 + (fallProgress * 0.7); // 30% to 100%
        ctx.globalAlpha = opacity;
      } else {
        // When settled: full opacity
        ctx.globalAlpha = 1.0;
      }
    }
    
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.drawImage(
      this.image,
      -this.size / 2,
      -this.size / 2,
      this.size,
      this.size
    );
    ctx.restore();
  }
}

// Gem creation helpers
function createArcGem() {
  if (arcGemCount < totalArcGems) {
    const angleRange = Math.PI * 1.4;
    const startAngle = -0.2 * Math.PI;
    const targetAngle =
      startAngle + (arcGemCount / (totalArcGems - 1)) * angleRange;
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

<<<<<<< HEAD
    // Draw animated name
    const nameWidth = nameImg.width * (albumCanvas.width / albumImg.width) / 1.5;
    const nameHeight = nameImg.height * (albumCanvas.height / albumImg.height) / 1.5;
    const revealWidth = nameWidth * (nameReveal < 1 ? nameReveal : 1);
    const nameX = (albumCanvas.width - nameWidth) / 2;
    const nameY = 2;
    
=======
  // Draw animated name
  const nameWidth = nameImg.width * (albumCanvas.width / albumImg.width);
  const nameHeight = nameImg.height * (albumCanvas.height / albumImg.height);
  const revealWidth = nameWidth * (nameReveal < 1 ? nameReveal : 1);
  const nameX = (albumCanvas.width - nameWidth) / 2;
  const nameY = 8;
  albumCtx.save();
  albumCtx.beginPath();
  albumCtx.rect(nameX, nameY, revealWidth, nameHeight);
  albumCtx.clip();
  albumCtx.drawImage(
    nameImg,
    0,
    0,
    nameImg.width,
    nameImg.height,
    nameX,
    nameY,
    nameWidth,
    nameHeight
  );
  albumCtx.restore();
>>>>>>> 00dfb29dc2316b7d312a732168c5eda696b52a72

  if (nameReveal < 1) {
    nameReveal += 0.01;
    if (nameReveal > 1) nameReveal = 1;
  }

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
  fallingGems.forEach((gem) => {
    gem.update();
    gem.draw(albumCtx);
  });
  settledGems.forEach((gem) => {
    gem.draw(albumCtx);
  });

  addRandomGem();

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
      24,
      24
    );
    albumCtx.restore();
  });
}

// Start everything when images are loaded
function startGemAnimation() {
  // Start creating arc gems immediately
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      if (arcGemCount < totalArcGems) {
        createArcGem();
      }
    }, i * 500);
  }
}

nameImg.onload = () => {
  console.log("nameImg loaded!");
  nameReveal = 0;
  startGemAnimation(); // Start gem animation
  animateGems(); // Start main animation loop
};
nameImg.onerror = () => {
  console.error("Failed to load nameImg!");
};

// CD Animation
let angle = 0;
function animateCD() {
  cdCtx.clearRect(0, 0, cdCanvas.width, cdCanvas.height);
  cdCtx.save();
  cdCtx.translate(cdCanvas.width / 2, cdCanvas.height / 2);
  cdCtx.rotate(angle);
  cdCtx.drawImage(
    cdImg,
    -cdCanvas.width / 2,
    -cdCanvas.height / 2,
    cdCanvas.width,
    cdCanvas.height
  );
  cdCtx.restore();
  angle += 0.006;
  requestAnimationFrame(animateCD);
}
cdImg.onload = animateCD;

// White confetti animation (outside canvas)
const confettiCanvas = document.createElement("canvas");
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;
const confettiCtx = confettiCanvas.getContext("2d");
document.body.appendChild(confettiCanvas);
confettiCanvas.style.position = "fixed";
confettiCanvas.style.left = "0";
confettiCanvas.style.top = "0";
confettiCanvas.style.pointerEvents = "none";
confettiCanvas.style.zIndex = "-1";

const whiteConfetti = [];
const CONFETTI_COUNT = 60;

// Initialize white confetti
for (let i = 0; i < CONFETTI_COUNT; i++) {
  whiteConfetti.push({
    x: Math.random() * confettiCanvas.width,
    y: Math.random() * confettiCanvas.height,
    width: Math.random() * 8 + 4,
    height: Math.random() * 12 + 6,
    velocityX: Math.random() * 3 + 1, // Horizontal movement from left to right
    velocityY: (Math.random() - 0.5) * 1, // Slight vertical drift
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.1,
    opacity: Math.random() * 0.8 + 0.4,
    color: `hsl(${Math.random() * 60 + 200}, 20%, ${Math.random() * 30 + 85}%)`, // White to light blue
  });
}

function drawWhiteConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  
  whiteConfetti.forEach((confetti) => {
    // Update position
    confetti.x += confetti.velocityX;
    confetti.y += confetti.velocityY;
    confetti.rotation += confetti.rotationSpeed;
    
    // Wrap around screen edges horizontally
    if (confetti.x > confettiCanvas.width + 20) {
      confetti.x = -20;
      confetti.y = Math.random() * confettiCanvas.height; // New random vertical position
    }
    
    // Keep within vertical bounds
    if (confetti.y < -20) confetti.y = confettiCanvas.height + 20;
    if (confetti.y > confettiCanvas.height + 20) confetti.y = -20;
    
    // Draw confetti
    confettiCtx.save();
    confettiCtx.translate(confetti.x, confetti.y);
    confettiCtx.rotate(confetti.rotation);
    confettiCtx.globalAlpha = confetti.opacity;
    confettiCtx.fillStyle = confetti.color;
    confettiCtx.shadowColor = "white";
    confettiCtx.shadowBlur = 4;
    
    // Draw rectangle confetti
    confettiCtx.fillRect(-confetti.width / 2, -confetti.height / 2, confetti.width, confetti.height);
    
    confettiCtx.restore();
  });
}

function animateConfetti() {
  drawWhiteConfetti();
  requestAnimationFrame(animateConfetti);
}

// Start confetti animation
animateConfetti();

// Starfield (background sparkles)
const starCanvas = document.createElement("canvas");
starCanvas.width = albumCanvas.width;
starCanvas.height = albumCanvas.height;
const starCtx = starCanvas.getContext("2d");
document.querySelector(".cover-container").appendChild(starCanvas);
starCanvas.style.position = "absolute";
starCanvas.style.left = "0";
starCanvas.style.top = "0";
starCanvas.style.pointerEvents = "none";
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
      Math.floor(Math.random() * 30 + 70),
    ],
    size: Math.random() * 0.8 + 0.2,
    sparkleType: Math.random() < 0.3 ? "cross" : "circle",
  });
}
function drawStar(star) {
  const [h, s, l] = star.color;
  const twinkle =
    Math.sin(Date.now() * star.twinkleSpeed + star.twinklePhase) * 0.5 + 0.5;
  const dynamicRadius = star.r * star.size * (1 + twinkle * 0.8);
  starCtx.save();
  starCtx.globalAlpha = star.opacity * twinkle * 0.9;
  const gradient = starCtx.createRadialGradient(
    star.x,
    star.y,
    0,
    star.x,
    star.y,
    dynamicRadius * 6
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
  if (star.sparkleType === "cross" && twinkle > 0.6) {
    starCtx.strokeStyle = `hsla(${h},${s}%,${l + 10}%,${twinkle * 0.7})`;
    starCtx.lineWidth = 0.5;
    starCtx.lineCap = "round";
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
  starCtx.imageSmoothingQuality = "high";
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
const coverContainer = document.querySelector(".cover-container");
let mouseX = 0;
let currentCDPosition = 0;
const maxCDMovement = 332;
coverContainer.addEventListener("mousemove", (e) => {
  const rect = coverContainer.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  const mouseProgress = Math.min(Math.max(mouseX / albumCanvas.width, 0), 1);
  const targetPosition = mouseProgress * maxCDMovement;
  animateCDPosition(targetPosition);
});
coverContainer.addEventListener("mouseleave", () => {
  animateCDPosition(0);
});
function animateCDPosition(targetPosition) {
  const animate = () => {
    const diff = targetPosition - currentCDPosition;
    currentCDPosition += diff * 0.1;
    cdCanvas.style.left = currentCDPosition + "px";
    if (Math.abs(diff) > 0.5) {
      requestAnimationFrame(animate);
    } else {
      currentCDPosition = targetPosition;
      cdCanvas.style.left = currentCDPosition + "px";
    }
  };
  animate();
}
