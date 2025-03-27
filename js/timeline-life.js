document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('life-evolution-canvas');
  if (!canvas) {
    console.warn("Timeline life evolution canvas not found!");
    return;
  }
  
  const ctx = canvas.getContext('2d');
  const timelineEvents = document.querySelectorAll('.timeline-event');
  
  if (timelineEvents.length === 0) {
    console.warn("No timeline events found!");
  }
  
  // Set canvas dimensions
  function updateCanvasDimensions() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  updateCanvasDimensions();
  
  // Game of Life evolution class
  class LifeEvolution {
    constructor(width, height, cellSize) {
      this.width = width;
      this.height = height;
      this.cellSize = cellSize;
      this.cols = Math.floor(width / cellSize);
      this.rows = Math.floor(height / cellSize);
      this.currentGrid = this.createEmptyGrid();
      this.nextGrid = this.createEmptyGrid();
      this.evolutionSpeed = 150; // ms between generations
      this.evolutionTimer = null;
      this.activePatterns = [];
      this.age = 0; // Current evolution age for visual effects
      
      // Initialize patterns dictionary
      this.patterns = {
        glider: [
          [0, 1, 0],
          [0, 0, 1],
          [1, 1, 1]
        ],
        lwss: [
          [0, 1, 0, 0, 1],
          [1, 0, 0, 0, 0],
          [1, 0, 0, 0, 1],
          [1, 1, 1, 1, 0]
        ],
        pulsar: [
          [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
          [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
          [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
          [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0]
        ],
        custom: [
          [0, 1, 0, 1, 0],
          [1, 0, 1, 0, 1],
          [1, 0, 0, 0, 1],
          [0, 1, 0, 1, 0],
          [0, 0, 1, 0, 0]
        ]
      };
    }
    
    createEmptyGrid() {
      return Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }
    
    resetGrid() {
      this.currentGrid = this.createEmptyGrid();
      this.nextGrid = this.createEmptyGrid();
      this.age = 0;
    }
    
    // Add a pattern at specific coordinates
    addPattern(patternName, x, y, intensity = 1) {
      const pattern = this.patterns[patternName] || this.patterns.glider;
      
      const rows = pattern.length;
      const cols = pattern[0].length;
      
      // Center the pattern on x, y
      const startRow = Math.floor(y - rows / 2);
      const startCol = Math.floor(x - cols / 2);
      
      // Place the pattern with wrapping
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (pattern[i][j] === 1) {
            const row = (startRow + i + this.rows) % this.rows;
            const col = (startCol + j + this.cols) % this.cols;
            this.currentGrid[row][col] = intensity;
          }
        }
      }
      
      // Store the active pattern for reference
      this.activePatterns.push({
        name: patternName,
        x, y,
        timestamp: Date.now()
      });
    }
    
    // Calculate the next generation using Conway's rules
    calculateNextGeneration() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          // Count live neighbors (with wrapping)
          let liveNeighbors = 0;
          
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              if (di === 0 && dj === 0) continue;
              
              const ni = (i + di + this.rows) % this.rows;
              const nj = (j + dj + this.cols) % this.cols;
              
              if (this.currentGrid[ni][nj] > 0) {
                liveNeighbors++;
              }
            }
          }
          
          // Apply Conway's Game of Life rules
          if (this.currentGrid[i][j] > 0) {
            // Cell is alive
            if (liveNeighbors < 2 || liveNeighbors > 3) {
              // Cell dies
              this.nextGrid[i][j] = 0;
            } else {
              // Cell survives with slight age effect
              this.nextGrid[i][j] = Math.min(1, this.currentGrid[i][j] * 0.99);
            }
          } else {
            // Cell is dead
            if (liveNeighbors === 3) {
              // Cell becomes alive
              this.nextGrid[i][j] = 0.8 + Math.random() * 0.2; // Some variability in new cells
            } else {
              this.nextGrid[i][j] = 0;
            }
          }
        }
      }
      
      // Swap grids
      [this.currentGrid, this.nextGrid] = [this.nextGrid, this.currentGrid];
      this.age++;
    }
    
    // Render the current state to canvas
    render(ctx) {
      ctx.clearRect(0, 0, this.width, this.height);
      
      // Color scheme based on current age
      const baseHue = (this.age % 360) * 0.05; // Slow color rotation
      
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          const cellValue = this.currentGrid[i][j];
          
          if (cellValue > 0) {
            // Calculate cell color based on value and age
            const alpha = cellValue * 0.2; // Adjust for subtle appearance
            const hue = (baseHue + cellValue * 30) % 360;
            
            // Use different color schemes based on age
            let color;
            if (this.age % 300 < 150) {
              // Green matrix theme
              color = `hsla(${120 + hue}, 100%, 50%, ${alpha})`;
            } else {
              // Blue theme
              color = `hsla(${210 + hue}, 100%, 60%, ${alpha})`;
            }
            
            ctx.fillStyle = color;
            ctx.fillRect(
              j * this.cellSize, 
              i * this.cellSize, 
              this.cellSize, 
              this.cellSize
            );
          }
        }
      }
    }
    
    // Start evolution
    start() {
      if (this.evolutionTimer) return;
      
      this.evolutionTimer = setInterval(() => {
        this.calculateNextGeneration();
      }, this.evolutionSpeed);
    }
    
    // Stop evolution
    stop() {
      if (this.evolutionTimer) {
        clearInterval(this.evolutionTimer);
        this.evolutionTimer = null;
      }
    }
    
    // Add random cells for more organic feel
    seed(count = 100) {
      for (let i = 0; i < count; i++) {
        const row = Math.floor(Math.random() * this.rows);
        const col = Math.floor(Math.random() * this.cols);
        this.currentGrid[row][col] = 0.5 + Math.random() * 0.5;
      }
    }
  }
  
  // Initialize the Game of Life
  let lifeEvolution;
  let animationId = null;
  let visibleEvents = new Set(); // Track which events are in viewport
  
  function initEvolution() {
    if (lifeEvolution) {
      lifeEvolution.stop();
    }
    
    // Create a new evolution with slightly larger cells
    lifeEvolution = new LifeEvolution(canvas.width, canvas.height, 12);
    
    // Add some initial random cells
    lifeEvolution.seed(50);
    
    // Add patterns for events currently in viewport
    updateVisibleEvents();
    
    // Start the evolution
    lifeEvolution.start();
    
    // Start the rendering loop
    if (!animationId) {
      animationFunction();
    }
  }
  
  // Animation function for rendering
  function animationFunction() {
    if (!lifeEvolution) return;
    lifeEvolution.render(ctx);
    animationId = requestAnimationFrame(animationFunction);
  }
  
  // Check which events are in viewport and update patterns
  function updateVisibleEvents() {
    if (!lifeEvolution) return;
    
    const newVisibleEvents = new Set();
    
    timelineEvents.forEach(event => {
      const rect = event.getBoundingClientRect();
      
      // Check if event is in viewport
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const eventId = event.getAttribute('data-year');
        newVisibleEvents.add(eventId);
        
        // If this is newly visible, add its pattern
        if (!visibleEvents.has(eventId)) {
          const pattern = event.getAttribute('data-pattern') || 'glider';
          
          // Convert event position to grid coordinates
          const x = Math.floor((rect.left + rect.width / 2) / lifeEvolution.cellSize);
          const y = Math.floor((rect.top + rect.height / 2) / lifeEvolution.cellSize);
          
          // Add the pattern
          lifeEvolution.addPattern(pattern, x, y);
          
          // Highlight the event
          event.classList.add('highlight');
          setTimeout(() => event.classList.remove('highlight'), 1000);
        }
      }
    });
    
    // Update the set of visible events
    visibleEvents = newVisibleEvents;
  }
  
  // Handle window resize
  window.addEventListener('resize', function() {
    updateCanvasDimensions();
    initEvolution();
  });
  
  // Handle scrolling to update patterns
  window.addEventListener('scroll', debounce(updateVisibleEvents, 100));
  
  // Utility function for debouncing
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
  
  // Initialize the timeline life evolution
  setTimeout(initEvolution, 100); // Small delay to ensure DOM is ready
});
