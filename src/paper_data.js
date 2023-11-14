const PAPER_WIDTH = 11.69;
const PAPER_HEIGHT = 16.54;
const PAPER_SIZE_RATIO = PAPER_WIDTH / PAPER_HEIGHT;

/*
If only specifying one of width or height, the image dimensions will scale the image for you

To use height in terms of the paper width:
    height: val / PAPER_SIZE_RATIO
To use width in terms of the paper height:
    width: val * PAPER_SIZE_RATIO
*/

const PAPER_DATA = {
    "pages": {
        "1": [{
            "page_number": 1,
            "type": "image",
            "src": "images/screenshot.png",
            "width": 0.5,
            "top": 0.25 / PAPER_SIZE_RATIO,
            "left": 0.25,
        },
        ],
        /*"2": [{
            "page_number": 2,
            "type": "image",
            "src": "images/screenshot.png",
            "width": 0.3,
            "top": 0.5 / PAPER_SIZE_RATIO,
            "left": 0.55,
        },
        ],
        "3": [{
            "page_number": 3,
            "type": "image",
            "src": "images/screenshot.png",
            "width": 0.2,
            "top": 0.45 / PAPER_SIZE_RATIO,
            "left": 0.65,
        },
        ],*/
    }
}

export default PAPER_DATA;