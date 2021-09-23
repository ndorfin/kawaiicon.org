const scrollToC = event => {
    event.preventDefault();
  
    let modifier;
  
    if (window.innerWidth <= 768) {
      modifier = ".mobile";
    } else {
      modifier = ".desktop";
    }
  
    const container = document.querySelector(`${modifier} #main`);
    const href = event.target.getAttribute('href');
    const target = document.querySelector(`${modifier} ${href}`);
  
    container.scrollTop = target.offsetTop - container.offsetTop;
  };
  
  const mobileNav = () => {
    const mobileNavToggle = document.querySelector("#mobile-nav-toggle");
  
    mobileNavToggle.addEventListener('click', function(event) {
      const menu = document.querySelector("#mobile-nav");
      const element = event.target
      const isHidden = menu.classList.contains('hidden');
      const openMenu = document.querySelector("#open-menu");
      const closeMenu = document.querySelector("#close-menu");
  
      if (isHidden) {
        menu.classList.remove('hidden');
        closeMenu.classList.remove('hidden');
        openMenu.classList.add('hidden');
      } else {
        menu.classList.add('hidden');
        closeMenu.classList.add('hidden');
        openMenu.classList.remove('hidden');
      }
    });
  };
  
  const toggleMobileLayout = () => {
    const mobileLayoutSize = 768;
    const main = document.querySelector("#main")
  
    const mobileTarget = document.querySelector("#mobile-layout-target")
    const mobileSizeClassList = "color-khaki bg-black p-6 overflow-y-scroll"
  
    const fullSizeTarget = document.querySelector("#full-layout-target")
    const fullSizeClasslist = "rounded-xs color-khaki bg-black w-full auto p-5 overflow-y-scroll"
  
    if (window.innerWidth <= mobileLayoutSize) {
      mobileTarget.appendChild(main)
      main.classList = mobileSizeClassList
    } else {
      fullSizeTarget.appendChild(main)
      main.classList = fullSizeClasslist
    }
  }
  
  const mobileLayoutToggler = () => {
    toggleMobileLayout();
  
    window.addEventListener('resize', toggleMobileLayout);
  }
  
  document.addEventListener('DOMContentLoaded', function () {
    mobileNav();
    mobileLayoutToggler();
  
    document.querySelectorAll('#markdown-toc a').forEach(link => {
      link.addEventListener('click', scrollToC)
    });
  });
  
  // boids
  // Size of canvas. These get updated to fill the whole browser.
  //
  let width = 0;
  let height = 0;
  
  const numBoids = 50;
  const visualRange = 75;
  
  var boids = [];
  
  function initBoids() {
    for (var i = 0; i < numBoids; i += 1) {
      boids[boids.length] = {
        x: Math.random() * width,
        y: Math.random() * height,
        dx: Math.random() * 10 - 5,
        dy: Math.random() * 10 - 5,
        history: [],
      };
    }
  }
  
  function distance(boid1, boid2) {
    return Math.sqrt(
      (boid1.x - boid2.x) * (boid1.x - boid2.x) +
        (boid1.y - boid2.y) * (boid1.y - boid2.y),
    );
  }
  
  // TODO: This is naive and inefficient.
  function nClosestBoids(boid, n) {
    // Make a copy
    const sorted = boids.slice();
    // Sort the copy by distance from `boid`
    sorted.sort((a, b) => distance(boid, a) - distance(boid, b));
    // Return the `n` closest
    return sorted.slice(1, n + 1);
  }
  
  // Called initially and whenever the window resizes to update the canvas
  // size and width/height variables.
  function sizeCanvas() {
    const canvas = document.getElementById("boids");
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  
  // Constrain a boid to within the window. If it gets too close to an edge,
  // nudge it back in and reverse its direction.
  function keepWithinBounds(boid) {
    const margin = 200;
    const turnFactor = 1;
  
    if (boid.x < margin) {
      boid.dx += turnFactor;
    }
    if (boid.x > width - margin) {
      boid.dx -= turnFactor
    }
    if (boid.y < margin) {
      boid.dy += turnFactor;
    }
    if (boid.y > height - margin) {
      boid.dy -= turnFactor;
    }
  }
  
  // Find the center of mass of the other boids and adjust velocity slightly to
  // point towards the center of mass.
  function flyTowardsCenter(boid) {
    const centeringFactor = 0.005; // adjust velocity by this %
  
    let centerX = 0;
    let centerY = 0;
    let numNeighbors = 0;
  
    for (let otherBoid of boids) {
      if (distance(boid, otherBoid) < visualRange) {
        centerX += otherBoid.x;
        centerY += otherBoid.y;
        numNeighbors += 1;
      }
    }
  
    if (numNeighbors) {
      centerX = centerX / numNeighbors;
      centerY = centerY / numNeighbors;
  
      boid.dx += (centerX - boid.x) * centeringFactor;
      boid.dy += (centerY - boid.y) * centeringFactor;
    }
  }
  
  // Move away from other boids that are too close to avoid colliding
  function avoidOthers(boid) {
    const minDistance = 20; // The distance to stay away from other boids
    const avoidFactor = 0.05; // Adjust velocity by this %
    let moveX = 0;
    let moveY = 0;
    for (let otherBoid of boids) {
      if (otherBoid !== boid) {
        if (distance(boid, otherBoid) < minDistance) {
          moveX += boid.x - otherBoid.x;
          moveY += boid.y - otherBoid.y;
        }
      }
    }
  
    boid.dx += moveX * avoidFactor;
    boid.dy += moveY * avoidFactor;
  }
  
  // Find the average velocity (speed and direction) of the other boids and
  // adjust velocity slightly to match.
  function matchVelocity(boid) {
    const matchingFactor = 0.05; // Adjust by this % of average velocity
  
    let avgDX = 0;
    let avgDY = 0;
    let numNeighbors = 0;
  
    for (let otherBoid of boids) {
      if (distance(boid, otherBoid) < visualRange) {
        avgDX += otherBoid.dx;
        avgDY += otherBoid.dy;
        numNeighbors += 1;
      }
    }
  
    if (numNeighbors) {
      avgDX = avgDX / numNeighbors;
      avgDY = avgDY / numNeighbors;
  
      boid.dx += (avgDX - boid.dx) * matchingFactor;
      boid.dy += (avgDY - boid.dy) * matchingFactor;
    }
  }
  
  // Speed will naturally vary in flocking behavior, but real animals can't go
  // arbitrarily fast.
  function limitSpeed(boid) {
    const speedLimit = 10;
  
    const speed = Math.sqrt(boid.dx * boid.dx + boid.dy * boid.dy);
    if (speed > speedLimit) {
      boid.dx = (boid.dx / speed) * speedLimit;
      boid.dy = (boid.dy / speed) * speedLimit;
    }
  }
  
  function drawBoid(ctx, boid) {
    const angle = Math.atan2(boid.dy, boid.dx);
    ctx.translate(boid.x, boid.y);
    ctx.rotate(angle);
    ctx.translate(-boid.x, -boid.y);
    ctx.fillText("ðŸš€", boid.x, boid.y)
    ctx.setTransform(2, 0, 0, 2, 0, 0);
  }
  
  // Main animation loop
  function animationLoop() {
    // Update each boid
    for (let boid of boids) {
      // Update the velocities according to each rule
      flyTowardsCenter(boid);
      avoidOthers(boid);
      matchVelocity(boid);
      limitSpeed(boid);
      keepWithinBounds(boid);
  
      // Update the position based on the current velocity
      boid.x += boid.dx;
      boid.y += boid.dy;
      boid.history.push([boid.x, boid.y])
      boid.history = boid.history.slice(-50);
    }
  
    // Clear the canvas and redraw all the boids in their current positions
    const ctx = document.getElementById("boids").getContext("2d");
    ctx.clearRect(0, 0, width, height);
    for (let boid of boids) {
      drawBoid(ctx, boid);
    }
  
    // Schedule the next frame
    window.requestAnimationFrame(animationLoop);
  }
  
  window.onload = () => {
    // Make sure the canvas always fills the whole window
    // window.addEventListener("resize", sizeCanvas, false);
    // sizeCanvas();
  
    // Randomly distribute the boids to start
    // initBoids();
  
    // Schedule the main animation loop
    // window.requestAnimationFrame(animationLoop);
  };