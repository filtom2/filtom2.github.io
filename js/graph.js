document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('graph-background');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const maxParticles = 80;
    const areaPerParticle = 14000; // px² per particle, keeps density similar across screen sizes
    const connectionDistance = 150;
    const mouseRadius = 150;
    const particleRadius = 2;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Mouse position
    const mouse = {
      x: null,
      y: null,
      radius: mouseRadius
    };
  
    // Handle mouse movement
    document.addEventListener('mousemove', function(event) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    });

    document.addEventListener('mouseleave', function() {
      mouse.x = null;
      mouse.y = null;
    });
  
    // Handle window resize
    function resizeCanvas() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }

    // Fewer particles on small screens = far fewer connection checks on phones
    function targetParticleCount() {
      return Math.max(20, Math.min(maxParticles, Math.round((width * height) / areaPerParticle)));
    }
  
    let lastWidth = 0;
    window.addEventListener('resize', function() {
      resizeCanvas();

      // Mobile browsers fire resize when the URL bar shows/hides (height-only change).
      // Only rebuild on real width changes so the animation doesn't reset while scrolling.
      if (Math.abs(width - lastWidth) > 50) {
        lastWidth = width;
        initParticles();
      } else {
        particles.forEach(p => {
          p.x = Math.min(p.x, width - p.radius);
          p.y = Math.min(p.y, height - p.radius);
        });
      }

      if (prefersReducedMotion) renderFrame(false);
    });
  
    // Create a particle
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = particleRadius;
        this.color = 'rgba(0, 255, 87, 0.5)'; // Updated to match the neon green color
      }
  
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
  
      update(move = true) {
        if (move) {
          // Bounce off edges
          if (this.x + this.radius > width || this.x - this.radius < 0) {
            this.vx = -this.vx;
          }
          if (this.y + this.radius > height || this.y - this.radius < 0) {
            this.vy = -this.vy;
          }
    
          // Move particles
          this.x += this.vx;
          this.y += this.vy;
        }
  
        // Draw particle
        this.draw();
      }
    }
  
    // Initialize particles
    function initParticles() {
      particles = [];
      const count = targetParticleCount();
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }
  
    // Draw connections between particles
    function connectParticles() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
  
          if (distance < connectionDistance) {
            // Calculate opacity based on distance
            const opacity = 1 - (distance / connectionDistance);
            ctx.strokeStyle = `rgba(0, 255, 87, ${opacity * 0.3})`; // Updated to match the neon green color
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
  
        // Connect to mouse position if close enough
        if (!prefersReducedMotion && mouse.x !== null && mouse.y !== null) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
  
          if (distance < mouse.radius) {
            // Calculate opacity based on distance
            const opacity = 1 - (distance / mouse.radius);
            ctx.strokeStyle = `rgba(0, 255, 87, ${opacity * 0.6})`; // Updated to match the neon green color
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    }
  
    function renderFrame(move = true) {
      ctx.clearRect(0, 0, width, height);
  
      particles.forEach(particle => {
        particle.update(move);
      });
  
      connectParticles();
    }

    // Animation loop
    function animate() {
      renderFrame();
      requestAnimationFrame(animate);
    }
  
    // Start the animation
    resizeCanvas();
    lastWidth = width;
    initParticles();

    if (prefersReducedMotion) {
      // Static constellation, no movement or mouse-follow
      mouse.x = mouse.y = null;
      renderFrame(false);
    } else {
      animate();
    }
  });