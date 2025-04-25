const images = ["../images/ad1.png","../images/ad2.png"];
const idx = { left: 0, right: 0 };

function updateImage(side) {
  const img = document.getElementById(`img-${side}`);
  img.style.opacity = 0;
  setTimeout(()=>{
    img.src = images[idx[side]];
    img.style.opacity = 1;
  },150);
}

function displayNextImage(side) {
  idx[side] = (idx[side]+1) % images.length;
  updateImage(side);
}

function displayPreviousImage(side) {
  idx[side] = (idx[side]-1 + images.length) % images.length;
  updateImage(side);
}

function startAds() {
  ["left","right"].forEach(side => updateImage(side));
  setInterval(()=> displayNextImage("left"), 3000);
  setInterval(()=> displayNextImage("right"),3000);
}

window.addEventListener("DOMContentLoaded", startAds);
