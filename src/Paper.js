import PaperElement from './PaperElement.js';

class Paper {
    constructor(THREE, scene, pageNumber, pagePosition, paperElementData, options) {
        this.THREE = THREE;
        this.scene = scene;

        this.options = options;
        this.pageNumber = pageNumber;
        this.pagePosition = pagePosition; // value between 0-1 representing the pages position in the book
        this.currentPagePosition = 0
        this.geometry = new THREE.PlaneGeometry(this.options.paperWidth, this.options.paperHeight, this.options.NUM_BONES, 1);
        this.zTranslate = (this.options.BOOK_DEPTH - this.options.COVER_THICKNESS) * -(this.pagePosition - 0.5)
        this.geometry.translate(0, 0, this.zTranslate);
        this.rootPosition = undefined; // Initialize in buildSkeleton
        this.openAmount = 0;
        this.lastCoverOpenAmount = undefined;
        this.lastOpenAmount = undefined;
        // After the book is opened, remember the current rotation of the page
        this.coverOpenRotation = 0;

        const loader = new THREE.TextureLoader();
        this.texture = loader.load(options.textureFile, function (tex) {
            // Update texture settings after it has loaded
            //tex.wrapS = tex.wrapT = this.THREE.RepeatWrapping; // Enable wrapping for both horizontal and vertical directions
            //tex.repeat.set(4, 4); // Repeat the texture 4 times in each direction
            const scaleX = Math.random() * 0.1 + 0.9;
            const scaleY = Math.random() * 0.1 + 0.9;
            tex.repeat.set(scaleX, scaleY);
        });

        this.boneSpheres = [];

        this.skeleton = this.buildSkeleton(this.options.NUM_BONES, this.options.paperWidth, this.options.SHOW_BONES);
        this.skinIndicesAndWeights = this.buildPaperSkinIndicesAndWeights(this.geometry, this.options.paperWidth, this.options.NUM_BONES);
        this.mesh = this.buildMesh(this.geometry, this.skeleton, this.skinIndicesAndWeights["indices"], this.skinIndicesAndWeights["weights"]);

        this.scene.add(this.mesh)
        if (options.SHOW_BONES) {
            this.boneSpheres.forEach(sphere => this.scene.add(sphere))
        }

        // Add the images and text to the paper
        this.paperElementData = paperElementData;
        this.paperElements = []
        this.initPaperElements(this.paperElementData)
    }

    initPaperElements(paperElementData) {
        if (!paperElementData)
        {
            return;
        }

        let pageIndex = paperElementData.length
        paperElementData.forEach(element => {
            element.pageNumber = this.pageNumber;
            const paperElement = new PaperElement(this.THREE, this.scene, element, this.options.paperWidth, this.options.paperHeight, this.skeleton, this.zTranslate, pageIndex / paperElementData.length);
            this.paperElements.push(paperElement);
            pageIndex -= 1
        })
    }

    buildSkeleton(num_bones, paperWidth, show_bones) {
        const bones = [];
        const boneWidth = paperWidth / num_bones;
        for (let i = 0; i < num_bones; i++) {
            let bone = new this.THREE.Bone();
            bone.position.x = -(paperWidth / 2) + boneWidth / 2;

            if (i == 0)
            {
                bone.position.z = this.zTranslate; //(this.options.BOOK_DEPTH - this.options.COVER_THICKNESS) * (this.pagePosition - 0.5);
                this.rootPosition = bone.position.clone();
            }
            // Can be optimized?
            bones.push(bone);
            if (i > 0) {
                bone.position.x = boneWidth;
                bones[i - 1].add(bone);
            }

            if (show_bones) {
                // Add a sphere to visualize the bone
                const sphereGeometry = new this.THREE.SphereGeometry(0.1, 32, 32);
                const sphereMaterial = new this.THREE.MeshStandardMaterial({ color: 0x00ff00 });
                let sphere = new this.THREE.Mesh(sphereGeometry, sphereMaterial);
                sphere.name = "boneSphere" + i;
                this.boneSpheres.push(sphere);
            }
        }

        const skeleton = new this.THREE.Skeleton(bones);

        return skeleton
    }

    buildPaperSkinIndicesAndWeights(geometry, paperWidth, num_bones) {
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
            material = new this.THREE.MeshStandardMaterial({ map: this.texture, side: this.THREE.DoubleSide });
        }
        else {
            material = new this.THREE.MeshBasicMaterial({ color: 0xffaaaa, side: this.THREE.DoubleSide, wireframe: true });
        }

        material.castShadow = true;
        material.receiveShadow = true;

        geometry.setAttribute('skinIndex', new this.THREE.Uint16BufferAttribute(indices, 4));
        geometry.setAttribute('skinWeight', new this.THREE.Float32BufferAttribute(weights, 4));

        const mesh = new this.THREE.SkinnedMesh(geometry, material);

        mesh.add(skeleton.bones[0]);
        mesh.bind(skeleton);

        return mesh
    }

    // As the cover opens, the spine should rotate around the y axis
    // We need to move the paper to give the appearance that it is bound to the spine
    translateToSpine(bone, rootBoneRotation, amount) {
        const distanceToSpineZ = this.rootPosition.z + this.options.BOOK_DEPTH / 2;
        const distanceToSpineX = this.options.COVER_THICKNESS / 2;
        const distanceToRotationPoint = Math.sqrt(distanceToSpineZ * distanceToSpineZ + distanceToSpineX * distanceToSpineX);

        // X follows the circular path swept out by the spine (plus some extra space for the cover)
        let overX = -distanceToRotationPoint * Math.sin((Math.PI / 2) * amount);
        
        // Z goes from pagePosition to (0 + this.options.COVER_THICKNESS)
        let overZ = -distanceToRotationPoint * (1 - Math.cos((Math.PI / 2) * amount)) + (this.options.COVER_THICKNESS / 2) * amount;

        // Also need to add translation because each bone segment has a width
        const boneHalfWidth = (this.options.paperWidth / this.options.NUM_BONES) / 2 + 0.01;
        overX -= boneHalfWidth * (1 - Math.cos(rootBoneRotation)) * amount
        overZ += boneHalfWidth * Math.sin(rootBoneRotation) * amount

        bone.position.x = this.rootPosition.x + overX;
        bone.position.z = this.rootPosition.z + overZ;
    }

    // As the cover opens, pages will have to bend around each other to flatten out again
    // Here we rotate the root bone a certain amount (depending on page position)
    // The the next few bones (depending on amount) rotate back to flat
    rotateAroundOtherPages(skeleton, rootBoneRotation, amount) {
        // Flat when closed, rotated when open
        skeleton.bones[0].rotation.y = -rootBoneRotation * amount;

        // Now we will slightly bend them back until the remaining part of the paper is flat
        // Math is used here so that the pages bend back more quickly at first, then slow down as they approach flat, but their sum always leaves the paper perfectly flat
        const decayRate = 0.8;
        const n = skeleton.bones.length / 2; // Number of bones to apply rotation (excluding the first one)
        // Calculate the sum of the geometric series
        // We use this sum to normalize the inverted rotations to ensure the page ends up flat
        const sumOfSeries = (1 - Math.pow(decayRate, n)) / (1 - decayRate);

        // Rotate each subsequent bone back a little to flatten the paper
        // Apply the exponential decay and normalize to rootBoneRotation
        for (let i = 1; i <= n; i++)
        {
            const boneRotation = (Math.pow(decayRate, i - 1) / sumOfSeries) * rootBoneRotation;
            skeleton.bones[i].rotation.y = boneRotation * amount;
        }
    }

    addOpenAmount(amount) {
        this.openAmount += amount;
        if (this.openAmount > 1) {
            this.openAmount = 1;
        }
        else if (this.openAmount < 0) {
            this.openAmount = 0;
        }
        this.update(this.lastCoverOpenAmount, true)
    }

    setCurrentPagePosition(pagePosition) {
        this.currentPagePosition = pagePosition;
    }

    update(coverOpenAmount, forceUpdate = false) {
        if (forceUpdate || coverOpenAmount != this.lastCoverOpenAmount) {
            // Set the bounds for the rotation
            // Thin book will have papers less bent around each other
            // Cap the max at 90 degrees for now
            const minRotation = Math.PI / 64 * (this.options.BOOK_DEPTH / 5);
            const maxRotation = Math.min(Math.PI / 2 * (this.options.BOOK_DEPTH / 5), Math.PI / 2);
            const rootBoneRotation = minRotation + (1 - this.pagePosition) * (maxRotation - minRotation); // min degrees for back pages, max degrees for front pages
            // Inverse rotation is used for when the page flips open
            const inverseRootBoneRotation = minRotation + (this.pagePosition) * (maxRotation - minRotation);

            const finalRootRotation = rootBoneRotation * (1 - this.openAmount) - inverseRootBoneRotation * this.openAmount;

            this.translateToSpine(this.skeleton.bones[0], finalRootRotation, coverOpenAmount);
            this.rotateAroundOtherPages(this.skeleton, finalRootRotation, coverOpenAmount);

            this.coverOpenRotation = this.skeleton.bones[0].rotation.y;
        }

        if (forceUpdate || this.openAmount != this.lastOpenAmount) {
            // Paper opening
            this.skeleton.bones[0].rotation.y = this.coverOpenRotation - Math.PI * this.openAmount;

            if (this.options.SHOW_BONES) {
                for (let i = 0; i < this.boneSpheres.length; i++) {
                    this.boneSpheres[i].position.setFromMatrixPosition(this.skeleton.bones[i].matrixWorld);
                }
            }

            //console.log(0)
            this.paperElements.forEach(element => {
                element.update(this.openAmount, this.pageNumber, this.currentPagePosition);
            })
        }

        this.lastOpenAmount = this.openAmount
        this.lastCoverOpenAmount = coverOpenAmount;
    }
}

export default Paper;