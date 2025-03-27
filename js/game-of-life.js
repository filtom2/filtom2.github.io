document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('game-of-life-canvas');
  if (!canvas) {
    console.warn("Game of Life canvas not found!");
    return;
  }
  
  const ctx = canvas.getContext('2d');
  const skillCards = document.querySelectorAll('.skill-card');
  
  // Set canvas to full screen
  function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    console.log("Canvas dimensions set to:", canvas.width, "x", canvas.height);
  }
  
  // Conway's Game of Life implementation
  class GameOfLife {
    constructor(width, height, cellSize, colorScheme) {
      this.width = width;
      this.height = height;
      this.cellSize = cellSize;
      this.colorScheme = colorScheme || {
        alive: 'rgba(0, 255, 87, 0.6)', // Primary color with transparency
        aliveAlt: 'rgba(0, 163, 255, 0.4)', // Secondary blue color
        background: 'rgba(10, 10, 10, 0)' // Transparent background
      };
      
      // Calculate grid dimensions
      this.cols = Math.ceil(this.width / this.cellSize);
      this.rows = Math.ceil(this.height / this.cellSize);
      
      // Initialize grid with empty cells
      this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
      
      // Initialize a next step grid
      this.nextGrid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
      
      // Store active seed patterns and their positions
      this.activePatterns = [];
    }
    
    // Reset the grid
    reset() {
      this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
      this.nextGrid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }
    
    // Add a predefined pattern at position
    addPattern(pattern, x, y, colorType = 'alive') {
      const patternDefs = {
        glider: [
          [0, 1, 0],
          [0, 0, 1],
          [1, 1, 1]
        ],
        lwss: [ // Lightweight spaceship
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
          [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
        ]
      };
      
      // Get the pattern definition
      const patternGrid = patternDefs[pattern] || patternDefs['glider'];
      
      // Calculate center position
      const patternHeight = patternGrid.length;
      const patternWidth = patternGrid[0].length;
      
      // Place the pattern, wrapping around edges
      for (let i = 0; i < patternHeight; i++) {
        for (let j = 0; j < patternWidth; j++) {
          const row = (y + i) % this.rows;
          const col = (x + j) % this.cols;
          
          // If cell is alive in pattern, add with color info
          if (patternGrid[i][j] === 1) {
            this.grid[row][col] = {
              alive: 1,
              color: colorType
            };
          }
        }
      }
      
      // Store active pattern info
      this.activePatterns.push({
        pattern,
        x, y,
        colorType,
        timestamp: Date.now()
      });
    }
    
    // Calculate the next generation
    nextGeneration() {
      // Apply Conway's rules
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          // Count live neighbors
          let neighbors = 0;
          let aliveNeighbors = [];
          
          // Check 8 adjacent cells
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              if (di === 0 && dj === 0) continue; // Skip self
              
              // Handle wrapping around edges
              const ni = (i + di + this.rows) % this.rows;
              const nj = (j + dj + this.cols) % this.cols;
              
              // Count alive neighbors and track their colors
              const cell = this.grid[ni][nj];
              if (cell && (cell.alive || cell === 1)) {
                neighbors++;
                if (cell.color) {
                  aliveNeighbors.push(cell.color);
                }
              }
            }
          }
          
          // Get current cell state
          const cell = this.grid[i][j];
          const currentState = cell && (cell.alive || cell === 1) ? 1 : 0;
          
          // Apply Conway's Game of Life rules
          if (currentState === 1 && (neighbors < 2 || neighbors > 3)) {
            // Cell dies
            this.nextGrid[i][j] = 0;
          } else if (currentState === 0 && neighbors === 3) {
            // Cell becomes alive, inherit color from neighbors
            const color = aliveNeighbors.length > 0 ? 
              aliveNeighbors[Math.floor(Math.random() * aliveNeighbors.length)] : 
              'alive';
            
            this.nextGrid[i][j] = {
              alive: 1,
              color: color
            };
          } else {
            // Cell stays the same
            this.nextGrid[i][j] = cell;
          }
        }
      }
      
      // Swap grids
      [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
    }
    
    // Render the grid to canvas
    render(ctx) {
      ctx.clearRect(0, 0, this.width, this.height);
      
      // Draw cells
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          const cell = this.grid[i][j];
          
          if (cell && (cell.alive || cell === 1)) {
            // Determine color
            const color = cell.color ? 
              this.colorScheme[cell.color] || this.colorScheme.alive : 
              this.colorScheme.alive;
            
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
    
    // Add random cells
    addRandomCells(count, colorType = 'alive') {
      for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * this.cols);
        const y = Math.floor(Math.random() * this.rows);
        
        this.grid[y][x] = {
          alive: 1,
          color: colorType
        };
      }
    }
  }
  
  // Initialize Game of Life
  let game;
  let animationId;
  let lastUpdate = 0;
  const updateInterval = 150; // Update every 150ms for a slower, more subtle animation
  
  function initGame() {
    setupCanvas();
    
    // Create Game of Life with 10px cells
    game = new GameOfLife(canvas.width, canvas.height, 10, {
      alive: 'rgba(0, 255, 87, 0.15)',
      aliveAlt: 'rgba(0, 163, 255, 0.12)',
      background: 'rgba(10, 10, 10, 0)'
    });
    
    // Add some initial patterns around the page
    const margin = 100;
    
    // Add random patterns to create ambient life
    const patterns = ['glider', 'lwss', 'pulsar'];
    
    for (let i = 0; i < 5; i++) {
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      const x = margin + Math.floor(Math.random() * (canvas.width - margin * 2) / 10);
      const y = margin + Math.floor(Math.random() * (canvas.height - margin * 2) / 10);
      const colorType = Math.random() > 0.5 ? 'alive' : 'aliveAlt';
      
      game.addPattern(pattern, x, y, colorType);
    }
    
    // Add some random cells for diversity
    game.addRandomCells(canvas.width / 20);
    
    // Start the animation loop
    animate();
    console.log("Game of Life initialized with grid size:", game.cols, "x", game.rows);
  }
  
  function animate(timestamp = 0) {
    animationId = requestAnimationFrame(animate);
    
    // Throttle updates for performance
    if (timestamp - lastUpdate > updateInterval) {
      game.nextGeneration();
      game.render(ctx);
      lastUpdate = timestamp;
      
      // Remove patterns that have been active too long
      const now = Date.now();
      game.activePatterns = game.activePatterns.filter(pattern => {
        return now - pattern.timestamp < 30000; // 30 seconds lifetime
      });
    }
  }
  
  // Handle skill card interactions
  function setupSkillInteractions() {
    if (skillCards.length === 0) {
      console.warn("No skill cards found for Game of Life interaction");
    }
    
    skillCards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        if (!game) return;
        
        // Reset .active class on all cards
        skillCards.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        
        // Get skill data
        const skillLevel = parseInt(this.getAttribute('data-skill-level') || 80);
        const seedPattern = this.getAttribute('data-seed-pattern') || 'glider';
        
        // Convert skill card position to grid coordinates
        const rect = this.getBoundingClientRect();
        const x = Math.floor((rect.left + rect.width / 2) / game.cellSize);
        const y = Math.floor((rect.top + rect.height / 2) / game.cellSize);
        
        // Add the pattern with a color based on skill level
        const colorType = skillLevel > 85 ? 'alive' : 'aliveAlt';
        game.addPattern(seedPattern, x, y, colorType);
        
        // Scale pattern density based on skill level
        const randomCells = Math.floor(skillLevel / 10);
        game.addRandomCells(randomCells, colorType);
      });
    });
  }
  
  // Handle window resize
  window.addEventListener('resize', function() {
    setupCanvas();
    
    if (game) {
      // Create new game with the new dimensions
      const oldGame = game;
      game = new GameOfLife(canvas.width, canvas.height, 10, oldGame.colorScheme);
      
      // Copy existing patterns
      oldGame.activePatterns.forEach(pattern => {
        game.addPattern(pattern.pattern, pattern.x, pattern.y, pattern.colorType);
      });
      
      // Add some random cells for diversity
      game.addRandomCells(canvas.width / 30);
    }
  });
  
  // Initialize the game with a slight delay to ensure DOM is fully ready
  setTimeout(() => {
    initGame();
    setupSkillInteractions();
    console.log("Game of Life setup complete");
  }, 100);
});
