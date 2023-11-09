import { Helpers } from './Helpers.js';

class Paper {
    constructor(THREE, scene, options) {
        this.THREE = THREE;
        this.scene = scene;

        this.options = options;
        this.geometry = new THREE.PlaneGeometry(this.options.paperWidth, this.options.paperHeight, this.options.NUM_BONES, 1);

        const loader = new THREE.TextureLoader();
        this.texture = loader.load(options.textureFile, function (tex) {
            // Update texture settings after it has loaded
            //tex.wrapS = tex.wrapT = this.THREE.RepeatWrapping; // Enable wrapping for both horizontal and vertical directions
            //tex.repeat.set(4, 4); // Repeat the texture 4 times in each direction
        });

        this.skeleton = this.buildSkeleton(this.options.NUM_BONES, this.options.paperWidth, this.options.SHOW_BONES);
        this.skinIndicesAndWeights = this.buildSkinIndicesAndWeights(this.geometry, this.options.paperWidth, this.options.NUM_BONES);
        this.mesh = this.buildMesh(this.geometry, this.skeleton, this.skinIndicesAndWeights["indices"], this.skinIndicesAndWeights["weights"]);

        this.scene.add(this.mesh);
    }

    buildSkeleton(num_bones, paperWidth, show_bones) {
        const bones = [];
        const boneWidth = paperWidth / num_bones;
        for (let i = 0; i < num_bones; i++) {
            let bone = new this.THREE.Bone();
            bone.position.x = -(paperWidth / 2) + boneWidth / 2;
            // Can be optimized?
            bones.push(bone);
            if (i > 0) {
                bone.position.x = boneWidth;
                bones[i - 1].add(bone);
            }

            if (show_bones) {
                // Add a sphere to visualize the bone
                const sphereGeometry = new this.THREE.SphereGeometry(0.1, 32, 32);
                const sphereMaterial = new this.THREE.MeshBasicMaterial({ color: 0x00ff00 });
                let sphere = new this.THREE.Mesh(sphereGeometry, sphereMaterial);
                sphere.name = "boneSphere" + i;
                this.scene.add(sphere);
            }
        }

        const skeleton = new this.THREE.Skeleton(bones);

        return skeleton
    }

    buildSkinIndicesAndWeights(geometry, paperWidth, num_bones) {
        const skinIndices = [];
        const skinWeights = [];

        const position = geometry.attributes.position;
        for (let i = 0; i < position.count; i++) {
            const vertex = new this.THREE.Vector3();
            vertex.fromBufferAttribute(position, i);

            const x = vertex.x + paperWidth / 2;
            const boneIndex = Math.floor((x / paperWidth) * num_bones);

            let indices, weights;

            // First and last bones have full influence over their corresponding vertices
            if (boneIndex == 0 || boneIndex == num_bones - 1) {
                indices = new this.THREE.Vector4(boneIndex, 0, 0, 0);
                weights = new this.THREE.Vector4(1, 0, 0, 0);
            }

            // Middle bones have influence over their corresponding vertices and the two adjacent vertices (to a lesser extent)
            else {
                indices = new this.THREE.Vector4(boneIndex, boneIndex - 1, 0);
                weights = new this.THREE.Vector4(0.5, 0.5, 0, 0);
            }

            /*
            // Normalize the weights, ensuring their sum equals 1
            let total = weights.x + weights.y + weights.z + weights.w;
            weights.x /= total;
            weights.y /= total;
            weights.z /= total;
            weights.w /= total;
            */
            skinIndices.push(indices);
            skinWeights.push(weights);
        }

        let flattenedIndices = [].concat(...skinIndices.map(v => [v.x, v.y, v.z, v.w]));
        let flattenedWeights = [].concat(...skinWeights.map(v => [v.x, v.y, v.z, v.w]));

        return { "indices": flattenedIndices, "weights": flattenedWeights };
    }

    buildMesh(geometry, skeleton, indices, weights) {
        let material;
        if (this.options.SHOW_TEXTURE) {
            material = new this.THREE.MeshBasicMaterial({ map: this.texture, side: this.THREE.DoubleSide });
        }
        else {
            material = new this.THREE.MeshBasicMaterial({ color: 0xffffff, side: this.THREE.DoubleSide, wireframe: true });
        }

        geometry.setAttribute('skinIndex', new this.THREE.Uint16BufferAttribute(indices, 4));
        geometry.setAttribute('skinWeight', new this.THREE.Float32BufferAttribute(weights, 4));

        const mesh = new this.THREE.SkinnedMesh(geometry, material);

        mesh.add(skeleton.bones[0]);
        mesh.bind(skeleton);

        return mesh
    }

    update() {
        let time = Date.now() * 0.001;

        // Iterate over each bone and apply the wiggle effect
        for (let i = 0; i < this.skeleton.bones.length; i++) {
            // Apply the rotation wiggle based on a sine wave
            let sineValue = (Math.sin(time) ** 2) * (i * this.options.WIGGLE_MAGNITUDE);

            this.skeleton.bones[i].rotation.y = -sineValue;
            this.skeleton.bones[i].rotation.x = sineValue * 0.1;

            if (this.options.SHOW_BONES) {
                // update boneSphere positions
                this.scene.getObjectByName("boneSphere" + i).position.setFromMatrixPosition(this.skeleton.bones[i].matrixWorld);
            }
        }
    }
}

export default Paper;