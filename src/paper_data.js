const PAPER_WIDTH = 11.69;
const PAPER_HEIGHT = 16.54;
const PAPER_SIZE_RATIO = PAPER_WIDTH / PAPER_HEIGHT;

/*
If only specifying one of width or height, the image dimensions will scale the image for you

To use height in terms of the paper width:
    height: val / PAPER_SIZE_RATIO
To use width in terms of the paper height:
    width: val * PAPER_SIZE_RATIO

Top and Left refer to the relative page position of the top left corner of the image
For text, TOP refers to the top and left refers to the center. Only height should be specified for text

The top level key corresponds to the PAPER number, not the page (i.e paper 1 has pages 1 and 2)

*/

const PAPER_DATA = {
    "sheets": {
        "1": [
            {
                "page_side": "front",
                "type": "image",
                "src": "images/screenshot.png",
                "height": 0.5,
                "top": 0.25,
                "left": 0.2 * PAPER_SIZE_RATIO,
                "give_camera_focus": true,
            },
            {
                "page_side": "front",
                "type": "text",
                "content": "Test Font",
                "font": "comic sans ms",
                "height": 0.05,
                "top": 0.75,
                "left": 0.5,
            },
            {
                "page_side": "back",
                "type": "image",
                "src": "images/screenshot.png",
                "width": 0.6,
                "height": 0.2,
                "top": 0.5 / PAPER_SIZE_RATIO,
                "left": 0.1,
            },
        ],
        "2": [{
            "page_side": "back",
            "type": "image",
            "src": "images/screenshot.png",
            "width": 0.3,
            "top": 0.5 / PAPER_SIZE_RATIO,
            "left": 0.5,
        },
        ],
        "3": [{
            "page_side": "front",
            "type": "image",
            "src": "images/screenshot.png",
            "width": 0.2,
            "top": 0.45 / PAPER_SIZE_RATIO,
            "left": 0.65,
        },
        ],
    }
}

export default PAPER_DATA;