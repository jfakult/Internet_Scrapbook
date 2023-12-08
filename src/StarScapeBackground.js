// Modified from: https://codepen.io/GraemeFulton/pen/BNyQMM
class StarScapeBackground {
    constructor(THREE, scene)
    {
        this.THREE = THREE;
        this.scene = scene;
        this.stars = [];

        this.addSphere();
    }

    addSphere() {
        // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position. 
        for ( var z= -1000; z < 0; z+=5 ) {

            const red = Math.random() * 0.8 + 0.2;
            const blue = Math.random() * 0.8 + 0.2;
            const green = Math.min(red, blue)

            var geometry   = new this.THREE.SphereGeometry(0.5, 32, 32)
            var material = new this.THREE.MeshBasicMaterial( {color: new this.THREE.Color(red, green, blue)} )
            var sphere = new this.THREE.Mesh(geometry, material)

            // This time we give the sphere random x and y positions between -500 and 500
            // Don't let them be too close to 0 or they may clip through the book
            let xPos = Math.random() * 1000 - 500;
            while (Math.abs(xPos) < 10)
            {
                xPos = Math.random() * 1000 - 500;
            }
            let yPos = Math.random() * 1000 - 500;
            while (Math.abs(yPos) < 10)
            {
                yPos = Math.random() * 1000 - 500;
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
			star.position.z += i * (starSpeed / 20);
				
			// if the particle is too close move it to the back
			if (star.position.z>1000) {
                star.position.z-=2000;
            }
		}
	}
}

export default StarScapeBackground;