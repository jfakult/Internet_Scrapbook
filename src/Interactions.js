import { easeInOutCubic } from './Helpers.js';

class Interactions {
    constructor(THREE, camera, cameraDistanceStart, cover, sheets, options) {
        this.THREE = THREE
        this.cover = cover
        this.sheets = sheets
        this.camera = camera
        this.options = options

        this.CAMERA_Z_START = cameraDistanceStart
        this.DYNAMIC_CAMERA = true;
        this.ZOOM_OUT = false;
        this.ZOOM_OUT_SPEED; // Defined in update
        this.ZOOM_OUT_SPEED_FACTOR = 1.01;

        this.bookOpen = false

        // Used for animating whereas openPosition is used for the actual position
        // -1 means cover is closed, 0 cover is open, 1 first page is open, etc.
        this.openPosition = -1
        this.openLastPosition = -1

        // Variable to keep track of whether the camera is focused on the left or right page
        this.leftPageFocus = false


        /*window.onwheel = (event) => {
            this.openPosition += event.deltaY
        }*/
        window.onkeydown = (event) => {
            if (event.key == "1") {
                this.DYNAMIC_CAMERA = !this.DYNAMIC_CAMERA
            }
            else if (event.key == "2") {
                this.ZOOM_OUT = !this.ZOOM_OUT
                // To prevent z clipping (aka flashing)
                this.sheets.forEach(paper => {
                    paper.mesh.visible = !this.ZOOM_OUT
                    paper.paperElements.forEach(element => element.mesh.visible = !this.ZOOM_OUT)
                })
            }
            else if (event.key == "ArrowLeft") {
                if (this.cover.openAmount > 0 && this.openPosition <= 0) {
                    this.bookOpen = false
                    this.openPosition = -1
                }
                if (this.leftPageFocus) {
                    this.openLastPosition = this.openPosition
                    this.openPosition = Math.max(this.openPosition - 1, -1)
                    this.leftPageFocus = false
                }
                else
                {
                    this.leftPageFocus = true
                }
            }
            else if (event.key == "ArrowRight") {
                if (this.cover.openAmount < 1) {
                    this.bookOpen = true
                }
                if (!this.bookOpen || !this.leftPageFocus) {
                    this.openLastPosition = this.openPosition
                    this.openPosition = Math.min(this.openPosition + 1, this.sheets.length)
                    this.leftPageFocus = true
                }
                else
                {
                    this.leftPageFocus = false
                }
            }
            if (this.openPosition <= 0)
            {
                this.leftPageFocus = false
            }
            else if (this.openPosition >= this.sheets.length)
            {
                this.leftPageFocus = true
            }
        }

        this.isSwiping = false
        this.swipeStartX = 0
        document.addEventListener('touchstart', (event) => {
            this.isSwiping = true
            this.swipeStartX = event.touches[0].clientX
        })
        document.addEventListener('touchmove', (event) => {
            if (this.isSwiping) {
                this.isSwiping = false;
                const swipeEndX = event.touches[0].clientX
                const swipeDirection = swipeEndX < this.swipeStartX ? "ArrowRight" : "ArrowLeft"

                window.onkeydown({key: swipeDirection})
            }
        })
        document.addEventListener('touchend', (event) => {
            this.isSwiping = false
        })
        document.addEventListener('mousedown', (event) => {
            this.isSwiping = true
            this.swipeStartX = event.clientX
        })
        document.addEventListener('mousemove', (event) => {
            if (this.isSwiping) {
                this.isSwiping = false;
                const swipeEndX = event.clientX
                const swipeDirection = swipeEndX < this.swipeStartX ? "ArrowRight" : "ArrowLeft"

                window.onkeydown({key: swipeDirection})
            }
        })
        document.addEventListener('mouseup', (event) => {
            this.isSwiping = false
        })
        document.addEventListener('wheel', (event) => {
            const isUp = event.deltaY < 0
            window.onkeydown({key: isUp ? "ArrowLeft" : "ArrowRight"})
        })
    }

    // Init the cover, all papers, and their respectively elements
    updateAll() {
        this.cover.update(0)
        // force update all papers
        this.sheets.forEach(paper => paper.update(0, true))
    }

    update()
    {
        this.cover.update(this.bookOpen);

        const cameraPositionFactor = -(this.leftPageFocus && this.DYNAMIC_CAMERA)
        // Move the camera to the left or right page depending on the openPosition
        const cameraTargetX = cameraPositionFactor * this.sheets[0].options.paperWidth
        this.camera.position.x += (cameraTargetX - this.camera.position.x) * this.options.CAMERA_SPEED

        if (this.ZOOM_OUT)
        {
            this.camera.position.z += this.ZOOM_OUT_SPEED
            this.ZOOM_OUT_SPEED *= this.ZOOM_OUT_SPEED_FACTOR
        }
        else
        {
            this.camera.position.z = this.CAMERA_Z_START
            this.ZOOM_OUT_SPEED = 0.01
        }

        //this.sheets.forEach(paper => paper.update(this.cover.openAmount))

        // Remember here that sheets[0] is the back sheet (i.e lowest pagePosition value)
        for (let i = this.sheets.length - 1; i >= 0; i--)
        {
            const paper = this.sheets[i]

            paper.setCurrentPagePosition(this.openPosition)

            const pageNum = this.sheets.length - i - 1

            if (this.openPosition > pageNum && paper.openAmount < 1)
            {
                // Paper is not fully opened yet
                paper.addOpenAmount(this.options.PAGE_TURN_SPEED)
            }
            else if (this.openPosition <= pageNum && paper.openAmount > 0)
            {
                paper.addOpenAmount(-this.options.PAGE_TURN_SPEED)
            }
            else {
                paper.update(this.cover.openAmount)
            }
        }
    }
}

export default Interactions;