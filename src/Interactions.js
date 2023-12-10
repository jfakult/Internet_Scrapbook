import { easeInOutCubic } from './Helpers.js';

class Interactions {
    constructor(THREE, camera, cameraDistanceStart, cover, sheets, options) {
        this.THREE = THREE
        this.cover = cover
        this.sheets = sheets
        this.camera = camera
        this.options = options

        this.isDesktop = window.innerWidth > window.innerHeight

        this.CAMERA_Z_START = cameraDistanceStart
        this.DYNAMIC_CAMERA = true;
        this.ZOOM_OUT = false;
        this.ZOOM_OUT_SPEED; // Defined in update
        this.ZOOM_OUT_SPEED_FACTOR = 1.01;

        this.bookOpen = false
        this.centerOnBook = false

        // Used for animating whereas openPosition is used for the actual position
        // -1 means cover is closed, 0 cover is open, 1 first page is open, etc.
        this.openPosition = -1
        this.openLastPosition = -1

        // Variable to keep track of whether the camera is focused on the left or right page
        this.leftPageFocus = false


        /*window.onwheel = (event) => {
            this.openPosition += event.deltaY
        }*/
        document.getElementById("audio").volume = 0
        window.onkeydown = (event) => {
            // Allow the camera to slide back and forth to look at different pages
            if (event.key == "1") {
                this.DYNAMIC_CAMERA = !this.DYNAMIC_CAMERA
            }
            else if (event.key == "2") {
                this.centerOnBook = !this.centerOnBook
            }
            // Fade out effect (i.e zoom out)
            else if (event.key == "3") {
                this.ZOOM_OUT = !this.ZOOM_OUT
                // To prevent z clipping (aka flashing)
                this.sheets.forEach(paper => {
                    paper.mesh.visible = !this.ZOOM_OUT
                    paper.paperElements.forEach(element => {
                        element.mesh.visible = !this.ZOOM_OUT
                        element.shadowMesh.visible = !this.ZOOM_OUT
                    })
                })
            }
            else if (event.key == "4") {
                const audio = document.getElementById("audio")
                audio.play()
                
                audio.volume = 1 - audio.volume
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
                    this.openPosition = 0
                    // Wait for the book to be all the way open
                    // Don't have time to fix a bug where pages and cover open at the same time
                    return
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

            if (!this.ZOOM_OUT)
            {
                // Use user input as a trigger to cull in order to avoid culling when no updates are happening
                this.hideUnnecessary()
            }
        }

        console.log("1 = toggle dynamic camera")
        console.log("2 = toggle center on book")
        console.log("3 = toggle zoom out")
        console.log("4 = toggle audio")

        this.isSwiping = false
        this.swipeStartX = 0
        document.addEventListener('touchstart', (event) => {
            this.isSwiping = true
            this.swipeStartX = event.touches[0].clientX

            // Don't confuse swipes with pinches
            if (event.touches.length > 1)
            {
                this.isSwiping = false
            }
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

    hideUnnecessary() {
        for (let sheetIndex = 0; sheetIndex < this.sheets.length; sheetIndex++)
        {
            const sheetIndexReversed = this.sheets.length - sheetIndex - 1
            // If the sheet is far enough from our current page (and it is not opening currently) hide it
            // Well... Keep the sheet, just hide it's elements (so that the book still appears full)
            if  (Math.abs(sheetIndexReversed - this.openPosition) > 2 &&
                (this.sheets[sheetIndex].openAmount < 0.01 || this.sheets[sheetIndex].openAmount > 0.99))
            {
                this.sheets[sheetIndex].paperElements.forEach(element => element.mesh.visible = false)
            }
            else
            {
                this.sheets[sheetIndex].paperElements.forEach(element => element.mesh.visible = true)
            
            }
        }
    }

    update()
    {
        this.cover.update(this.bookOpen);

        let cameraPositionFactor = -(this.leftPageFocus && this.DYNAMIC_CAMERA)
        if (!this.isDesktop)
        {
            if (this.bookOpen)
            {
                cameraPositionFactor -= 0.1
            }
        }
        // Move the camera to the left or right page depending on the openPosition
        let cameraTargetX = cameraPositionFactor * this.sheets[0].options.paperWidth

        // Only center if dynamic camera is enabled. Thus we can override to move to the right still
        if (this.centerOnBook && this.DYNAMIC_CAMERA)
        {
                cameraTargetX = -(this.sheets[0].options.paperWidth / 2 + this.cover.options.BOOK_DEPTH / 2)
        }
        
        //this.camera.position.x += Math.pow(Math.pow(cameraTargetX - this.camera.position.x, 2), 0.5) * this.options.CAMERA_SPEED
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