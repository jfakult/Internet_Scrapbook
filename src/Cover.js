import { easeInOutCubic } from './Helpers.js';

class Cover {
    constructor(THREE, scene, options) {
        this.THREE = THREE;
        this.scene = scene;
        this.options = options;

        this.geometryFront = new THREE.BoxGeometry(this.options.coverWidth, this.options.coverHeight, this.options.COVER_THICKNESS);
        this.geometryBack = new THREE.BoxGeometry(this.options.coverWidth, this.options.coverHeight, this.options.COVER_THICKNESS);
        this.geometrySpine = new THREE.BoxGeometry(this.options.COVER_THICKNESS - 0.01, this.options.coverHeight - 0.01, this.options.BOOK_DEPTH - 0.01); // Simple inelegant way to avoid z-fighting

        const loader = new THREE.TextureLoader();
        this.texture = loader.load(this.options.textureFile, function (tex) {
            // Scale to 50% and tile
            tex.wrapS = THREE.MirroredRepeatWrapping;
            tex.wrapT = THREE.MirroredRepeatWrapping;
            tex.repeat.set(2, 2);

            // Don't allow it's color to be affected by lights
            tex.colorSpace = THREE.SRGBColorSpace;
        });

        this.textureCover = loader.load("images/cover_front.png", function (tex) {
            tex.colorSpace = THREE.SRGBColorSpace;
        })

        let materialFront;
        let materialsFront;
        let materialBack;
        if (this.options.SHOW_TEXTURE) {
            //materialFront = new this.THREE.MeshStandardMaterial({ map: this.textureFront, side: this.THREE.DoubleSide });
            materialsFront = [ 
                new this.THREE.MeshStandardMaterial({ map: this.texture, side: this.THREE.DoubleSide, roughness: 0.65, metalness: 1 }),
                new this.THREE.MeshStandardMaterial({ map: this.texture, side: this.THREE.DoubleSide, roughness: 0.65, metalness: 1 }),
                new this.THREE.MeshStandardMaterial({ map: this.texture, side: this.THREE.DoubleSide, roughness: 0.65, metalness: 1 }),
                new this.THREE.MeshStandardMaterial({ map: this.texture, side: this.THREE.DoubleSide, roughness: 0.65, metalness: 1 }),
                new this.THREE.MeshBasicMaterial({ map: this.textureCover, side: this.THREE.DoubleSide, transparent: false }),
                new this.THREE.MeshStandardMaterial({ map: this.texture, side: this.THREE.DoubleSide, roughness: 0.65, metalness: 1 }),
            ]
            materialBack = new this.THREE.MeshStandardMaterial({ map: this.texture, side: this.THREE.DoubleSide, roughness: 0.65, metalness: 1 });
        }
        else {
            materialFront = new this.THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: this.THREE.DoubleSide, wireframe: true });
            materialBack = new this.THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: this.THREE.DoubleSide, wireframe: true });
        }

        materialsFront.forEach(material => {
            material.receiveShadow = true;
            material.castShadow = true;
        })
        materialBack.receiveShadow = true;
        materialBack.castShadow = true;

        this.meshFront = new this.THREE.Mesh(this.geometryFront, materialsFront);
        this.meshBack = new this.THREE.Mesh(this.geometryBack, materialBack);
        this.meshSpine = new this.THREE.Mesh(this.geometrySpine, materialBack);

        // Translate matrix on the z axis
        this.frontMatrix = new this.THREE.Matrix4();
        this.frontMatrix.makeTranslation(0, 0, this.options.BOOK_DEPTH / 2);
        this.backMatrix = new this.THREE.Matrix4();
        this.backMatrix.makeTranslation(0, 0, -this.options.BOOK_DEPTH / 2);
        this.spineMatrix = new this.THREE.Matrix4();
        this.spineMatrix.makeTranslation(-this.options.coverWidth / 2 + this.options.COVER_THICKNESS / 2, 0, 0);

        this.meshFront.matrixAutoUpdate = false;
        this.meshBack.matrixAutoUpdate = false;
        this.meshSpine.matrixAutoUpdate = false;

        // The back cover doesn't move. The front cover and spine movement will be handled in the update function
        this.meshFront.matrix = this.frontMatrix;
        this.meshBack.matrix = this.backMatrix;
        this.meshSpine.matrix = this.spineMatrix;

        //this.scene.add(this.meshFront);
        //this.scene.add(this.meshBack);
        //this.scene.add(this.meshSpine);

        this.openAmount = this.options.BOOK_OPEN ? 1 : 0;
        this.openSpeed = 0.005;

        if (options.SHOW_COVER) {
            this.scene.add(this.meshFront);
            this.scene.add(this.meshBack);
            this.scene.add(this.meshSpine);
        }
    }

    openSpine(amount) {
        const spineAngle = -(Math.PI / 2) * amount;
    
        // Create a matrix for translation to the pivot point
        const pivotMatrix = new this.THREE.Matrix4();
        pivotMatrix.makeTranslation(0, 0, -this.options.BOOK_DEPTH / 2);
    
        // Create a rotation matrix around the Y axis
        const rotationMatrix = new this.THREE.Matrix4();
        rotationMatrix.makeRotationY(spineAngle);
    
        // Create the inverse of the pivot matrix (for translating back)
        const inversePivotMatrix = pivotMatrix.clone().invert();
    
        // Combine the matrices and apply them to the mesh
        const transformationMatrix = this.spineMatrix.clone();
        transformationMatrix.multiplyMatrices(transformationMatrix, pivotMatrix); // Move to pivot
        transformationMatrix.multiplyMatrices(transformationMatrix, rotationMatrix); // Rotate
        transformationMatrix.multiplyMatrices(transformationMatrix, inversePivotMatrix); // Move back
    
        // Apply the transformation matrix to the mesh
        this.meshSpine.matrix = transformationMatrix;
        this.meshSpine.matrixAutoUpdate = false; // Prevent automatic matrix updates
    }

    openFront(amount) {
        const spineAngle = -(Math.PI / 2) * amount;
    
        // First translate to the front cover to the front (+z) center of the spine, then we rotate by spineAngle degrees
        // Then we translate to the back center of the spine, then rotate another spineAngle degrees
        const pivotMatrixCenter = new this.THREE.Matrix4();
        pivotMatrixCenter.makeTranslation(-this.options.coverWidth / 2 + this.options.COVER_THICKNESS / 2, 0, 0);

        // The back corner that the spine pivots around. The front will ultimately pivot around this point as well
        const pivotMatrixBack = new this.THREE.Matrix4();
        pivotMatrixBack.makeTranslation(-this.options.coverWidth / 2 + this.options.COVER_THICKNESS / 2, 0, -this.options.BOOK_DEPTH);
    
        // Create a rotation matrix around the Y axis for the cover
        const rotationMatrix = new this.THREE.Matrix4();
        rotationMatrix.makeRotationY(spineAngle);
    
        // Create the inverse of the pivot matrix (for translating back)
        const inversePivotMatrixCenter = pivotMatrixCenter.clone().invert();
        const inversePivotMatrixBack = pivotMatrixBack.clone().invert();
    
        // Combine the matrices and apply them to the mesh
        const transformationMatrix = this.frontMatrix.clone();
        transformationMatrix.multiplyMatrices(transformationMatrix, pivotMatrixBack); // Move to pivot
        transformationMatrix.multiplyMatrices(transformationMatrix, rotationMatrix); // Rotate
        transformationMatrix.multiplyMatrices(transformationMatrix, inversePivotMatrixBack); // Move back
        transformationMatrix.multiplyMatrices(transformationMatrix, pivotMatrixCenter); // Move to pivot
        transformationMatrix.multiplyMatrices(transformationMatrix, rotationMatrix); // Rotate
        transformationMatrix.multiplyMatrices(transformationMatrix, inversePivotMatrixCenter); // Move back
    
        // Apply the transformation matrix to the mesh
        this.meshFront.matrix = transformationMatrix;
        this.meshFront.matrixAutoUpdate = false; // Prevent automatic matrix updates
    }
    

    update(opening) {
        this.openAmount += this.openSpeed * (opening ? 1 : -1);
        this.openAmount = Math.min(Math.max(this.openAmount, 0), 1);

        this.openSpine(easeInOutCubic(this.openAmount));
        this.openFront(easeInOutCubic(this.openAmount));
    }
}

export default Cover;