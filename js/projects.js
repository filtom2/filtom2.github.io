document.addEventListener('DOMContentLoaded', function() {
  // Respect the OS-level "reduce motion" accessibility setting
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Category filtering
  const categoryItems = document.querySelectorAll('.category-item');
  const projectCards = document.querySelectorAll('.project-card');
  const promptCommand = document.querySelector('.prompt-command');
  const cursor = document.querySelector('.prompt-cursor');
  let typingTimer = null;
  
  // Function to simulate typing effect for the terminal command
  function typeCommand(command) {
    clearTimeout(typingTimer);

    if (prefersReducedMotion) {
      promptCommand.textContent = command;
      return;
    }

    // Hide cursor during typing animation
    cursor.style.display = 'none';
    
    // Clear current command
    promptCommand.textContent = '';
    
    let i = 0;
    const typeSpeed = 50; // ms per character
    
    function type() {
      if (i < command.length) {
        promptCommand.textContent += command.charAt(i);
        i++;
        typingTimer = setTimeout(type, typeSpeed);
      } else {
        // Show cursor again after typing is complete
        cursor.style.display = 'block';
      }
    }
    
    type();
  }
  
  categoryItems.forEach(item => {
    item.addEventListener('click', function() {
      // Update active state
      categoryItems.forEach(cat => {
        cat.classList.remove('active');
        cat.setAttribute('aria-pressed', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-pressed', 'true');
      
      // Get selected category
      const category = this.getAttribute('data-category');
      
      // Update the terminal command based on selected category
      const newCommand = (category === 'all') ? 
        'ls -la' : 
        `ls -la ${category}/`;
      
      // Animate the command change
      typeCommand(newCommand);
      
      // Filter projects
      projectCards.forEach(card => {
        const categories = card.getAttribute('data-categories').split(' ');
        
        // Reset animations
        card.style.animation = 'none';
        card.offsetHeight; // Trigger reflow
        
        if (category === 'all' || categories.includes(category)) {
          // Show card with animation
          card.style.display = '';
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
  
  // Matrix background effect (skipped entirely for reduced-motion users)
  if (prefersReducedMotion) return;

  const canvas = document.getElementById('matrix-background');
  const ctx = canvas.getContext('2d');
  
  // Characters for matrix rain
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  
  // Matrix rain configuration
  const fontSize = 12;
  const columnWidth = 15;
  let drops = [];
  
  // Set canvas dimensions and (re)build one drop per column
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const columns = Math.ceil(canvas.width / columnWidth);
    drops = drops.slice(0, columns);
    while (drops.length < columns) {
      drops.push(Math.random() * -100); // Start above the canvas
    }
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
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
      const x = i * columnWidth + columnWidth / 2; // Center in column
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
});
