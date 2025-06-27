const albumCanvas = document.getElementById('albumCanvas');
const albumCtx = albumCanvas.getContext('2d');
const cdCanvas = document.getElementById('cdCanvas');
const cdCtx = cdCanvas.getContext('2d');

//images
const albumImg = document.getElementById('albumImg');
const cdImg = document.getElementById('cdImg');
const nameImg = document.getElementById('nameImg');
const logoImg = document.getElementById('logoImg');

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