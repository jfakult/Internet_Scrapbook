//import { Helpers } from './Helpers.js';

class Interactions {
    constructor(THREE, camera, cover, sheets, options) {
        this.THREE = THREE
        this.cover = cover
        this.sheets = sheets
        this.camera = camera
        this.options = options

        this.bookOpen = false

        // Used for animating whereas openPosition is used for the actual position
        this.openPosition = 0
        this.openLastPosition = 0


        /*window.onwheel = (event) => {
            this.openPosition += event.deltaY
        }*/
        window.onkeydown = (event) => {
            if (event.key == "ArrowLeft") {
                if (this.cover.openAmount > 0 && this.openPosition == 0) {
                    this.bookOpen = false
                    return
                }
                this.openLastPosition = this.openPosition
                this.openPosition = Math.max(this.openPosition - 1, 0)
            }
            else if (event.key == "ArrowRight") {
                if (this.cover.openAmount < 1) {
                    this.bookOpen = true
                    return
                }
                this.openLastPosition = this.openPosition
                this.openPosition = Math.min(this.openPosition + 1, this.sheets.length)
            }
        }
    }

    update()
    {
        this.cover.update(this.bookOpen);

        this.sheets.forEach(paper => paper.update(this.cover.openAmount))

        for (let i = 0; i < this.openPosition; i++)
        {
            const paper = this.sheets[this.sheets.length - i - 1]

            // Pages should be opening
            if (this.openPosition > this.openLastPosition)
            {
                // Paper is not fully opened yet
                if (paper.openAmount < 1)
                {
                    paper.addOpenAmount(this.options.PAGE_TURN_SPEED)
                }
            }
            else if (this.openPosition < this.openLastPosition)
            {
                // Paper is not fully closed yet
                if (paper.openAmount > 0)
                {
                    paper.addOpenAmount(-this.options.PAGE_TURN_SPEED)
                }
            }
        }
    }
}

export default Interactions;