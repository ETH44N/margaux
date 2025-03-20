// Dates for the countdown
const separationDate = new Date('March 19, 2025 13:00:00').getTime();
const reunionDate = new Date('April 11, 2025 11:00:00').getTime();
const totalTimeApart = reunionDate - separationDate;

// Three.js setup
let scene, camera, renderer, heart;
let animationComplete = false;

function initThree() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x111111);
    document.getElementById('three-container').appendChild(renderer.domElement);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Load rose model
    const loader = new THREE.GLTFLoader();
    
    // Comment out the simple heart creation since we're using the rose model
    // createSimpleHeart();
    
    // Load the rose.glb model
    loader.load('heart.glb', function(gltf) {
        heart = gltf.scene;
        heart.scale.set(1, 1, 1);
        heart.position.set(0, 0, 0);
        
        // Set material to red
        heart.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xff3b5c,
                    emissive: 0xff3b5c,
                    emissiveIntensity: 0.3,
                    roughness: 0.3,
                    metalness: 0.7
                });
            }
        });
        
        scene.add(heart);
        animate();
    }, 
    // Add progress and error handlers
    function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function(error) {
        console.error('An error happened loading the model:', error);
        // Fallback to simple heart if model loading fails
        createSimpleHeart();
    });
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function createSimpleHeart() {
    // Create a simple heart shape using a custom geometry
    const heartShape = new THREE.Shape();
    
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0, -1, -2, -2, -4, 0);
    heartShape.bezierCurveTo(-6, 2, -6, 4, -4, 6);
    heartShape.bezierCurveTo(-2, 8, 0, 8, 0, 6);
    heartShape.bezierCurveTo(0, 8, 2, 8, 4, 6);
    heartShape.bezierCurveTo(6, 4, 6, 2, 4, 0);
    heartShape.bezierCurveTo(2, -2, 0, -1, 0, 0);
    
    const geometry = new THREE.ExtrudeGeometry(heartShape, {
        depth: 1,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.3,
        bevelThickness: 0.3
    });
    
    const material = new THREE.MeshStandardMaterial({
        color: 0xff3b5c,
        emissive: 0xff3b5c,
        emissiveIntensity: 0.3,
        roughness: 0.3,
        metalness: 0.7
    });
    
    heart = new THREE.Mesh(geometry, material);
    heart.scale.set(0.2, 0.2, 0.2);
    heart.rotation.z = Math.PI;
    heart.position.set(0, 0, 0);
    
    scene.add(heart);
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (heart) {
        heart.rotation.y += 0.01;
        
        // Zoom in animation
        if (!animationComplete && camera.position.z > 2) {
            camera.position.z -= 0.05;
            
            // When zoom is complete, show the countdown
            if (camera.position.z <= 2) {
                animationComplete = true;
                document.getElementById('countdown-container').classList.add('visible');
                document.getElementById('countdown-container').classList.remove('hidden');
            }
        }
    }
    
    renderer.render(scene, camera);
}

// Countdown timer function
function updateCountdown() {
    const now = new Date().getTime();
    const timeLeft = reunionDate - now;
    
    // Calculate time units
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    // Update the HTML
    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    
    // Calculate and update progress
    const timeElapsed = now - separationDate;
    const progressPercentage = Math.min(100, Math.max(0, (timeElapsed / totalTimeApart) * 100));
    
    document.getElementById('progress').style.width = `${progressPercentage}%`;
    document.getElementById('progress-text').textContent = `${progressPercentage.toFixed(1)}%`;
    
    // If the countdown is over
    if (timeLeft < 0) {
        clearInterval(countdownInterval);
        document.getElementById('countdown-container').innerHTML = '<h1>Together Again! ❤️</h1>';
    }
}

// Initialize
window.onload = function() {
    initThree();
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
};