document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('graph-background');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 80;
    const connectionDistance = 150;
    const mouseRadius = 150;
    const particleRadius = 2;
    
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
  
    // Handle window resize
    function resizeCanvas() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }
  
    window.addEventListener('resize', function() {
      resizeCanvas();
      initParticles();
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
  
      update() {
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
  
        // Draw particle
        this.draw();
      }
    }
  
    // Initialize particles
    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
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
        if (mouse.x && mouse.y) {
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
  
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, width, height);
  
      particles.forEach(particle => {
        particle.update();
      });
  
      connectParticles();
    }
  
    // Start the animation
    resizeCanvas();
    initParticles();
    animate();
  });