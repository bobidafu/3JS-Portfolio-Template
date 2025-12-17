import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import GUI from 'lil-gui'
import gsap from 'gsap'

const CONFIG = {
    // 🎨 COLOR THEME
    materialColor: '#ffeded',
    backgroundColor: '#1e1a20',
    textColor: '#ffeded',

    // 🔮 3D OBJECTS
    // Set to true to use your own 3D models, false to use default shapes
    useCustomModels: true,

    // 🎨 KEEP ORIGINAL TEXTURES
    // Set to true to keep the model's original colors/textures
    // Set to false to apply toon shading (works best with simple/untextured models)
    keepOriginalMaterials: true,

    // 🎬 PLAY ANIMATIONS
    // Set to true to play animations from GLTF/GLB models (if they have any)
    // Set to false to use the default rotation animation instead
    playAnimations: true,

    // 🖱️ DRAG TO ROTATE
    // Set to true to allow clicking/dragging on models to rotate them
    // Works on both desktop (mouse) and mobile (touch)
    enableDragRotation: true,
    dragSensitivity: 0.005,  // How fast the model rotates when dragging

    // 📁 CUSTOM 3D MODELS (only used if useCustomModels is true)
    models: [
        {
            path: 'models/model1.glb',   // Hero section
            scale: 0.5,
            rotation: { x: 0, y: 0, z: 0 },
            position: { x: 0, y: 0, z: 0 }
        },
        {
            path: 'models/model2.glb',    // About section
            scale: 0.5,
            rotation: { x: 0, y: 0, z: 0 },
            position: { x: 0, y: 0, z: 0 }
        },
        {
            path: 'models/model3.glb',    // Education section
            scale: 0.5,
            rotation: { x: 0, y: 0, z: 0 },
            position: { x: 0, y: 0, z: 0 }
        },
        {
            path: 'models/model4.glb',   // Skills section
            scale: 0.5,
            rotation: { x: 0, y: 0, z: 0 },
            position: { x: 0, y: 0, z: 0 }
        },
        {
            path: 'models/model5.glb',   // Projects section
            scale: 0.5,
            rotation: { x: 0, y: 0, z: 0 },
            position: { x: 0, y: 0, z: 0 }
        },
        {
            path: 'models/model6.glb',   // Experience section
            scale: 0.5,
            rotation: { x: 0, y: 0, z: 0 },
            position: { x: 0, y: 0, z: 0 }
        }
    ],

    // 🎯 DEFAULT SHAPES (used if useCustomModels is false, or as fallback if model fails)
    // Options: 'torus', 'cone', 'torusKnot', 'octahedron', 'icosahedron', 'dodecahedron', 'box', 'sphere'
    defaultShapes: ['torus', 'cone', 'torusKnot', 'octahedron', 'icosahedron', 'dodecahedron'],

    // ✨ PARTICLES
    particlesCount: 200,
    particleSize: 0.03,

    // 📏 LAYOUT
    objectsDistance: 4,  // Vertical distance between objects
    objectsXOffset: 2,   // How far left/right objects appear

    // 🖱️ INTERACTION
    parallaxStrength: 0.5,  // Mouse parallax effect (0 = none, 1 = strong)
    rotationSpeed: 0.1,     // How fast objects rotate

    // 🐛 DEBUG
    showDebugPanel: false,  // Set to true to show the debug panel
}

/* ============================================
   END OF CONFIGURATION
   ============================================ */


/**
 * Debug Panel (optional)
 */
let gui = null
if (CONFIG.showDebugPanel) {
    gui = new GUI()
    gui.addColor(CONFIG, 'materialColor').onChange(() => {
        if (material) material.color.set(CONFIG.materialColor)
        if (particlesMaterial) particlesMaterial.color.set(CONFIG.materialColor)
    })
    gui.addColor(CONFIG, 'backgroundColor').onChange(() => {
        document.documentElement.style.background = CONFIG.backgroundColor
    })
    gui.addColor(CONFIG, 'textColor').onChange(() => {
        document.body.style.color = CONFIG.textColor
    })
    gui.add(CONFIG, 'parallaxStrength', 0, 1)
    gui.add(CONFIG, 'rotationSpeed', 0, 0.5)
}

/**
 * Apply colors from CONFIG
 */
document.documentElement.style.background = CONFIG.backgroundColor
document.body.style.color = CONFIG.textColor

/**
 * Base Setup
 */
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

/**
 * Loaders
 */
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()

// Draco loader for compressed models (optional but recommended)
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

/**
 * Materials
 */
const material = new THREE.MeshToonMaterial({
    color: CONFIG.materialColor,
    gradientMap: gradientTexture
})

/**
 * Geometry Factory - Creates different shape geometries
 */
function createGeometry(shapeType) {
    switch (shapeType) {
        case 'torus':
            return new THREE.TorusGeometry(1, 0.4, 16, 60)
        case 'cone':
            return new THREE.ConeGeometry(1, 2, 32)
        case 'torusKnot':
            return new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16)
        case 'octahedron':
            return new THREE.OctahedronGeometry(1.2)
        case 'icosahedron':
            return new THREE.IcosahedronGeometry(1.2)
        case 'dodecahedron':
            return new THREE.DodecahedronGeometry(1.2)
        case 'box':
            return new THREE.BoxGeometry(1.5, 1.5, 1.5)
        case 'sphere':
            return new THREE.SphereGeometry(1.2, 32, 32)
        default:
            return new THREE.TorusGeometry(1, 0.4, 16, 60)
    }
}

/**
 * 3D Objects
 */
const sectionMeshes = []
const animationMixers = []  // Store animation mixers for GLTF models
const objectsDistance = CONFIG.objectsDistance

// Create objects based on configuration
if (CONFIG.useCustomModels) {
    // Load custom GLTF models
    console.log('Loading custom 3D models...')
    
    CONFIG.models.forEach((modelConfig, index) => {
        gltfLoader.load(
            modelConfig.path,
            (gltf) => {
                const model = gltf.scene
                
                // Apply scale
                model.scale.set(modelConfig.scale, modelConfig.scale, modelConfig.scale)
                
                // Apply initial rotation
                model.rotation.x = modelConfig.rotation.x
                model.rotation.y = modelConfig.rotation.y
                model.rotation.z = modelConfig.rotation.z
                
                // Position based on section (opposite side of text)
                // Odd sections have text on right, so mesh goes left (and vice versa)
                const baseX = index % 2 === 0 ? -CONFIG.objectsXOffset : CONFIG.objectsXOffset
                const baseY = -objectsDistance * index
                
                // Apply position with optional offset for off-center models
                const offset = modelConfig.position || { x: 0, y: 0, z: 0 }
                model.position.x = baseX + offset.x
                model.position.y = baseY + offset.y
                model.position.z = offset.z
                
                // Optional: Apply toon material to all meshes in the model
                // Only if keepOriginalMaterials is false
                if (!CONFIG.keepOriginalMaterials) {
                    model.traverse((child) => {
                        if (child.isMesh) {
                            child.material = material
                        }
                    })
                }
                
                // Setup animations if the model has them
                if (CONFIG.playAnimations && gltf.animations && gltf.animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(model)
                    
                    // Play all animations (or just the first one)
                    gltf.animations.forEach((clip) => {
                        const action = mixer.clipAction(clip)
                        action.play()
                    })
                    
                    animationMixers[index] = mixer
                    console.log(`🎬 Playing ${gltf.animations.length} animation(s) for model ${index + 1}`)
                }
                
                scene.add(model)
                sectionMeshes[index] = model
                
                console.log(`✅ Loaded model ${index + 1}: ${modelConfig.path}`)
            },
            (progress) => {
                // Loading progress
                if (progress.total > 0) {
                    const percent = (progress.loaded / progress.total * 100).toFixed(0)
                    console.log(`Loading model ${index + 1}: ${percent}%`)
                }
            },
            (error) => {
                console.error(`❌ Error loading model ${modelConfig.path}:`, error)
                console.log('💡 Tip: Make sure the model folder contains all files (scene.gltf, scene.bin, textures/)')
                console.log('Falling back to default shape...')
                
                // Fallback to default shape if model fails to load
                const fallbackMesh = new THREE.Mesh(
                    createGeometry(CONFIG.defaultShapes[index] || 'torus'),
                    material
                )
                // FLIPPED position - opposite side of text
                fallbackMesh.position.x = index % 2 === 0 ? -CONFIG.objectsXOffset : CONFIG.objectsXOffset
                fallbackMesh.position.y = -objectsDistance * index
                scene.add(fallbackMesh)
                sectionMeshes[index] = fallbackMesh
            }
        )
    })
} else {
    // Use default shapes
    console.log('Using default shapes...')
    
    CONFIG.defaultShapes.forEach((shapeType, index) => {
        const mesh = new THREE.Mesh(
            createGeometry(shapeType),
            material
        )
        
        // FLIPPED position - opposite side of text
        mesh.position.x = index % 2 === 0 ? -CONFIG.objectsXOffset : CONFIG.objectsXOffset
        mesh.position.y = -objectsDistance * index
        
        scene.add(mesh)
        sectionMeshes.push(mesh)
    })
}

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)

// Add ambient light for better model visibility
const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
scene.add(ambientLight)

/**
 * Particles
 */
const particlesCount = CONFIG.particlesCount
const positions = new Float32Array(particlesCount * 3)

// Calculate total scroll height (number of sections * distance)
const totalSections = 7 // Update this if you add more sections
for (let i = 0; i < particlesCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * totalSections
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

const particlesMaterial = new THREE.PointsMaterial({
    color: CONFIG.materialColor,
    sizeAttenuation: true,
    size: CONFIG.particleSize
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll Animation
 */
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', () => {
    scrollY = window.scrollY
    const newSection = Math.round(scrollY / sizes.height)

    if (newSection !== currentSection) {
        currentSection = newSection

        // Animate the mesh for the current section (if it exists)
        if (sectionMeshes[currentSection]) {
            gsap.to(
                sectionMeshes[currentSection].rotation,
                {
                    duration: 1.5,
                    ease: 'power2.inOut',
                    x: '+=6',
                    y: '+=3',
                    z: '+=1.5'
                }
            )
        }
    }
})

/**
 * Cursor / Mouse Parallax
 */
const cursor = { x: 0, y: 0 }

window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})

/**
 * Drag to Rotate Models
 */
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

let isDragging = false
let selectedModel = null
let selectedModelIndex = -1
let previousMousePosition = { x: 0, y: 0 }

// Inertia/velocity for smooth rotation after release
const dragVelocity = {}  // Store velocity per model index

if (CONFIG.enableDragRotation) {
    // Hover effect - show grab cursor when hovering over models
    canvas.addEventListener('mousemove', (event) => {
        if (!isDragging) {
            mouse.x = (event.clientX / sizes.width) * 2 - 1
            mouse.y = -(event.clientY / sizes.height) * 2 + 1
            
            raycaster.setFromCamera(mouse, camera)
            
            const meshesToCheck = sectionMeshes.filter(mesh => mesh !== null && mesh !== undefined)
            const intersects = raycaster.intersectObjects(meshesToCheck, true)
            
            canvas.style.cursor = intersects.length > 0 ? 'grab' : 'default'
        }
    })
    
    // Mouse down - start dragging
    canvas.addEventListener('mousedown', (event) => {
        mouse.x = (event.clientX / sizes.width) * 2 - 1
        mouse.y = -(event.clientY / sizes.height) * 2 + 1
        
        raycaster.setFromCamera(mouse, camera)
        
        // Check all section meshes for intersection
        const meshesToCheck = sectionMeshes.filter(mesh => mesh !== null && mesh !== undefined)
        const intersects = raycaster.intersectObjects(meshesToCheck, true)
        
        if (intersects.length > 0) {
            isDragging = true
            document.body.classList.add('dragging')  // Prevent text selection
            canvas.style.cursor = 'grabbing'
            
            // Find which root model was clicked
            let clickedObject = intersects[0].object
            while (clickedObject.parent && !sectionMeshes.includes(clickedObject)) {
                clickedObject = clickedObject.parent
            }
            
            if (sectionMeshes.includes(clickedObject)) {
                selectedModel = clickedObject
                selectedModelIndex = sectionMeshes.indexOf(clickedObject)
                // Reset velocity when starting to drag
                dragVelocity[selectedModelIndex] = { x: 0, y: 0 }
            }
            
            previousMousePosition = { x: event.clientX, y: event.clientY }
            
            // Prevent default to stop text selection
            event.preventDefault()
        }
    })
    
    // Mouse move - rotate if dragging
    canvas.addEventListener('mousemove', (event) => {
        if (isDragging && selectedModel) {
            const deltaX = event.clientX - previousMousePosition.x
            const deltaY = event.clientY - previousMousePosition.y
            
            // Rotate the model based on mouse movement
            selectedModel.rotation.y += deltaX * CONFIG.dragSensitivity
            selectedModel.rotation.x += deltaY * CONFIG.dragSensitivity
            
            // Store velocity for inertia
            dragVelocity[selectedModelIndex] = { 
                x: deltaY * CONFIG.dragSensitivity, 
                y: deltaX * CONFIG.dragSensitivity 
            }
            
            previousMousePosition = { x: event.clientX, y: event.clientY }
        }
    })
    
    // Mouse up - stop dragging
    canvas.addEventListener('mouseup', () => {
        isDragging = false
        document.body.classList.remove('dragging')  // Re-enable text selection
        selectedModel = null
        selectedModelIndex = -1
        canvas.style.cursor = 'default'
    })
    
    // Mouse leave - stop dragging if mouse leaves canvas
    canvas.addEventListener('mouseleave', () => {
        // Don't stop dragging on mouseleave - let window mouseup handle it
        // This allows smoother dragging even when mouse moves fast
        canvas.style.cursor = 'default'
    })
    
    // Window mouseup - ensure dragging stops even if mouse is outside canvas
    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false
            document.body.classList.remove('dragging')
            selectedModel = null
            selectedModelIndex = -1
            canvas.style.cursor = 'default'
        }
    })
    
    // Touch support for mobile
    canvas.addEventListener('touchstart', (event) => {
        if (event.touches.length === 1) {
            const touch = event.touches[0]
            mouse.x = (touch.clientX / sizes.width) * 2 - 1
            mouse.y = -(touch.clientY / sizes.height) * 2 + 1
            
            raycaster.setFromCamera(mouse, camera)
            
            const meshesToCheck = sectionMeshes.filter(mesh => mesh !== null && mesh !== undefined)
            const intersects = raycaster.intersectObjects(meshesToCheck, true)
            
            if (intersects.length > 0) {
                isDragging = true
                document.body.classList.add('dragging')
                
                let clickedObject = intersects[0].object
                while (clickedObject.parent && !sectionMeshes.includes(clickedObject)) {
                    clickedObject = clickedObject.parent
                }
                
                if (sectionMeshes.includes(clickedObject)) {
                    selectedModel = clickedObject
                    selectedModelIndex = sectionMeshes.indexOf(clickedObject)
                    dragVelocity[selectedModelIndex] = { x: 0, y: 0 }
                }
                
                previousMousePosition = { x: touch.clientX, y: touch.clientY }
            }
        }
    }, { passive: true })
    
    canvas.addEventListener('touchmove', (event) => {
        if (isDragging && selectedModel && event.touches.length === 1) {
            const touch = event.touches[0]
            const deltaX = touch.clientX - previousMousePosition.x
            const deltaY = touch.clientY - previousMousePosition.y
            
            selectedModel.rotation.y += deltaX * CONFIG.dragSensitivity
            selectedModel.rotation.x += deltaY * CONFIG.dragSensitivity
            
            // Store velocity for inertia
            dragVelocity[selectedModelIndex] = { 
                x: deltaY * CONFIG.dragSensitivity, 
                y: deltaX * CONFIG.dragSensitivity 
            }
            
            previousMousePosition = { x: touch.clientX, y: touch.clientY }
        }
    }, { passive: true })
    
    canvas.addEventListener('touchend', () => {
        isDragging = false
        document.body.classList.remove('dragging')
        selectedModel = null
        selectedModelIndex = -1
    })
}

/**
 * Animation Loop
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Animate camera based on scroll
    camera.position.y = -scrollY / sizes.height * objectsDistance

    // Parallax effect
    const parallaxX = cursor.x * CONFIG.parallaxStrength
    const parallaxY = -cursor.y * CONFIG.parallaxStrength
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime

    // Update animation mixers (for GLTF model animations)
    for (const mixer of animationMixers) {
        if (mixer) {
            mixer.update(deltaTime)
        }
    }

    // Apply drag inertia (smooth slowdown after releasing drag)
    if (CONFIG.enableDragRotation) {
        for (const [indexStr, velocity] of Object.entries(dragVelocity)) {
            const index = parseInt(indexStr)
            const mesh = sectionMeshes[index]
            
            // Only apply inertia if not currently dragging this model
            if (mesh && !(isDragging && index === selectedModelIndex)) {
                // Apply velocity
                mesh.rotation.x += velocity.x
                mesh.rotation.y += velocity.y
                
                // Decay velocity (friction)
                velocity.x *= 0.95
                velocity.y *= 0.95
                
                // Stop when velocity is very small
                if (Math.abs(velocity.x) < 0.0001 && Math.abs(velocity.y) < 0.0001) {
                    velocity.x = 0
                    velocity.y = 0
                }
            }
        }
    }

    // Animate meshes (continuous rotation)
    // Only rotate if the model doesn't have its own animation playing
    // and is not being dragged or has inertia
    for (let i = 0; i < sectionMeshes.length; i++) {
        const mesh = sectionMeshes[i]
        if (mesh) {
            // Skip rotation if this model has animations playing
            if (CONFIG.playAnimations && animationMixers[i]) {
                continue
            }
            // Skip rotation if this specific model is being dragged
            if (CONFIG.enableDragRotation && isDragging && mesh === selectedModel) {
                continue
            }
            // Skip rotation if this model still has inertia velocity
            if (CONFIG.enableDragRotation && dragVelocity[i] && 
                (Math.abs(dragVelocity[i].x) > 0.0001 || Math.abs(dragVelocity[i].y) > 0.0001)) {
                continue
            }
            mesh.rotation.x += deltaTime * CONFIG.rotationSpeed
            mesh.rotation.y += deltaTime * CONFIG.rotationSpeed * 1.2
        }
    }

    // Render
    renderer.render(scene, camera)

    // Next frame
    window.requestAnimationFrame(tick)
}

tick()