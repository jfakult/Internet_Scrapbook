import { Helpers } from './Helpers.js';

class Cover {
    constructor(THREE, scene, options) {
        this.THREE = THREE;
        this.scene = scene;
        this.options = options;

        this.geometryFront = new THREE.BoxGeometry(this.options.coverWidth, this.options.coverHeight, this.options.COVER_THICKNESS);
        this.geometryBack = new THREE.BoxGeometry(this.options.coverWidth, this.options.coverHeight, this.options.COVER_THICKNESS);
        this.geometrySpine = new THREE.BoxGeometry(this.options.COVER_THICKNESS - 0.01, this.options.coverHeight - 0.01, this.options.BOOK_DEPTH - 0.01); // Simply inelegant way to avoid z-fighting

        const loader = new THREE.TextureLoader();
        this.textureFront = loader.load(this.options.textureFile, function (tex) {
            // Update texture settings after it has loaded
        });
        this.textureFront.wrapS = this.THREE.RepeatWrapping; // Enable wrapping for both horizontal and vertical directions
        this.textureFront.repeat.x = -1;
        this.textureBack = loader.load(this.options.textureFile, function (tex) {
        })

        let materialFront;
        let materialBack;
        if (this.options.SHOW_TEXTURE) {
            materialFront = new this.THREE.MeshBasicMaterial({ map: this.textureFront, side: this.THREE.DoubleSide });
            materialBack = new this.THREE.MeshBasicMaterial({ map: this.textureBack, side: this.THREE.DoubleSide });
        }
        else {
            materialFront = new this.THREE.MeshBasicMaterial({ color: 0xffffff, side: this.THREE.DoubleSide, wireframe: true });
            materialBack = new this.THREE.MeshBasicMaterial({ color: 0xffffff, side: this.THREE.DoubleSide, wireframe: true });
        }

        this.meshFront = new this.THREE.Mesh(this.geometryFront, materialFront);
        this.meshBack = new this.THREE.Mesh(this.geometryBack, materialBack);
        this.meshSpine = new this.THREE.Mesh(this.geometrySpine, materialFront);

        this.meshFront.position.z = this.options.BOOK_DEPTH / 2;
        this.meshBack.position.z = -this.options.BOOK_DEPTH / 2;
        this.meshSpine.position.x = -this.options.coverWidth / 2 + this.options.COVER_THICKNESS / 2;

        this.scene.add(this.meshFront);
        this.scene.add(this.meshBack);
        this.scene.add(this.meshSpine);

        this.openAmount = this.options.BOOK_OPEN ? 1 : 0;
        this.openSpeed = 0.01;
    }

    openSpine(amount) {
        const spineAngle = (Math.PI / 2) * amount;
        const relativePivotPosition = new this.THREE.Vector3(0, 0, -this.options.BOOK_DEPTH / 2 + this.options.COVER_THICKNESS / 2);
        // Move to the pivot, rotate, then move back the opposite
        this.meshSpine.position.add(relativePivotPosition);
        this.meshSpine.rotation.y = spineAngle;
        this.meshSpine.position.sub(relativePivotPosition);
    }

    update(opening) {
        this.openAmount += this.openSpeed * (opening ? 1 : -1);
        this.openAmount = Math.min(Math.max(this.openAmount, 0), 1);

        this.openSpine(this.openAmount);
    }
}

export default Cover;