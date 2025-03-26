document.addEventListener('DOMContentLoaded', function() {
  console.log("Matrix button script loaded");
  const projectsBtn = document.querySelector('.btn-primary');
  let matrixCanvas;
  let matrixCtx;
  let matrixAnimation;
  let isCanvasActive = false;
  
  // Matrix characters - using a mix of characters for a tech feel
  const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  
  // Create canvas for matrix effect
  function createMatrixCanvas() {
    console.log("Creating matrix canvas");
    matrixCanvas = document.createElement('canvas');
    matrixCanvas.classList.add('matrix-effect');
    document.body.appendChild(matrixCanvas);
    matrixCtx = matrixCanvas.getContext('2d');
  }
  
  // Position the canvas relative to the button
  function positionCanvas() {
    if (!matrixCanvas) return;
    
    const rect = projectsBtn.getBoundingClientRect();
    const padding = 150; // Increased padding for a more ambient effect
    
    matrixCanvas.width = rect.width + (padding * 2);
    matrixCanvas.height = rect.height + (padding * 2);
    
    matrixCanvas.style.position = 'fixed';
    matrixCanvas.style.left = `${rect.left - padding}px`;
    matrixCanvas.style.top = `${rect.top - padding}px`;
    matrixCanvas.style.zIndex = '5'; // Lower z-index to keep it in the background
    matrixCanvas.style.pointerEvents = 'none';
    
    console.log(`Canvas positioned at ${matrixCanvas.style.left}, ${matrixCanvas.style.top} with dimensions ${matrixCanvas.width}x${matrixCanvas.height}`);
  }
  
  // Matrix rain animation
  function drawMatrix() {
    console.log("Starting matrix animation");
    // Create an array for drops - one per column
    const fontSize = 14; // Smaller font size for subtlety
    const columnWidth = 18; // Increased column width for less density
    const cols = Math.floor(matrixCanvas.width / columnWidth);
    const drops = [];
    
    // Initialize drops array
    for (let i = 0; i < cols; i++) {
      drops[i] = Math.random() * -20; // Start higher up for more gradual appearance
    }
    
    function createAmbientGradient() {
      // Create a soft gradient that fades completely at edges
      const centerX = matrixCanvas.width / 2;
      const centerY = matrixCanvas.height / 2;
      const radius = Math.min(matrixCanvas.width, matrixCanvas.height) / 1.8;
      
      const gradient = matrixCtx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      
      gradient.addColorStop(0, 'rgba(10, 10, 10, 0.05)'); // More transparent
      gradient.addColorStop(0.6, 'rgba(10, 10, 10, 0.05)');
      gradient.addColorStop(1, 'rgba(10, 10, 10, 0.95)'); // Strong fade at edges
      
      return gradient;
    }
    
    function draw() {
      // Highly transparent background for subtle trailing effect
      matrixCtx.fillStyle = 'rgba(10, 10, 10, 0.05)'; // More transparent background
      matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      
      // Apply ambient gradient
      matrixCtx.save();
      matrixCtx.globalCompositeOperation = 'destination-out';
      matrixCtx.fillStyle = createAmbientGradient();
      matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      matrixCtx.restore();
      
      // More subtle green for characters
      matrixCtx.fillStyle = 'rgba(0, 255, 87, 0.3)'; // Much more transparent characters
      matrixCtx.font = `${fontSize}px "JetBrains Mono", monospace`; // Changed to JetBrains Mono
      matrixCtx.textAlign = 'center';
      
      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        // Only draw some characters for a sparser effect
        if (Math.random() > 0.3) { // 70% chance to skip drawing to create sparse effect
          // Choose a random character
          const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
          
          // Draw the character
          const x = i * columnWidth + columnWidth/2;
          const y = drops[i] * 20;
          
          // Skip drawing if near the edges
          const centerX = matrixCanvas.width / 2;
          const centerY = matrixCanvas.height / 2;
          const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          const maxDistance = Math.min(matrixCanvas.width, matrixCanvas.height) / 2;
          
          if (distanceFromCenter < maxDistance * 0.85) {
            // Very subtle glow - barely noticeable
            matrixCtx.shadowColor = 'rgba(0, 255, 87, 0.3)';
            matrixCtx.shadowBlur = 2;
            matrixCtx.fillText(text, x, y);
            matrixCtx.shadowBlur = 0;
            
            // Only rarely make leading characters brighter
            if (Math.random() > 0.99) {
              matrixCtx.fillStyle = 'rgba(0, 255, 87, 0.6)';
              matrixCtx.fillText(text, x, y);
              matrixCtx.fillStyle = 'rgba(0, 255, 87, 0.3)';
            }
          }
        }
        
        // Move drop down more slowly
        drops[i] += 0.3; // Slower speed
        
        // Reset drop to top when it reaches bottom
        if (drops[i] * 20 > matrixCanvas.height && Math.random() > 0.95) {
          drops[i] = 0;
        }
      }
    }
    
    // Animation loop
    function animate() {
      draw();
      if (isCanvasActive) {
        matrixAnimation = requestAnimationFrame(animate);
      }
    }
    
    animate();
  }
  
  // Start the matrix effect
  function startMatrixEffect() {
    console.log("Starting matrix effect");
    if (!matrixCanvas) {
      createMatrixCanvas();
    }
    
    positionCanvas();
    
    if (!isCanvasActive) {
      isCanvasActive = true;
      drawMatrix();
      
      // Update button style with subtle effect
      projectsBtn.classList.add('matrix-active');
    }
  }
  
  // Stop the matrix effect
  function stopMatrixEffect() {
    console.log("Stopping matrix effect");
    if (matrixAnimation) {
      cancelAnimationFrame(matrixAnimation);
      isCanvasActive = false;
    }
    
    // Fade out animation for smooth transition
    if (matrixCanvas) {
      matrixCanvas.style.opacity = '0';
      setTimeout(() => {
        if (matrixCanvas) {
          matrixCanvas.remove();
          matrixCanvas = null;
        }
      }, 300); // Fade out over 300ms
    }
    
    // Reset button style
    projectsBtn.classList.remove('matrix-active');
  }
  
  // Handle window resize
  window.addEventListener('resize', function() {
    if (isCanvasActive) {
      positionCanvas();
    }
  });
  
  // Add event listeners to button
  if (projectsBtn) {
    console.log("Adding event listeners to button");
    projectsBtn.addEventListener('mouseenter', startMatrixEffect);
    projectsBtn.addEventListener('mouseleave', stopMatrixEffect);
    projectsBtn.addEventListener('focus', startMatrixEffect);
    projectsBtn.addEventListener('blur', stopMatrixEffect);
  } else {
    console.error("Project button not found!");
  }
});
