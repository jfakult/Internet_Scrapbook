import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// A3 size (assuming units here are inches)
const paperWidth = 11.69
const paperHeight = 16.54
const NUM_BONES = 12
const WIGGLE_MAGNITUDE = 0.01; // Increase the magnitude for each subsequent bone

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 0, 20, 100 );
controls.update();

// The X axis is red
// The Y axis is green
// The Z axis is blue.
const axesHelperSize = 5; // This can be any number that fits your scene
const axesHelper = new THREE.AxesHelper(axesHelperSize);
scene.add(axesHelper);

camera.position.z = 5;

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

let bones
let skeleton
function init()
{
    const geometry = new THREE.PlaneGeometry( paperWidth, paperHeight, NUM_BONES, 1 );

    const loader = new THREE.TextureLoader();
    const texture = loader.load('images/paper.jpg', function(tex) {
        // Update texture settings after it has loaded
        //tex.wrapS = tex.wrapT = THREE.RepeatWrapping; // Enable wrapping for both horizontal and vertical directions
        //tex.repeat.set(4, 4); // Repeat the texture 4 times in each direction
    });

    bones = [];
    const boneWidth = paperWidth / NUM_BONES

    for (let i = 0; i < NUM_BONES; i++)
    {
        let boneX = (i * boneWidth) + (boneWidth / 2) - (paperWidth / 2);

        let bone = new THREE.Bone();
        bone.position.x = -(paperWidth / 2) + boneWidth / 2
        // Can be optimized?
        bones.push(bone)
        if (i > 0)
        {
            bone.position.x = boneWidth//boneX
            bones[i-1].add(bone)
        }
    }

    const skinIndices = [];
    const skinWeights = [];

    const position = geometry.attributes.position;
    for ( let i = 0; i < position.count; i++ )
    {
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute( position, i );

        const x = vertex.x + paperWidth / 2
        const boneIndex = Math.floor((x / paperWidth) * NUM_BONES);

        let indices, weights

        // First and last bones have full influence over their corresponding vertices
        if (boneIndex == 0 || boneIndex == NUM_BONES - 1)
        {
            indices = new THREE.Vector4(boneIndex, 0, 0, 0)
            weights = new THREE.Vector4(1, 0, 0, 0)
        }
        // Middle bones have influence over their corresponding vertices and the two adjacent vertices (to a lesser extent)
        else
        {
            indices = new THREE.Vector4(boneIndex, boneIndex - 1, 0)
            weights = new THREE.Vector4(0.5, 0.5, 0, 0)
        }

        /*
        // Normalize the weights, ensuring their sum equals 1
        let total = weights.x + weights.y + weights.z + weights.w;
        weights.x /= total;
        weights.y /= total;
        weights.z /= total;
        weights.w /= total;
        */

        skinIndices.push(indices)
        skinWeights.push(weights)
    }

    let flattenedIndices = [].concat(...skinIndices.map(v => [v.x, v.y, v.z, v.w]));
    let flattenedWeights = [].concat(...skinWeights.map(v => [v.x, v.y, v.z, v.w]));

    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(new Uint16Array(flattenedIndices), 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(new Float32Array(flattenedWeights), 4));

    //const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, wireframe: true });
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide});
    skeleton = new THREE.Skeleton(bones);
    const mesh = new THREE.SkinnedMesh( geometry, material );

    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);

    scene.add(mesh)
}

function animate() {
	requestAnimationFrame( animate );

    controls.update();

    wiggle()

	renderer.render( scene, camera );
}

function wiggle()
{
    // Get the elapsed time
  let time = Date.now() * 0.001;

  // Iterate over each bone and apply the wiggle effect
  for (let i = 0; i < bones.length; i++)
  {
    // Calculate the wiggle magnitude
    
    // Apply the rotation wiggle based on a sine wave
    let sineValue = (Math.sin(time)**2) * (i * WIGGLE_MAGNITUDE);
    
    bones[i].rotation.y = -sineValue;
    bones[i].rotation.x = sineValue * 0.1;
  }
}

init()
animate()