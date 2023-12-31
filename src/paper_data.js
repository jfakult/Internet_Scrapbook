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

/*

Resources used for aging and face swapping photos:
https://www.faceswapper.app/
or
https://faceswapper.ai/swapper-old
   (Supposedly works but very slowly): https://webit.ai/portal/apps/faceswap

https://boredhumans.com/age-progression.php

Split gif into frames:  
https://ezgif.com/split/ezgif-4-64badc6cef.gif

*/

const PAPER_DATA = {
    "sheets": {
        1: [
            //  One image with two text boxes
            {
                "page_side": "front",
                "type": "text",
                "content": "Silicon\nSentiments",
                "font": "comic sans ms",
                "height": 0.075,
                "top": 0.05,
                "left": 0.5,
            },
            {
                "page_side": "front",
                "type": "text",
                "content": "Memories of\nArt and Mac\nJan 1960 - June 2010",
                "font": "comic sans ms",
                "height": 0.025,
                "top": 0.25,
                "left": 0.5,
            },
            {
                "page_side": "front",
                "type": "image",
                "src": "images/page_images/1960_crib_bell_phone.jpeg",
                "width": 0.8,
                "top": 0.95 - (0.8 * PAPER_SIZE_RATIO),
                "left": 0.1,
                "give_camera_focus": true, /* Feature not implemented */
            },
            // Two offset images with one text box below
            {
                "page_side": "back",
                "type": "image",
                "src": "images/page_images/1960_bell_telephone_mother.jpeg",
                "width": 0.75,
                "top": 0.05,
                "left": 0.1,
                "give_camera_focus": true, /* Feature not implemented */
            },
            {
                "page_side": "back",
                "type": "image",
                "src": "images/page_images/1960_bell_telephone_father.jpeg",
                "width": 0.55,
                "top": 0.8 * PAPER_SIZE_RATIO,
                "left": 0.35,
            },
            {
                "page_side": "back",
                "type": "text",
                "content": "Baby Art and\nMac With Mom\nand Dad :)\n     - Mar 1960",
                "font": "comic sans ms",
                "height": 0.022,
                "top": 0.65,
                "left": 0.2,
            },
        ],
        2: [
        // One image with one text box below
        {
            "page_side": "front",
            "type": "image",
            "src": "images/page_images/1961_ibm_system_360.jpeg",
            "width": 0.8,
            "top": 0.15,
            "left": 0.1,
        },
        {
            "page_side": "front",
            "type": "text",
            "content": "Mac plays with IBM System/360\n                   - April 1961",
            "font": "comic sans ms",
            "height": 0.03,
            "top": 0.80 * PAPER_SIZE_RATIO + 0.2,
            "left": 0.5,
        },
        // Two images with two text boxes below. Offset with text on the sides
        {
            "page_side": "back",
            "type": "image",
            "src": "images/page_images/1964_mainframe_work.jpeg",
            "width": 0.55,
            "top": 0.05,
            "left": 0.33,
        },
        {
            "page_side": "back",
            "type": "text",
            "content": "Mac & Art\n   Playing\n         - May 1964",
            "font": "comic sans ms",
            "height": 0.023,
            "top": 0.25 * PAPER_SIZE_RATIO,
            "left": 0.19,
        },
        {
            "page_side": "back",
            "type": "image",
            "src": "images/page_images/1968_mainframe_programming.jpeg",
            "width": 0.6,
            "top": 0.6 * PAPER_SIZE_RATIO,
            "left": 0.1,
        },
        {
            "page_side": "back",
            "type": "text",
            "content": "Mac Programming Art\nArt May Become a Global Phenomenon!\n               - Sep 1968",
            "font": "comic sans ms",
            "height": 0.025,
            "top": 0.87,
            "left": 0.4,
        },
        ],
        3: [
            // Two images with one text box below
            {
                "page_side": "front",
                "type": "image",
                "src": "images/page_images/1967_ethernet_tangle_2.jpeg",
                "width": 0.6,
                "top": 0.05,
                "left": 0.1,
            },
            {
                "page_side": "front",
                "type": "image",
                "src": "images/page_images/1971_ethernet_tangle_3.jpeg",
                "width": 0.6,
                "top": 0.6 * PAPER_SIZE_RATIO,
                "left": 0.2,
            },
            {
                "page_side": "front",
                "type": "text",
                "content": "Mac and Art Getting\nWrapped up in Their Development!\n                  - Nov 1968",
                "font": "comic sans ms",
                "height": 0.022,
                "top": 0.87,
                "left": 0.5,
            },
            // Two images with two text boxes below. Offset with text on the sides
            {
                "page_side": "back",
                "type": "image",
                "src": "images/page_images_modified/1971_first_email.jpg",
                "width": 0.5,
                "top": 0.05,
                "left": 0.375,
            },
            {
                "page_side": "back",
                "type": "text",
                "content": "Art Shows Mac\nThe First Ever Email!\n             - Dec 1971",
                "font": "comic sans ms",
                "height": 0.02,
                "top": 0.13,
                "left": 0.21,
            },
            {
                "page_side": "back",
                "type": "image",
                "src": "images/page_images_modified/1972_cabling_mainframes.jpg",
                "width": 0.6,
                "top": 0.6 * PAPER_SIZE_RATIO,
                "left": 0.1,
            },
            {
                "page_side": "back",
                "type": "text",
                "content": "Mac helping Art Get Dressed\n               - Mar 1972",
                "font": "comic sans ms",
                "height": 0.022,
                "top": 0.875,
                "left": 0.4,
            },
        ],
        4: [
            // Two images with two text boxes below. Offset with text on the sides
            {
                "page_side": "front",
                "type": "image",
                "src": "images/page_images_modified/1973_roller_coaster_2.jpg",
                "width": 0.6,
                "top": 0.05,
                "left": 0.05,
            },
            {
                "page_side": "front",
                "type": "text",
                "content": "Mac and Art\nReach New Heights!\nAnd Art Goes Global!\n         - Aug 1973",
                "font": "comic sans ms",
                "height": 0.019,
                "top": 0.15,
                "left": 0.81,
            },
            {
                "page_side": "front",
                "type": "image",
                "src": "images/page_images/1974_xerox_alto_swing_1.jpeg",
                "width": 0.6,
                "top": 0.6 * PAPER_SIZE_RATIO,
                "left": 0.3,
            },
            {
                "page_side": "front",
                "type": "text",
                "content": "Dad swinging the boys\n               - Aug 1974",
                "font": "comic sans ms",
                "height": 0.025,
                "top": 0.87,
                "left": 0.55,
            },
            // Two images with two text boxes below. Offset with text on the sides
            {
                "page_side": "back",
                "type": "image",
                "src": "images/page_images/1974_xerox_happy_tradeshow.jpeg",
                "width": 0.55,
                "top": 0.05,
                "left": 0.35,
            },
            {
                "page_side": "back",
                "type": "text",
                "content": "The Boys Showing Off\nWith Xerox Alto At\nTheir First Tradeshow\n                 - Nov 1974",
                "font": "comic sans ms",
                "height": 0.0175,
                "top": 0.2,
                "left": 0.19,
            },
            {
                "page_side": "back",
                "type": "image",
                "src": "images/page_images_modified/1975_ethernet_adapters.jpg",
                "width": 0.525,
                "top": 0.75 * PAPER_SIZE_RATIO,
                "left": 0.1,
            },
            {
                "page_side": "back",
                "type": "text",
                "content": "Art and Mac\nBuildingthe first\nEthernet Adapters\n                  - Feb 1975",
                "font": "comic sans ms",
                "height": 0.02,
                "top": 0.6,
                "left": 0.775,
            },
        ],
        5: [
            // One image with one text box below
            {
                "page_side": "front",
                "type": "image",
                "src": "images/page_images/1975_pose_with_mickey.jpeg",
                "width": 0.85,
                "top": 0.1,
                "left": 0.075,
            },
            {
                "page_side": "front",
                "type": "text",
                "content": "It's Mac, Mick, and Steve!\nWith Altair 9000!\n                  - May 1975",
                "font": "comic sans ms",
                "height": 0.03,
                "top": 0.8 * PAPER_SIZE_RATIO + 0.2,
                "left": 0.5,
            },
            // Two images with one text box below
            {
                "page_side": "back",
                "type": "image",
                "src": "images/page_images_modified/1976_ethernet_tightrope_2.jpg",
                "width": 0.5,
                "top": 0.05,
                "left": 0.1,
            },
            {
                "page_side": "back",
                "type": "image",
                "src": "images/page_images_modified/1977_ethernet_tightrope.jpeg",
                "width": 0.62,
                "top": 0.55 * PAPER_SIZE_RATIO,
                "left": 0.2,
            },
            {
                "page_side": "back",
                "type": "text",
                "content": "What are these kids up to?!\nNew Ethernet Technology is Fun!\n               - June 1976",
                "font": "comic sans ms",
                "height": 0.022,
                "top": 0.87,
                "left": 0.45,
            },
        ],
        6: [
            // One image with one text box below
            {
                "page_side": "front",
                "type": "image",
                "src": "images/page_images/1978_dec_roller_coaster.jpeg",
                "width": 0.8,
                "top": 0.1,
                "left": 0.1,
            },
            {
                "page_side": "front",
                "type": "text",
                "content": "Mac and Art Introduce The\nMost Successful Mini-Computer\n(DEC VT100) Ever... So Proud!\n               - Nov 1977",
                "font": "comic sans ms",
                "height": 0.03,
                "top": 0.8 * PAPER_SIZE_RATIO + 0.15,
                "left": 0.5,
            },
            // Two images with two text boxes below. Offset with text on the sides
            {
                "page_side": "back",
                "type": "image",
                "src": "images/page_images/1984_trade_show_disappointment.jpeg",
                "width": 0.6,
                "top": 0.05,
                "left": 0.33,
            },
            {
                "page_side": "back",
                "type": "text",
                "content": "Not Every Demo\nGoes Perfectly!\n        - Dec 1984",
                "font": "comic sans ms",
                "height": 0.02,
                "top": 0.25 * PAPER_SIZE_RATIO,
                "left": 0.18,
            },
            {
                "page_side": "back",
                "type": "image",
                "src": "images/page_images_modified/1987_fiber_optic_development.jpg",
                "width": 0.6,
                "top": 0.6 * PAPER_SIZE_RATIO,
                "left": 0.1,
            },
            {
                "page_side": "back",
                "type": "text",
                "content": "But the Boys Will Always\nFind Ways to Improve!!\n                      - Mar 1987",
                "font": "comic sans ms",
                "height": 0.02,
                "top": 0.87,
                "left": 0.45,
            },
        ],
        7: [
            // Two images with two text boxes below. Offset with text on the sides
            {
                "page_side": "front",
                "type": "image",
                "src": "images/page_images/1988_tradeshow_disappointment_2.jpeg",
                "width": 0.6,
                "top": 0.05,
                "left": 0.05,
            },
            {
                "page_side": "front",
                "type": "text",
                "content": "Another Rough Day\nThey can't All\nBe Wins!\n          - April 1988",
                "font": "comic sans ms",
                "height": 0.02,
                "top": 0.25 * PAPER_SIZE_RATIO,
                "left": 0.8,
            },
            {
                "page_side": "front",
                "type": "image",
                "src": "images/page_images_modified/1988_subsea_fiber_optics_2.jpg",
                "width": 0.6,
                "top": 0.6 * PAPER_SIZE_RATIO,
                "left": 0.3,
            },
            {
                "page_side": "front",
                "type": "text",
                "content": "Nothing to do\nExcept keep Growing!\n              - May 1988",
                "font": "comic sans ms",
                "height": 0.0175,
                "top": 0.65,
                "left": 0.15,
            },
            // One image with one text box below
            {
                "page_side": "back",
                "type": "image",
                "src": "images/page_images_modified/1989_subsea_fiber_optics.jpg",
                "width": 0.75,
                "top": 0.15,
                "left": 0.125,
            },
            {
                "page_side": "back",
                "type": "text",
                "content": "Art and Mac\nGo Globally Optical!\n               - July 1989",
                "font": "comic sans ms",
                "height": 0.03,
                "top": 0.8 * PAPER_SIZE_RATIO + 0.18,
                "left": 0.45,
            },
        ],
        8: [
            // One image with one text box below
            {
                "page_side": "front",
                "type": "image",
                "src": "images/page_images/1996_nokia_baby_show.jpeg",
                "width": 0.85,
                "top": 0.1,
                "left": 0.075,
            },
            {
                "page_side": "front",
                "type": "text",
                "content": "Enter Player 3!!!\n             - Dec 1995",
                "font": "comic sans ms",
                "height": 0.03,
                "top": 0.8 * PAPER_SIZE_RATIO + 0.2,
                "left": 0.5,
            },
            // Two images with two text boxes below. Offset with text on the sides
            {
                "page_side": "back",
                "type": "image",
                "src": "images/page_images_modified/1996_suprafax_nap.jpg",
                "width": 0.5,
                "top": 0.05,
                "left": 0.4,
            },
            {
                "page_side": "back",
                "type": "text",
                "content": "Mac, Suprafax 14400\nAnd Baby have\nhad a long day\n               - Jan 1996",
                "font": "comic sans ms",
                "height": 0.022,
                "top": 0.25 * PAPER_SIZE_RATIO,
                "left": 0.23,
            },
            {
                "page_side": "back",
                "type": "image",
                "src": "images/page_images/1996_baby_phone.jpeg",
                "width": 0.575,
                "top": 0.75 * PAPER_SIZE_RATIO,
                "left": 0.075,
            },
            {
                "page_side": "back",
                "type": "text",
                "content": "Player 3\nmeets Art!\n         - Feb 1996",
                "font": "comic sans ms",
                "height": 0.022,
                "top": 0.7,
                "left": 0.77,
            },
        ],
        9: [
            // Two images with one text box below
            {
                "page_side": "front",
                "type": "image",
                "src": "images/page_images/1997_suprafax_games_1.jpeg",
                "width": 0.725,
                "top": 0.05,
                "left": 0.15,
            },
            {
                "page_side": "front",
                "type": "image",
                "src": "images/page_images/1997_suprafax_games_2.jpeg",
                "width": 0.6,
                "top": 0.75 * PAPER_SIZE_RATIO,
                "left": 0.05,
            },
            {
                "page_side": "front",
                "type": "text",
                "content": "Baby is Already\nFriends With Art!\n            - May 1997",
                "font": "comic sans ms",
                "height": 0.022,
                "top": 0.7,
                "left": 0.8,
            },
            // Two images with one text box below
            {
                "page_side": "back",
                "type": "image",
                "src": "images/page_images_modified/2000_computer_learning.jpg",
                "width": 0.65,
                "top": 0.05,
                "left": 0.2,
            },
            {
                "page_side": "back",
                "type": "image",
                "src": "images/page_images/2002_early_phones.jpeg",
                "width": 0.55,
                "top": 0.7 * PAPER_SIZE_RATIO,
                "left": 0.1,
            },
            {
                "page_side": "back",
                "type": "text",
                "content": "The Baby Surpasses The Master!!\n                       - June 1998",
                "font": "comic sans ms",
                "height": 0.02,
                "top": 0.9,
                "left": 0.5,
            },
        ],
        10: [
            // One image with one text box below
            {
                "page_side": "front",
                "type": "image",
                "src": "images/page_images/2003_ipod_alone.jpeg",
                "width": 0.8,
                "top": 0.15,
                "left": 0.1,
            },
            {
                "page_side": "front",
                "type": "text",
                "content": "The Kid and Art Playing\n                   - June 2003",
                "font": "comic sans ms",
                "height": 0.03,
                "top": 0.8 * PAPER_SIZE_RATIO + 0.25,
                "left": 0.5,
            },
            // Two images with one text box below
            {
                "page_side": "back",
                "type": "image",
                "src": "images/page_images_modified/2005_father_confused_camera.jpg",
                "width": 0.7,
                "top": 0.05,
                "left": 0.1,
            },
            {
                "page_side": "back",
                "type": "image",
                "src": "images/page_images/2010_sadness.jpeg",
                "width": 0.5,
                "top": 0.75 * PAPER_SIZE_RATIO,
                "left": 0.375,
            },
            {
                "page_side": "back",
                "type": "text",
                "content": "Art Keeps Growing\nMac Stays the Same!\n               - June 2003",
                "font": "comic sans ms",
                "height": 0.02,
                "top": 0.65,
                "left": 0.225,
            },
        ],
        11: [
            // One image with one text box below
            {
                "page_side": "front",
                "type": "image",
                "src": "images/page_images/2010_sadness_2.jpeg",
                "width": 0.85,
                "top": 0.1,
                "left": 0.075,
            },
            {
                "page_side": "front",
                "type": "text",
                "content": "Mac Exploring the World\n               - June 2010",
                "font": "comic sans ms",
                "height": 0.03,
                "top": 0.8 * PAPER_SIZE_RATIO + 0.25,
                "left": 0.5,
            },
            {
                "page_side": "back",
                "type": "text",
                "content": "Silicon\nSentiments",
                "height": 0.075,
                "font": "comic sans ms",
                "top": 0.15,
                "left": 0.5,
            },
            {
                "page_side": "back",
                "type": "text",
                "content": "And They All Lived\nHappily Ever After!",
                "height": 0.03,
                "font": "comic sans ms",
                "top": 0.5,
                "left": 0.5,
            },
        ]
    }
}

export default PAPER_DATA;