document.addEventListener('DOMContentLoaded', function() {
  // Category filtering
  const categoryItems = document.querySelectorAll('.category-item');
  const projectCards = document.querySelectorAll('.project-card');
  
  categoryItems.forEach(item => {
    item.addEventListener('click', function() {
      // Update active state
      categoryItems.forEach(cat => cat.classList.remove('active'));
      this.classList.add('active');
      
      // Get selected category
      const category = this.getAttribute('data-category');
      
      // Filter projects
      projectCards.forEach(card => {
        const categories = card.getAttribute('data-categories').split(' ');
        
        // Reset animations
        card.style.animation = 'none';
        card.offsetHeight; // Trigger reflow
        
        if (category === 'all' || categories.includes(category)) {
          // Show card with animation
          card.style.display = 'block';
          card.style.animation = 'fadeInUp 0.5s forwards';
          
          // Random delay for matrix effect
          const delay = Math.random() * 0.3;
          card.style.animationDelay = `${delay}s`;
        } else {
          // Hide card
          card.style.display = 'none';
        }
      });
    });
  });
  
  // Terminal cursor blinking effect
  const cursor = document.querySelector('.prompt-cursor');
  setInterval(() => {
    cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
  }, 600);
  
  // Matrix background effect
  const canvas = document.getElementById('matrix-background');
  const ctx = canvas.getContext('2d');
  
  // Set canvas dimensions
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Characters for matrix rain
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  
  // Matrix rain configuration
  const fontSize = 12;
  const columns = Math.floor(canvas.width / 12); // 12px per column
  const drops = [];
  
  // Initialize drops array
  for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100; // Start above the canvas
  }
  
  // Drawing function
  function drawMatrix() {
    // Semi-transparent black background for trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Green characters
    ctx.fillStyle = 'rgba(0, 255, 87, 0.3)';
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    
    // Draw characters
    for (let i = 0; i < drops.length; i++) {
      // Random character
      const text = chars.charAt(Math.floor(Math.random() * chars.length));
      const x = i * 15 + 15/2; // Center in column
      const y = drops[i] * 15;
      
      if (Math.random() > 0.3) { // Only draw some characters for subtlety
        // Randomly highlight some characters
        if (Math.random() > 0.99) {
          ctx.fillStyle = 'rgba(0, 255, 87, 0.9)';
          ctx.fillText(text, x, y);
          ctx.fillStyle = 'rgba(0, 255, 87, 0.3)';
        } else {
          ctx.fillText(text, x, y);
        }
      }
      
      // Move drop down
      drops[i] += 0.2; // Slow speed
      
      // Reset when off-screen
      if (drops[i] * 15 > canvas.height && Math.random() > 0.99) {
        drops[i] = 0;
      }
    }
    
    requestAnimationFrame(drawMatrix);
  }
  
  // Start animation
  drawMatrix();
  
  // Hover effects for project cards
  projectCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      // Additional hover effect as needed
    });
  });
});
