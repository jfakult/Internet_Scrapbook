import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import Paper from './Paper.js';
import { initGUI } from './Gui.js';

const gui_settings = {
    NUM_BONES: 12, // Default number of bones
    WIGGLE_MAGNITUDE: 0.03, // Default wiggle magnitude
    SHOW_TEXTURE: true, // Default state for showing texture
    SHOW_BONES: false,
};

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

// The X axis is red
// The Y axis is green
// The Z axis is blue.
const axesHelperSize = 5; // This can be any number that fits your scene
const axesHelper = new THREE.AxesHelper(axesHelperSize);
scene.add(axesHelper);

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

// GUI INIT CODE
// Functions that the GUI will call
function updateNumberOfBones(value) {
    gui_settings.NUM_BONES = value;
    init()
}
function updateWiggleMagnitude(value) {
    gui_settings.WIGGLE_MAGNITUDE = value;
    init()
}
function toggleTexture(value) {
    gui_settings.SHOW_TEXTURE = value;
    init()
}
function toggleBones(value) {
    gui_settings.SHOW_BONES = value;
    init()
}
// Initialize the GUI
initGUI(gui_settings, updateNumberOfBones, updateWiggleMagnitude, toggleTexture, toggleBones);

function cleanupScene()
{
    papers = []
    while(scene.children.length > 0){
        let object = scene.children[0];
    
        if (object.geometry) {
            object.geometry.dispose();
        }
    
        if (object.material) {
            // If the material is an array, we loop through each element
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
    
        if (object.texture) {
            object.texture.dispose();
        }
    
        scene.remove(object);
    }
}

let papers = []
function init()
{
    cleanupScene()

    const paperOptions = {
        // A3 size (assuming units here are inches)
        paperWidth : 11.69,
        paperHeight : 16.54,
        NUM_BONES : gui_settings.NUM_BONES,
        WIGGLE_MAGNITUDE : gui_settings.WIGGLE_MAGNITUDE,
        SHOW_TEXTURE : gui_settings.SHOW_TEXTURE,
        SHOW_BONES : gui_settings.SHOW_BONES,
        textureFile : "images/paper.jpg"
    }



    const paper = new Paper(THREE, scene, paperOptions)

    papers.push(paper)

    camera.position.set( 0, paper.options.paperHeight / 2, paper.options.paperHeight );
}

function animate() {
	requestAnimationFrame( animate );

    controls.update();

    papers.forEach(paper => paper.update() )

	renderer.render( scene, camera );
}

init()
animate()