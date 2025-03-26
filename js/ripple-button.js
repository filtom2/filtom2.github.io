document.addEventListener('DOMContentLoaded', function() {
  console.log("Ripple button script loaded");
  const aboutBtn = document.querySelector('.btn-outline');
  let rippleCanvas;
  let rippleCtx;
  let rippleAnimation;
  let isCanvasActive = false;
  
  // Create canvas for ripple effect
  function createRippleCanvas() {
    console.log("Creating ripple canvas");
    rippleCanvas = document.createElement('canvas');
    rippleCanvas.classList.add('ripple-effect');
    document.body.appendChild(rippleCanvas);
    rippleCtx = rippleCanvas.getContext('2d', { alpha: true });
  }
  
  // Position the canvas relative to the button
  function positionCanvas() {
    if (!rippleCanvas) return;
    
    const rect = aboutBtn.getBoundingClientRect();
    // Increase padding significantly to ensure ripples extend well beyond visible area
    const padding = Math.max(window.innerWidth, window.innerHeight) * 0.2;
    
    rippleCanvas.width = rect.width + (padding * 2);
    rippleCanvas.height = rect.height + (padding * 2);
    
    rippleCanvas.style.position = 'fixed';
    rippleCanvas.style.left = `${rect.left - padding}px`;
    rippleCanvas.style.top = `${rect.top - padding}px`;
    rippleCanvas.style.zIndex = '5';
    rippleCanvas.style.pointerEvents = 'none';
    rippleCanvas.style.transition = 'opacity 0.8s ease'; // Slower transition for smoother fade
    
    console.log(`Ripple canvas positioned at ${rippleCanvas.style.left}, ${rippleCanvas.style.top} with dimensions ${rippleCanvas.width}x${rippleCanvas.height}`);
  }
  
  // Ripple animation
  function drawRipples() {
    console.log("Starting ripple animation");
    
    // Enhanced ripple configuration
    let ripples = [];
    const maxRipples = 12; // More ripples for a fuller effect
    const rippleSpeed = 1.2; // Slightly slower for more graceful movement
    
    // Center coordinates for the ripples to converge to
    const centerX = rippleCanvas.width / 2;
    const centerY = rippleCanvas.height / 2;
    
    function createRipple() {
      // Generate ripple at a random position on the edge of the canvas
      const angle = Math.random() * Math.PI * 2;
      // Make the distance slightly larger than needed to ensure no visible edge
      const distance = Math.max(rippleCanvas.width, rippleCanvas.height) * 0.6;
      
      // Start from edge based on angle
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // More subtle starting opacity and size variations
      const initialOpacity = 0.3 + Math.random() * 0.3;
      const width = 1 + Math.random() * 1.5;
      
      return {
        x: x,
        y: y,
        radius: distance,
        opacity: initialOpacity,
        speed: rippleSpeed + Math.random() * 0.3,
        width: width,
        hue: 200 + Math.random() * 10, // Narrower blue hue range for consistency
        saturation: 90 + Math.random() * 10, // High saturation
        lightness: 55 + Math.random() * 10, // Mid-high lightness for visibility
      };
    }
    
    // Initialize with more ripples at different stages
    for (let i = 0; i < 8; i++) {
      const ripple = createRipple();
      // Stagger initial positions
      const progress = i / 8;
      const dx = centerX - ripple.x;
      const dy = centerY - ripple.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      ripple.x += (dx / distance) * distance * progress;
      ripple.y += (dy / distance) * distance * progress;
      ripple.radius = Math.max(10, distance * (1 - progress * 0.8));
      ripple.opacity *= (1 - progress * 0.7);
      
      ripples.push(ripple);
    }
    
    // Pre-render a glow effect for performance
    const glowCanvas = document.createElement('canvas');
    const glowCtx = glowCanvas.getContext('2d');
    glowCanvas.width = 50;
    glowCanvas.height = 50;
    
    const glowGradient = glowCtx.createRadialGradient(25, 25, 0, 25, 25, 25);
    glowGradient.addColorStop(0, 'rgba(0, 163, 255, 0.3)');
    glowGradient.addColorStop(0.5, 'rgba(0, 163, 255, 0.1)');
    glowGradient.addColorStop(1, 'rgba(0, 163, 255, 0)');
    
    glowCtx.fillStyle = glowGradient;
    glowCtx.fillRect(0, 0, 50, 50);
    
    function draw() {
      // Clear canvas with fully transparent fill
      rippleCtx.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);
      
      // Create super-soft ambient glow at the center - very subtle
      const ambientGradient = rippleCtx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, rippleCanvas.width * 0.4
      );
      ambientGradient.addColorStop(0, 'rgba(0, 163, 255, 0.025)'); // Very subtle center
      ambientGradient.addColorStop(0.3, 'rgba(0, 163, 255, 0.015)'); // Extremely subtle middle
      ambientGradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Fully transparent outer edge
      
      rippleCtx.fillStyle = ambientGradient;
      rippleCtx.fillRect(0, 0, rippleCanvas.width, rippleCanvas.height);
      
      // Enable high-quality rendering
      rippleCtx.globalCompositeOperation = 'screen';
      rippleCtx.imageSmoothingEnabled = true;
      rippleCtx.imageSmoothingQuality = 'high';
      
      // Process each ripple with ultra-smooth transitions
      for (let i = 0; i < ripples.length; i++) {
        const ripple = ripples[i];
        
        // Skip very low opacity ripples for performance
        if (ripple.opacity < 0.02) {
          ripples[i] = createRipple();
          continue;
        }
        
        // Soften the glow based on distance from center
        const dx = centerX - ripple.x;
        const dy = centerY - ripple.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = Math.max(rippleCanvas.width, rippleCanvas.height) * 0.6;
        const distanceFactor = 1 - Math.min(1, distance / maxDistance);
        
        // Calculate the opacity fade based on distance
        const edgeFade = Math.min(1, distanceFactor * 3);
        const finalOpacity = ripple.opacity * edgeFade;
        
        // Only draw if it would be visible
        if (finalOpacity > 0.01) {
          // Enable glow effect
          rippleCtx.shadowColor = `hsla(${ripple.hue}, ${ripple.saturation}%, ${ripple.lightness}%, 0.3)`;
          rippleCtx.shadowBlur = 8; // Increased blur
          
          // Draw ripple with ultra-smooth transition
          rippleCtx.beginPath();
          rippleCtx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          
          // Use HSL for more consistent colors with controlled opacity
          const alpha = finalOpacity.toFixed(3);
          rippleCtx.strokeStyle = `hsla(${ripple.hue}, ${ripple.saturation}%, ${ripple.lightness}%, ${alpha})`;
          rippleCtx.lineWidth = ripple.width * (0.5 + distanceFactor * 0.5); // Thinner at edges
          rippleCtx.stroke();
          
          // Optional very subtle fill
          if (distance < rippleCanvas.width * 0.3) {
            const fillOpacity = finalOpacity * 0.03; // Very transparent fill
            rippleCtx.fillStyle = `hsla(${ripple.hue}, ${ripple.saturation}%, ${ripple.lightness}%, ${fillOpacity})`;
            rippleCtx.fill();
          }
        }
        
        // Update ripple position to move toward center - with refined easing
        // More sophisticated easing function for natural movement
        const easeInOutQuad = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const speedFactor = easeInOutQuad(Math.min(1, distance / (rippleCanvas.width * 0.3)));
        
        if (distance > 3) { // If not very close to center yet
          ripple.x += (dx / distance) * ripple.speed * speedFactor;
          ripple.y += (dy / distance) * ripple.speed * speedFactor;
        }
        
        // Update radius with ultra-smooth transition
        const targetRadius = Math.max(3, ripple.radius - (1 - distance / (rippleCanvas.width * 0.4)) * 3);
        ripple.radius = ripple.radius * 0.97 + targetRadius * 0.03; // Very gradual transition
        
        // Update opacity with sophisticated fade
        // Fade more quickly as it approaches center for clean convergence
        const approachFactor = Math.max(0, 1 - (distance / rippleCanvas.width));
        ripple.opacity = Math.max(0, ripple.opacity - 0.0015 - approachFactor * 0.003);
        
        // If opacity is very low or radius is very small, replace with new ripple
        if (ripple.opacity < 0.03 || ripple.radius < 5) {
          ripples[i] = createRipple();
        }
      }
      
      // Occasionally add new ripples if we have space
      if (ripples.length < maxRipples && Math.random() > 0.96) {
        ripples.push(createRipple());
      }
      
      // Reset shadow for next frame
      rippleCtx.shadowBlur = 0;
    }
    
    // Animation loop with timing control for consistent speed
    let lastTime = 0;
    function animate(timestamp) {
      // Skip frames if needed to maintain consistent animation speed
      if (!lastTime || timestamp - lastTime >= 16) { // ~60fps target
        draw();
        lastTime = timestamp;
      }
      
      if (isCanvasActive) {
        rippleAnimation = requestAnimationFrame(animate);
      }
    }
    
    // Start the animation loop
    rippleAnimation = requestAnimationFrame(animate);
  }
  
  // Start the ripple effect with a subtle fade-in
  function startRippleEffect() {
    console.log("Starting ripple effect");
    if (!rippleCanvas) {
      createRippleCanvas();
      // Initial state is transparent
      rippleCanvas.style.opacity = '0';
    }
    
    positionCanvas();
    
    if (!isCanvasActive) {
      isCanvasActive = true;
      
      // Ensure clean state before starting animation
      if (rippleCtx) {
        rippleCtx.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);
      }
      
      drawRipples();
      
      // Fade in the canvas gradually
      setTimeout(() => {
        rippleCanvas.style.opacity = '1';
      }, 10);
      
      // Update button style with subtle effect
      aboutBtn.classList.add('ripple-active');
    }
  }
  
  // Stop the ripple effect with a smooth fade-out
  function stopRippleEffect() {
    console.log("Stopping ripple effect");
    
    // Fade out animation for smooth transition
    if (rippleCanvas) {
      rippleCanvas.style.opacity = '0';
      
      // Wait for fade out to complete before removing
      setTimeout(() => {
        if (rippleAnimation) {
          cancelAnimationFrame(rippleAnimation);
          isCanvasActive = false;
        }
        
        if (rippleCanvas) {
          rippleCanvas.remove();
          rippleCanvas = null;
        }
      }, 800); // Longer timeout for smoother fade
    } else {
      if (rippleAnimation) {
        cancelAnimationFrame(rippleAnimation);
        isCanvasActive = false;
      }
    }
    
    // Reset button style
    aboutBtn.classList.remove('ripple-active');
  }
  
  // Handle window resize
  window.addEventListener('resize', function() {
    if (isCanvasActive) {
      positionCanvas();
    }
  });
  
  // Add event listeners to button
  if (aboutBtn) {
    console.log("Adding event listeners to about button");
    aboutBtn.addEventListener('mouseenter', startRippleEffect);
    aboutBtn.addEventListener('mouseleave', stopRippleEffect);
    aboutBtn.addEventListener('focus', startRippleEffect);
    aboutBtn.addEventListener('blur', stopRippleEffect);
  } else {
    console.error("About button not found!");
  }
});
