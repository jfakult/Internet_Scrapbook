//import { Helpers } from './Helpers.js';

class PaperElement {
    constructor(THREE, scene, data, paperWidth, paperHeight, skeleton, zTranslate) {
        this.THREE = THREE;
        this.scene = scene;
        this.data = data;
        this.paperWidth = paperWidth;
        this.paperHeight = paperHeight;
        this.skeleton = skeleton;
        this.zTranslate = zTranslate;
        this.pageSide = data.page_side;

        // Full size image has 12 bones, smaller images will have less
        // 12 for now because that is the default paper bones, and it seems good enough
        this.NUM_SEGMENTS = Math.ceil(12 * this.data.width)

        if (this.pageSide == "front")
        {
            // 0.1 for now. Might compute based on num pages and book depth later.
            // Probably fine to be even more, as long as page elements underneath the current page are not visible
            this.zTranslate += 0.1;
        }
        else
        {
            this.zTranslate -= 0.1;
        }

        this.texture = undefined;
        this.geometry = undefined;
        this.mesh = 1;

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

        let fontSize = data.fontSize;
        let textValue = data.value;
        let imageSrc = data.src;
        let imageRatio = 1
        let paperRatio = this.paperWidth / this.paperHeight;

        if (!textValue && !imageSrc) {
            console.log("No text value or image source defined. Refusing to show the paper element", data)
            return;
        }

        let left = data.left || 0;
        let top = data.top || 0;

        //const paperWidth1 = this.paperWidth;
        //const paperHeight1 = this.paperHeight;

        if (data.type == "image")
        {
            const loader = new this.THREE.TextureLoader();
            this.texture = loader.load(imageSrc, (tex) => {
                // Update texture settings after it has loaded
                imageRatio = tex.image.width / tex.image.height;

                if (!height)
                {
                    height = (width / imageRatio) * paperRatio;
                }
                else if (!width)
                {
                    width = (height * imageRatio) / paperRatio;
                }

                if ((width + left > 1 || height + top > 1) || (width < 0 || height < 0) || (left < 0 || top < 0) || (left > 1 || top > 1))
                {
                    // I don't want to handle bone indexing off the page. Keeping all vertices in between bones makes things simple
                    console.log("Image dimensions are invalid are go off the page. Refusing to show the paper element", data);
                    return
                }

                // Move left and top to account for the width of the image
                // Left and top represent the location of the top left corner rather than the center of the image
                left = (left - 0.5) + width / 2;
                top = (top - 0.5) + height / 2;

                if (this.pageSide == "back")
                {
                    left *= -1;
                }

                this.initGeometry(tex, width, height, left, top);
            });
        }
    }

    initGeometry(texture, width, height, left, top) {
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
            if (boneIndex == Math.floor(boneIndex)) {
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
        /*let material;
        if (this.options.SHOW_TEXTURE) {
            material = new this.THREE.MeshBasicMaterial({ map: this.texture, side: this.THREE.DoubleSide });
        }
        else {
            material = new this.THREE.MeshBasicMaterial({ color: 0xffaaaa, side: this.THREE.DoubleSide, wireframe: true });
        }*/

        const material = new this.THREE.MeshBasicMaterial({ map: texture, side: this.THREE.DoubleSide });
        this.mesh = new this.THREE.SkinnedMesh(this.geometry, material);

        this.mesh.bind(this.skeleton);

        this.scene.add(this.mesh);
    }

    update(coverOpenAmount, isFocused) {

    }
}

export default PaperElement;