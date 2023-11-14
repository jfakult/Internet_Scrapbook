import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import PAPER_DATA from './paper_data.js';
import { initGUI } from './Gui.js';
import * as THREE from 'three';
import Paper from './Paper.js';
import Cover from './Cover.js';

const gui_settings = {
    NUM_PAGES: 4, // Default number of pages
    NUM_BONES: 12, // Default number of bones
    BOOK_DEPTH: 3, // Default wiggle magnitude
    SHOW_TEXTURE: true, // Default state for showing texture
    SHOW_BONES: false,
    SHOW_COVER: true,
    BOOK_OPEN: false,
};

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
//const camera = new THREE.OrthographicCamera( window.innerWidth / - 8, window.innerWidth / 8, window.innerHeight / 8, window.innerHeight / - 8, -100, 1000 );
const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

// The X axis is red
// The Y axis is green
// The Z axis is blue.
/*const axesHelperSize = 5; // This can be any number that fits your scene
const axesHelper = new THREE.AxesHelper(axesHelperSize);
scene.add(axesHelper);
*/

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
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
// Initialize the GUI
initGUI(gui_settings, updateNumberOfPages, updateNumberOfBones, updateBookDepth, toggleTexture, toggleBones, toggleCover, toggleBookOpen);

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
let papers = [];
const PAPER_WIDTH = 11.69;
const PAPER_HEIGHT = 16.54;
const COVER_THICKNESS = 0.3;
function init()
{
    cleanupScene()

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

    if (gui_settings.SHOW_COVER) {
        cover = new Cover(THREE, scene, coverOptions)
    }

    papers = []
    for (let i = 0; i < gui_settings.NUM_PAGES; i++) {
        let pageData = undefined;
        if (i in PAPER_DATA.pages) {
            pageData = PAPER_DATA.pages[i];
        }

        // 0 is the frontmost page (i.e page 1)
        const pagePosition = 1 - (i + 1) / (gui_settings.NUM_PAGES + 1)

        const paper = new Paper(THREE, scene, pagePosition, pageData, paperOptions)
        papers.push(paper)
    }

    if (camera.position.x == 0 && camera.position.y == 0 && camera.position.z == 0)
    {
        camera.position.set( 0, paperOptions.paperHeight / 2, paperOptions.paperHeight );
    }
}

function animate() {
	requestAnimationFrame( animate );

    controls.update();

    cover.update(gui_settings.BOOK_OPEN);
    
    papers.forEach(paper => paper.update(cover.openAmount))

	renderer.render( scene, camera );
}

init()
animate()