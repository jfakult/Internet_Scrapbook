// gui.js
import * as dat from 'dat.gui';

function initGUI(settings, updateNumberOfBones, updateWiggleMagnitude, toggleTexture, toggleBones, toggleCover, toggleBookOpen) {
  const gui = new dat.GUI();

  gui.add(settings, 'NUM_BONES', 1, 20, 1).onChange(updateNumberOfBones).name('Number of Bones');

  gui.add(settings, 'WIGGLE_MAGNITUDE', 0, 0.15, 0.005).onChange(updateWiggleMagnitude).name('Wiggle Magnitude');

  gui.add(settings, 'SHOW_TEXTURE').onChange(toggleTexture).name('Show Texture');

  gui.add(settings, 'SHOW_BONES').onChange(toggleBones).name('Show Bones');

  gui.add(settings, 'SHOW_COVER').onChange(toggleCover).name('Show Bones');

  gui.add(settings, 'BOOK_OPEN').onChange(toggleBookOpen).name('Book Open');

  // Instructions
  addInstructions();
}

function addInstructions() {
    const instructions = document.createElement('div');
    instructions.innerHTML = 'Use the mouse to move around!';
    instructions.style.position = 'absolute';
    instructions.style.top = '10px';
    instructions.style.left = '10px';
    instructions.style.color = 'white';
    document.body.appendChild(instructions);
}

export { initGUI };
