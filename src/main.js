import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import PAPER_DATA from './paper_data.js';
//import { initGUI } from './Gui.js';
import * as THREE from 'three';
import Paper from './Paper.js';
import Cover from './Cover.js';
import Interactions from './Interactions.js';

const gui_settings = {
    NUM_PAGES: 11, // Default number of pages
    NUM_BONES: 18, // Default number of bones
    BOOK_DEPTH: 3, // Default wiggle magnitude
    SHOW_TEXTURE: true, // Default state for showing texture
    SHOW_BONES: false,
    SHOW_COVER: true,
    BOOK_OPEN: false,
    ORTHOGRAPHIC_CAMERA: false,
};

const CAMERA_FOV = 45;

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( CAMERA_FOV, window.innerWidth / window.innerHeight, 0.1, 1000 );

//const camera = new THREE.OrthographicCamera( window.innerWidth / - 8, window.innerWidth / 8, window.innerHeight / 8, window.innerHeight / - 8, -100, 1000 );
/*
let controls = new OrbitControls( camera, renderer.domElement );
controls.dampingFactor = 0.1; // friction
controls.rotateSpeed = 0.1; // mouse sensitivity
controls.update();
*/


window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight);
}

// GUI INIT CODE
// Functions that the GUI will call
function updateNumberOfPages(value) {
    gui_settings.NUM_PAGES = value;
    init()
}
function updateNumberOfBones(value) {
    gui_settings.NUM_BONES = value;
    init()
}
function updateBookDepth(value) {
    gui_settings.BOOK_DEPTH = value;
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
function toggleCover(value) {
    gui_settings.SHOW_COVER = value;
    init()
}
function toggleBookOpen(value) {
    gui_settings.BOOK_OPEN = value;    
}
let cameraChanged = false;
function toggleORTHOGRAPHICCamera(value) {
    gui_settings.ORTHOGRAPHIC_CAMERA = value;
    cameraChanged = true;
    init()
}

// Initialize the GUI
//initGUI(gui_settings, updateNumberOfPages, updateNumberOfBones, updateBookDepth, toggleTexture, toggleBones, toggleCover, toggleBookOpen, toggleORTHOGRAPHICCamera);

function cleanupScene()
{
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

let cover;
let sheets = [];
let interactionManager;
const PAPER_WIDTH = 11.69;
const PAPER_HEIGHT = 16.54;
const COVER_THICKNESS = 0.3;
function init()
{
    cleanupScene()

    if (gui_settings.ORTHOGRAPHIC_CAMERA && cameraChanged) {
        cameraChanged = false;
        camera = new THREE.OrthographicCamera( window.innerWidth / -16, window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / -16, -100, 1000 );
    }
    else if (cameraChanged) {
        camera = new THREE.PerspectiveCamera( CAMERA_FOV, window.innerWidth / window.innerHeight, 0.1, 1000 );
    }
    /*
    controls = new OrbitControls( camera, renderer.domElement );
    controls.dampingFactor = 0.1; // friction
    controls.rotateSpeed = 0.1; // mouse sensitivity
    controls.update();
    */
    

    //gui_settings.BOOK_OPEN = false;

    const coverOptions = {
        // A3 size (assuming units here are inches)
        coverWidth : PAPER_WIDTH + COVER_THICKNESS * 2,
        coverHeight: PAPER_HEIGHT + COVER_THICKNESS * 2,
        BOOK_DEPTH: gui_settings.BOOK_DEPTH,
        COVER_THICKNESS: COVER_THICKNESS,
        SHOW_TEXTURE: gui_settings.SHOW_TEXTURE,
        BOOK_OPEN: gui_settings.BOOK_OPEN,
        SHOW_COVER: gui_settings.SHOW_COVER,
        textureFile : "images/cover.jpg"
    }

    const paperOptions = {
        // A3 size (assuming units here are inches)
        paperWidth : PAPER_WIDTH,
        paperHeight: PAPER_HEIGHT,
        NUM_BONES : gui_settings.NUM_BONES,
        WIGGLE_MAGNITUDE : gui_settings.WIGGLE_MAGNITUDE,
        BOOK_DEPTH : coverOptions.BOOK_DEPTH,
        COVER_THICKNESS: coverOptions.COVER_THICKNESS,
        SHOW_TEXTURE : gui_settings.SHOW_TEXTURE,
        SHOW_BONES : gui_settings.SHOW_BONES,
        textureFile: "images/paper.jpg",
    }

    const interactionOptions = {
        PAGE_TURN_SPEED: 0.01,
        CAMERA_SPEED: 0.02,
    }

    if (gui_settings.SHOW_COVER) {
        cover = new Cover(THREE, scene, coverOptions)
    }

    sheets = []
    for (let i = 0; i < gui_settings.NUM_PAGES; i++) {
        let pageData = undefined;
        if ((gui_settings.NUM_PAGES - i) in PAPER_DATA.sheets) {
            pageData = PAPER_DATA.sheets[gui_settings.NUM_PAGES - i];
        }

        // 0 is the frontmost page (i.e page 1)
        // Push pages on from back to front
        const pagePosition = 1 - (i + 1) / (gui_settings.NUM_PAGES + 1)

        const paper = new Paper(THREE, scene, gui_settings.NUM_PAGES - i, pagePosition, pageData, paperOptions)
        sheets.push(paper)
    }

    if (camera.position.x == 0 && camera.position.y == 0 && camera.position.z == 0)
    {
        // Zoom out a little more if the device is in portrait mode
        const zoomFactor = window.innerWidth > window.innerHeight ? 0.7 : 1.1;
        // Given FOV and paper height, calculate camera distance with a small margin
        const camDistance = paperOptions.paperHeight / Math.tan(CAMERA_FOV / 2) * zoomFactor;
        camera.position.set( 0, 0, camDistance);
    }

    interactionManager = new Interactions(THREE, camera, cover, sheets, interactionOptions);

    // Meh, this is a hacky way to make sure the book is in the right position
    setTimeout(() => {
        interactionManager.updateAll();
    }, 500)

    const color = 0xffffff
    const intensity = 1;
    const light1 = new THREE.DirectionalLight(color, intensity);
    light1.castShadow = true;
    light1.position.set(gui_settings.BOOK_DEPTH, 0, gui_settings.BOOK_DEPTH * 2);
    light1.target.position.set(0, 0, 0);
    const light2 = new THREE.DirectionalLight(color, intensity);
    light2.castShadow = true;
    light2.position.set(-gui_settings.BOOK_DEPTH, 0, gui_settings.BOOK_DEPTH * 2);
    light2.target.position.set(0, 0, 0);
    scene.add(light1);
    scene.add(light2);
}

function animate() {
	requestAnimationFrame( animate );

    //controls.update();

    interactionManager.update();

	renderer.render( scene, camera );
}

init()
animate()