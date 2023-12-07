//import { Helpers } from './Helpers.js';

class PaperElement {
    constructor(THREE, scene, data, paperWidth, paperHeight, skeleton, zTranslate, pageIndex) {
        this.THREE = THREE;
        this.scene = scene;
        this.data = data;
        this.paperWidth = paperWidth;
        this.paperHeight = paperHeight;
        this.skeleton = skeleton;
        this.zTranslate = zTranslate;
        this.pageSide = data.page_side;
        this.pageIndex = pageIndex;
        this.TEXT_LINE_SPACING = 1.2;

        // So that later images appear on top of earlier ones
        const zExtra = 0.03 * pageIndex;
        if (this.pageSide == "front")
        {
            // 0.1 for now. Might compute based on num pages and book depth later.
            // Probably fine to be even more, as long as page elements underneath the current page are not visible
            this.zTranslate += 0.1 - zExtra;
        }
        else
        {
            this.zTranslate -= 0.1 - zExtra;
        }

        this.texture = undefined;
        this.geometry = undefined;
        this.mesh = undefined;

        // Needs call backs in order to have the asynchronous texture load
        // More specifically, we need to grab the image ratio before we can initialize the geometry
        this.init(this.data);
    }

    init(data) {
        let width = data.width; // Between 0-1
        let height = data.height;
        if (!width && !height) {
            console.log("No width or height defined. Refusing to show the pape element", data)
            return;
        }

        let font = data.font;
        let textContent = data.content;
        let imageSrc = data.src;
        let imageRatio = 1
        let paperRatio = this.paperWidth / this.paperHeight;

        if (!textContent && !imageSrc) {
            console.log("No text value or image source defined. Refusing to show the paper element", data)
            return;
        }

        let left = data.left || 0;
        let top = data.top || 0;

        //const paperWidth1 = this.paperWidth;
        //const paperHeight1 = this.paperHeight;

        if (data.type == "image") {
            const loader = new this.THREE.TextureLoader();
            this.texture = loader.load(imageSrc, (tex) => {
                // Update texture settings after it has loaded
                imageRatio = tex.image.width / tex.image.height;

                if (!height) {
                    height = (width / imageRatio) * paperRatio;
                }
                else if (!width) {
                    width = (height * imageRatio) / paperRatio;
                }

                if ((width + left > 1 || height + top > 1) || (width < 0 || height < 0) || (left < 0 || top < 0) || (left > 1 || top > 1)) {
                    // I don't want to handle bone indexing off the page. Keeping all vertices in between bones makes things simple
                    console.log("Image dimensions are invalid are go off the page. Refusing to show the paper element", data);
                    return
                }

                // Move left and top to account for the width of the image
                // Left and top represent the location of the top left corner rather than the center of the image
                left = (left - 0.5) + width / 2;
                top = (top - 0.5) + height / 2;

                if (this.pageSide == "back") {
                    left *= -1;
                }

                //console.log(imageSrc, top, left, width, height);

                // Not sure why the top gets flipped. I probably did something weird somewhere
                this.initGeometry(tex, width, height, left, -top);
            });
        }
        else if (data.type == "text") {
            if (!height)
            {
                console.log("No height defined for text. Refusing to show the paper element", data)
                return
            }

            const textCanvas = document.createElement('canvas');
            // Higher quality means the text is rendered onta a larger canvas
            // 64 seems to be good enough
            const CANVAS_QUALITY = 256;
            textCanvas.height = CANVAS_QUALITY * textContent.split("\n").length * this.TEXT_LINE_SPACING;
            textCanvas.width = CANVAS_QUALITY * 64;
            const textCtx = textCanvas.getContext('2d');

            document.fonts.ready.then(() => {

                textCanvas.width = 0;
                textContent.split("\n").forEach(line => {
                    textCtx.font = `${CANVAS_QUALITY}px ${font}`;
                    const lineWidth = Math.ceil(textCtx.measureText(line).width);
                    if (lineWidth > textCanvas.width) {
                        textCanvas.width = lineWidth;
                    }
                })

                textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);

                textCtx.fillStyle = '#0a0000';
                textCtx.font = `${CANVAS_QUALITY}px ${font}`;
                textCtx.textAlign = "center";
                textCtx.textBaseline = "middle";

                if (this.pageSide == "back") {
                    // Apply transformations only for the 'back' page side
                    textCtx.save(); // Save the current context state
                    textCtx.translate(textCanvas.width, 0);
                    textCtx.scale(-1, 1);
                }
                
                // Rendering text is the same for both sides
                let lineIndex = 1;
                textContent.split("\n").forEach(line => {
                    textCtx.fillText(line, textCanvas.width / 2, textCanvas.height * (lineIndex / (textContent.split("\n").length + 1)));
                    lineIndex += 1;
                });

                // Convert total width to percentage of page width
                const textboxRatio = textCanvas.width / textCanvas.height;
                width = (height * textboxRatio) / paperRatio;
                height *= textContent.split("\n").length;
                left = (left - 0.5);
                top = -((top - 0.5) + height / 2);

                if (width / 2 + left > 0.5 || left - width / 2 < -0.5 || top + height / 2 > 0.5 || top - height / 2 < -0.5) {
                    // I don't want to handle bone indexing off the page. Keeping all vertices in between bones makes things simple
                    console.log("Text dimensions are invalid are go off the page. Refusing to show the paper element", data);
                    return
                }

                if (this.pageSide == "back") {
                    left *= -1;
                    textCtx.restore(); // Restore the context to its original state for the reversed text
                }

                this.texture = new this.THREE.CanvasTexture(textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height));
                this.texture.needsUpdate = true;

                this.initGeometry(this.texture, width, height, left, top);
            });
        }
        else {
            console.log("Invalid type. Refusing to show the paper element", data)
            return
        }
    }

    initGeometry(texture, width, height, left, top) {
        // Full size image has 24 bones, smaller images will have less
        // 24 for now because that is the default paper bones, and it seems good enough
        this.NUM_SEGMENTS = Math.ceil(18 * width);
        
        this.geometry = new this.THREE.PlaneGeometry(width * this.paperWidth, height * this.paperHeight, this.NUM_SEGMENTS, 1);
        this.geometry.translate(left * this.paperWidth, top * this.paperHeight, this.zTranslate);

        this.initSkinIndicesAndWeights(texture);
    }

    initSkinIndicesAndWeights(texture) {
        const skinIndices = [];
        const skinWeights = [];

        const position = this.geometry.attributes.position;
        for (let i = 0; i < position.count; i++) {
            const vertex = new this.THREE.Vector3();
            vertex.fromBufferAttribute(position, i);

            const x = vertex.x + this.paperWidth / 2;
            const boneIndex = (x / this.paperWidth) * this.skeleton.bones.length;

            let indices, weights;

            // Because the image vertices may be misaligned with the bones, we need to ensure weights are properly assigned
            // If the vertex lies exactly on the bone, things are simple
            if (boneIndex < 0 || boneIndex >= this.skeleton.bones.length) {
                console.log("Warning: this element goes outside of the page, mapping to edge bones", this.data);
                index = Math.min(Math.max(boneIndex, 0), this.skeleton.bones.length - 1);
                indices = new this.THREE.Vector4(index, 0, 0, 0);
                weights = new this.THREE.Vector4(1, 0, 0, 0);
            }
            else if (boneIndex == Math.floor(boneIndex)) {
                indices = new this.THREE.Vector4(boneIndex, 0, 0, 0);
                weights = new this.THREE.Vector4(1, 0, 0, 0);
            }
            // If it lies between two bones, assign proportional weight to each bone
            else {
                indices = new this.THREE.Vector4(Math.floor(boneIndex), Math.ceil(boneIndex), 0, 0);
                weights = new this.THREE.Vector4(Math.ceil(boneIndex) - boneIndex, boneIndex - Math.floor(boneIndex), 0, 0);
            }
            
            skinIndices.push(indices);
            skinWeights.push(weights);
        }

        let flattenedIndices = [].concat(...skinIndices.map(v => [v.x, v.y, v.z, v.w]));
        let flattenedWeights = [].concat(...skinWeights.map(v => [v.x, v.y, v.z, v.w]));
        
        this.geometry.setAttribute('skinIndex', new this.THREE.Uint16BufferAttribute(flattenedIndices, 4));
        this.geometry.setAttribute('skinWeight', new this.THREE.Float32BufferAttribute(flattenedWeights, 4));

        this.initMesh(texture);
    }

    initMesh(texture) {
        let material;
        if (true || this.options.SHOW_TEXTURE) {
            material = new this.THREE.MeshStandardMaterial({ map: texture, side: this.THREE.DoubleSide, transparent: this.data.type == "text" ? true : false });
        }
        else {
            material = new this.THREE.MeshBasicMaterial({ color: 0xaaffaa, side: this.THREE.DoubleSide, wireframe: true });
        }

        material.castShadow = true;
        material.receiveShadow = true;

        //const material = new this.THREE.MeshBasicMaterial({ map: texture, side: this.THREE.DoubleSide });
        this.mesh = new this.THREE.SkinnedMesh(this.geometry, material);

        this.mesh.bind(this.skeleton);

        this.scene.add(this.mesh);
    }

    // Basically just hides the mesh if it it doesn't need to be rendered
    update(pageOpenAmount, sheetNumber, currentSheetNumber) {
        if (this.mesh && this.mesh.visible != undefined) {
            const isFacingCamera = this.pageSide == "front" ? pageOpenAmount < 0.6 : pageOpenAmount > 0.4;
            if (isFacingCamera) {
                this.mesh.visible = true;
            }
            else {
                this.mesh.visible = false;
            }
        }
        /*
        currentSheetNumber = currentSheetNumber < 0 ? 0 : currentSheetNumber;

        if (this.mesh && this.mesh.visible != undefined) {
            const isPageTurning = this.pageSide == "front" ? pageOpenAmount > 0.2 : pageOpenAmount < 0.8;
            const isOnCurrentPage = this.pageSide == "front" ? Math.abs(sheetNumber - currentSheetNumber) <= 1 : sheetNumber == currentSheetNumber
            const isOnNeighborPage = this.pageSide == "front" ? Math.abs(sheetNumber - currentSheetNumber) <= 2 : Math.abs(sheetNumber - currentSheetNumber) <= 2;


            if (isOnCurrentPage) { // !isFacingCamera || 
                this.mesh.visible = true
            }
            else
            {
                if (isPageTurning && isOnNeighborPage) {
                    this.mesh.visible = true
                }
                else {
                    this.mesh.visible = false
                }
            }
        }
        */
    }
}

export default PaperElement;