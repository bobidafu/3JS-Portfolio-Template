# 🌟 3D Interactive Portfolio

A stunning, interactive portfolio website built with Three.js featuring 3D models, parallax effects, and smooth animations.

## ✨ Features

- 🎮 **Interactive 3D Models** - Drag to rotate, with smooth inertia
- 🎬 **Animation Support** - Plays built-in GLTF/GLB animations
- ✨ **Particle Effects** - Floating particles in the background
- 🖱️ **Parallax Effect** - Scene responds to mouse movement
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- 🎨 **Easy Customization** - All settings in one CONFIG object
- 🌙 **Dark Theme** - Beautiful dark color scheme

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/portfolio-3d.git

# Navigate to project folder
cd portfolio-3d

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder, ready to deploy.

## 🎨 Customization

All customization options are in the `CONFIG` object at the top of `src/script.js`:

### Colors

```javascript
const CONFIG = {
    materialColor: '#ffeded',    // 3D objects & particles
    backgroundColor: '#1e1a20',  // Page background
    textColor: '#ffeded',        // All text
    // ...
}
```

### 3D Models

1. Download `.glb` models from [Sketchfab](https://sketchfab.com) (filter by "Downloadable" and "CC0" license)
2. Place them in `/static/models/`
3. Update the CONFIG:

```javascript
models: [
    {
        path: 'models/your-model.glb',
        scale: 0.5,                        // Adjust size
        rotation: { x: 0, y: 0, z: 0 },    // Initial rotation
        position: { x: 0, y: 0, z: 0 }     // Offset if model is off-center
    },
    // ... more models
],
```

### Animations

Models with built-in animations will play automatically:

```javascript
playAnimations: true,  // Set to false to disable
```

### Interactions

```javascript
enableDragRotation: true,   // Drag models to rotate them
parallaxStrength: 0.5,      // Mouse parallax intensity (0-1)
rotationSpeed: 0.1,         // Auto-rotation speed
```

### Particles

```javascript
particlesCount: 200,   // Number of particles
particleSize: 0.03,    // Size of each particle
```

## 📁 Project Structure

```
portfolio/
├── src/
│   ├── index.html      # HTML structure & content
│   ├── style.css       # Styling
│   └── script.js       # Three.js code & CONFIG
├── static/
│   ├── models/         # Your 3D models (.glb files)
│   └── textures/       # Texture files
├── package.json
└── vite.config.js
```

## 📝 Editing Content

Edit the HTML sections in `src/index.html`:

| Section | Description |
|---------|-------------|
| Hero | Your name and tagline |
| About | Bio and personal details |
| Education | Schools and courses |
| Skills | Technical and soft skills |
| Projects | Your work and projects |
| Experience | Work history |
| Contact | Email, GitHub, LinkedIn |

## 🌐 Deployment

### GitHub Pages

1. Build the project: `npm run build`
2. Push the `dist/` folder to a `gh-pages` branch
3. Enable GitHub Pages in repository settings

### Netlify

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

### Vercel

1. Import your GitHub repository
2. Vercel auto-detects Vite settings
3. Deploy!

## 🔧 Troubleshooting

### Models not showing?

- Check the browser console (F12) for errors
- Verify the file path is correct
- For `.gltf` files, ensure the entire folder is copied (includes `scene.bin` and `textures/`)

### Models positioned incorrectly?

Use the `position` offset in CONFIG:
```javascript
position: { x: 0.5, y: -0.3, z: 0 }  // Adjust as needed
```

### Animations not playing?

- Ensure `playAnimations: true` in CONFIG
- Check if the model actually has animations (console will log "🎬 Playing X animation(s)")
- Some models have animations that are very subtle

### Performance issues?

- Reduce `particlesCount`
- Use smaller/simpler 3D models
- Lower poly models perform better

## 📚 Technologies Used

- [Three.js](https://threejs.org/) - 3D graphics library
- [GSAP](https://greensock.com/gsap/) - Animation library
- [Vite](https://vitejs.dev/) - Build tool
- [lil-gui](https://lil-gui.georgealways.com/) - Debug panel

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- 3D models from [Sketchfab](https://sketchfab.com)
- Inspired by [Three.js Journey](https://threejs-journey.com/)

---

Made with ❤️ and Three.js
