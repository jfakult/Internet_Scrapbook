// Modified from: https://codepen.io/GraemeFulton/pen/BNyQMM
class StarScapeBackground {
    constructor(THREE, scene)
    {
        this.THREE = THREE;
        this.scene = scene;
        this.stars = [];

        this.isDesktop = window.innerWidth > window.innerHeight

        this.addSphere();
    }

    addSphere() {
        let zMin = -2000;
        let zMax = 1000;
        let zInc = 4;
        let xMax = 1200;
        let yMax = 900;

        // Closer, fewer, and more densly packed stars on mobile
        if (!this.isDesktop) {
            zMin -1000;
            zMax = 100;
            zInc = 2;
            xMax = 400;
            yMax = 800;

        }
        // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position. 
        for ( var z = zMin; z < zMax; z += zInc ) {

            const red = Math.random() * 0.8 + 0.2;
            const blue = Math.random() * 0.8 + 0.2;
            const green = Math.min(red, blue)

            var geometry   = new this.THREE.SphereGeometry(0.5, 32, 32)
            var material = new this.THREE.MeshBasicMaterial( {color: new this.THREE.Color(red, green, blue)} )
            var sphere = new this.THREE.Mesh(geometry, material)

            // This time we give the sphere random x and y positions between -500 and 500
            // Don't let them be too close to 0 or they may clip through the book
            let xPos = Math.random() * (xMax * 2) - xMax;
            let yPos = Math.random() * (yMax * 2) - yMax;
            while (Math.abs(xPos) < 50 && Math.abs(yPos) < 50)
            {
                xPos = Math.random() * (xMax * 2) - xMax;
                yPos = Math.random() * (yMax * 2) - yMax;
            }

            sphere.position.x = xPos;
            sphere.position.y = yPos;

            // Then set the z position to where it is in the loop (distance of camera)
            sphere.position.z = z;

            // scale it up a bit
            sphere.scale.x = sphere.scale.y = 2;

            //add the sphere to the scene
            this.scene.add( sphere );

            //finally push it to the stars array 
            this.stars.push(sphere); 
        }
	}

	animateStars(starSpeed)
    { 
		// loop through each star
		for(var i=0; i<this.stars.length; i++) {
			
			const star = this.stars[i]; 
				
			// and move it forward dependent on the mouseY position.
			star.position.z += i * (starSpeed / 128);
				
			// if the particle is too close move it to the back
			if (star.position.z > 1000) {
                star.position.z = -2000;
            }
		}
	}
}

export default StarScapeBackground;