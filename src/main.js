import * as THREE from 'three';
import Paper from './Paper.js';
import Cover from './Cover.js';
import { easeInOutCubic, degToRad } from './Helpers.js';
//import { initGUI } from './Gui.js';
import PAPER_DATA from './paper_data.js';
import Interactions from './Interactions.js';
import StarScapeBackground from './StarScapeBackground.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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

const PRESENTATION_MODE = false;

const CAMERA_FOV = 65;

let animationStarted = false;
let loadInAnimation = true;
let loadAnimationStartTime;
const CAM_START_DISTANCE = 250;
const LOAD_IN_ANIMATION_TIME = PRESENTATION_MODE ? 22000 : 5000;
const FADE_IN_TIME = PRESENTATION_MODE ? 8000 : 3000;
const isDesktop = window.innerWidth > window.innerHeight

const splashText = document.getElementById("splashText").children[0];

if (!PRESENTATION_MODE) {
    splashText.setAttribute("style", "opacity: 1;")
    splashText.innerHTML = isDesktop ? "Arrow Keys<br/>to Interact" : "Swipe<br/>to Interact"
}

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.domElement.setAttribute("style", "transition: opacity " + (FADE_IN_TIME / 1000) + "s;")
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
let camera;

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
let background;
let renderQueue = [];
const PAPER_WIDTH = 11.69;
const PAPER_HEIGHT = 16.54;
const COVER_THICKNESS = 0.3;

// Zoom out a little more if the device is in portrait mode
const ZOOM_OUT_FACTOR = window.innerWidth > window.innerHeight ? 1.15 : 1.6;
// Given FOV and paper height, calculate camera distance with a small margin
let camDistance
function init()
{
    cleanupScene()

    background = new StarScapeBackground(THREE, scene);

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
        PAGE_TURN_SPEED: 0.0075,
        CAMERA_SPEED: 0.02,
    }

    camDistance = (ZOOM_OUT_FACTOR * paperOptions.paperHeight / 2) / Math.tan(degToRad(CAMERA_FOV) / 2);

    if (gui_settings.SHOW_COVER) {
        cover = new Cover(THREE, scene, coverOptions)
    }

    sheets = []
    for (let i = 0; i < gui_settings.NUM_PAGES; i++) {
        let pageData = [];
        if ((gui_settings.NUM_PAGES - i) in PAPER_DATA.sheets) {
            pageData = PAPER_DATA.sheets[gui_settings.NUM_PAGES - i];
        }

        // 0 is the frontmost page (i.e page 1)
        // Push pages on from back to front
        const pagePosition = 1 - (i + 1) / (gui_settings.NUM_PAGES + 1)

        const paper = new Paper(THREE, scene, gui_settings.NUM_PAGES - i, pagePosition, pageData, paperOptions)

        /*
        renderQueue.push([i, false])

        pageData.forEach((data, index) => {
            renderQueue.push([i, index + 1])
        })
        */

        sheets.push(paper)
    }

    camera = new THREE.PerspectiveCamera( CAMERA_FOV, window.innerWidth / window.innerHeight, 0.1, 10000 );
    if (gui_settings.ORTHOGRAPHIC_CAMERA && cameraChanged) {
        cameraChanged = false;
        camera = new THREE.OrthographicCamera( window.innerWidth / -16, window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / -16, -100, 1000 );
    }
    else if (cameraChanged) {
        camera = new THREE.PerspectiveCamera( CAMERA_FOV, window.innerWidth / window.innerHeight, 0.1, 10000 );
    }
    /*
    controls = new OrbitControls( camera, renderer.domElement );
    controls.dampingFactor = 0.1; // friction
    controls.rotateSpeed = 0.1; // mouse sensitivity
    controls.update();
    */

    if (camera.position.x == 0 && camera.position.y == 0 && camera.position.z == 0)
    {
        camera.position.set( 0, 0, camDistance + CAM_START_DISTANCE);
    }

    interactionManager = new Interactions(THREE, camera, camDistance, cover, sheets, interactionOptions);

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

function show_elem(index) {
    index = Math.floor(index)
    if (index < renderQueue.length) {
        const sheetIndex = renderQueue[index][0];
        const elemIndex = renderQueue[index][1];
        if (elemIndex)
        {
            //sheets[sheetIndex].paperElements[elemIndex - 1].mesh.visible = true;
        }
        else
        {
            sheets[sheetIndex].mesh.visible = true;
        }
    }
}

let animationLoadHandler = -1;
let starSpeed = 0.05;
let lastExtraDistance = CAM_START_DISTANCE;
let framesPerCull = 10;
function animate() {
    if (loadInAnimation)
    {
        if (animationStarted)
        {
            // Move camera from camDistance + CAM_START_DISTANCE to camDistance
            // Start moving fast and slow down as we get closer
            const timeSinceStart = Date.now() - loadAnimationStartTime;
            const fractionSinceStart = timeSinceStart / LOAD_IN_ANIMATION_TIME;
            const extraDistance = (1 - easeInOutCubic(fractionSinceStart)) * CAM_START_DISTANCE;
            camera.position.set( 0, 0, camDistance + extraDistance);

            const camSpeed = Math.abs(extraDistance - lastExtraDistance) / CAM_START_DISTANCE;
            lastExtraDistance = extraDistance;
            starSpeed = Math.pow(1 + camSpeed * 30, 8) - 1 + 0.1;

            if (animationLoadHandler < 0)
            {
                animationLoadHandler = setTimeout(() => {
                    loadInAnimation = false;
                    starSpeed = 0.05;
                    interactionManager.updateAll();
                }, LOAD_IN_ANIMATION_TIME);
            }
        }
    }
    else
    {
        interactionManager.update();
    }

    background.animateStars(starSpeed);

    renderer.render( scene, camera );

    requestAnimationFrame( animate );
}

init();

// Get the first render out of the way to precompile all shaders, load in textures, etc
interactionManager.updateAll();
renderer.render( scene, camera );

setTimeout(() => {
    // Then continue with the animation loop
    requestAnimationFrame( animate );

    renderer.domElement.classList.add("fade-in");
    setTimeout(() => {
        animationStarted = true;
        loadAnimationStartTime = Date.now() - 0;
    }, FADE_IN_TIME);

    splashText.setAttribute("style", "opacity: 0;");

    // Wait a little longer when not in presentation mode to wait for the splash text to fade out
}, PRESENTATION_MODE ? 1000 : 2500)