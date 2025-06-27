const albumCanvas = document.getElementById('albumCanvas');
const albumCtx = albumCanvas.getContext('2d');
const cdCanvas = document.getElementById('cdCanvas');
const cdCtx = cdCanvas.getContext('2d');

const albumImg = new Image();
const cdImg = new Image();
albumImg.src = 'images/fond_photo.png';
cdImg.src = 'images/taylorCD.png';

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