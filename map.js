/* Map helpers */
Game.prototype.generateMap = function(){
  // Generate Slay the Spire style branching map
  this.mapNodes = [];
  const nodesPerFloor = [1, 3, 4, 4, 3, 4, 4, 3, 4, 4, 3, 4, 3, 2, 1]; // Branching pattern
  
  let nodeId = 0;
  for(let floor = 0; floor < this.floors; floor++){
    const nodeCount = nodesPerFloor[floor];
    const floorNodes = [];
    
    for(let i = 0; i < nodeCount; i++){
      let type;
      if(floor === 0){
        type = 'combat'; // Start node
      } else if(floor === this.floors - 1){
        type = 'boss'; // Final boss
      } else if(floor % 4 === 0 && floor > 0){
        type = 'rest'; // Rest nodes every 4 floors
      } else {
        // Weighted random for other floors
        const roll = Math.random();
        if(roll > 0.85) type = 'elite';
        else if(roll > 0.70) type = 'treasure';
        else if(roll > 0.60) type = 'rest';
        else type = 'combat';
      }
      
      floorNodes.push({
        id: nodeId++,
        floor: floor,
        position: i,
        type: type,
        visited: false,
        locked: floor > 0,
        connections: []
      });
    }
    
    this.mapNodes.push(floorNodes);
  }
  
  // Create connections between floors
  for(let floor = 0; floor < this.floors - 1; floor++){
    const currentFloor = this.mapNodes[floor];
    const nextFloor = this.mapNodes[floor + 1];
    
    currentFloor.forEach((node, idx) => {
      // Each node connects to 1-3 nodes in next floor
      const nextFloorSize = nextFloor.length;
      
      if(nextFloorSize === 1){
        // If next floor has 1 node, all connect to it
        node.connections.push(nextFloor[0].id);
      } else {
        // Connect to nearby nodes in next floor
        const spread = nextFloorSize > 3 ? 2 : 1;
        const center = Math.floor((idx / currentFloor.length) * nextFloorSize);
        
        for(let i = Math.max(0, center - spread); i <= Math.min(nextFloorSize - 1, center + spread); i++){
          if(Math.random() > 0.3 || node.connections.length === 0){
            node.connections.push(nextFloor[i].id);
          }
        }
      }
    });
  }
  
  // Unlock first floor nodes
  this.mapNodes[0].forEach(node => node.locked = false);
};

Game.prototype.renderMap = function(){
  const svg = $("mapSvg");
  svg.innerHTML = '';
  
  const width = 800;
  const height = 600;
  const floorHeight = height / (this.floors + 1);
  
  // Draw connections first (so they appear behind nodes)
  this.mapNodes.forEach((floor, floorIdx) => {
    floor.forEach(node => {
      const x1 = (node.position + 1) * (width / (floor.length + 1));
      const y1 = (floorIdx + 1) * floorHeight;
      
      node.connections.forEach(connId => {
        const targetNode = this.findNodeById(connId);
        if(targetNode){
          const targetFloor = this.mapNodes[targetNode.floor];
          const x2 = (targetNode.position + 1) * (width / (targetFloor.length + 1));
          const y2 = (targetNode.floor + 1) * floorHeight;
          
          // Use simple straight lines instead of curves
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', x1);
          line.setAttribute('y1', y1);
          line.setAttribute('x2', x2);
          line.setAttribute('y2', y2);
          line.setAttribute('class', `map-path ${!targetNode.locked ? 'active' : ''}`);
          svg.appendChild(line);
        }
      });
    });
  });
  
  // Draw nodes
  this.mapNodes.forEach((floor, floorIdx) => {
    floor.forEach(node => {
      const x = (node.position + 1) * (width / (floor.length + 1));
      const y = (floorIdx + 1) * floorHeight;
      
      // Node group
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', `map-node ${node.locked ? 'locked' : ''} ${node.visited ? 'visited' : ''} ${this.currentNode === node ? 'current' : ''}`);
      g.setAttribute('data-node-id', node.id);
      
      // Node circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', 20);
      circle.setAttribute('class', `node-circle ${node.type}`);
      g.appendChild(circle);
      
      // Node icon
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      icon.setAttribute('x', x);
      icon.setAttribute('y', y);
      icon.setAttribute('class', 'node-icon');
      icon.textContent = this.getNodeIcon(node.type);
      g.appendChild(icon);
      
      // Click handler
      if(!node.locked){
        g.style.cursor = 'pointer';
        g.addEventListener('click', () => this.selectNode(node));
        
        // Tooltip handlers
        g.addEventListener('mouseenter', () => this.showMapTooltip(node, x, y));
        g.addEventListener('mouseleave', () => this.hideMapTooltip());
      }
      
      svg.appendChild(g);
    });
  });
};

Game.prototype.showMapTooltip = function(node, x, y) {
  const tooltip = $("mapTooltip");
  const labels = {
    combat: 'Combat',
    elite: 'Elite Enemy',
    rest: 'Rest Site',
    treasure: 'Treasure',
    boss: 'Boss Fight'
  };
  tooltip.textContent = labels[node.type] || node.type;
  tooltip.classList.add('show');
  
  // Position tooltip near the node
  const container = $("mapContainer");
  const rect = container.getBoundingClientRect();
  tooltip.style.left = (x + 30) + 'px';
  tooltip.style.top = (y - 10) + 'px';
};

Game.prototype.hideMapTooltip = function() {
  const tooltip = $("mapTooltip");
  tooltip.classList.remove('show');
};

Game.prototype.getNodeIcon = function(type){
  const icons = {
    combat: '⚔️',
    elite: '👑',
    rest: '🔥',
    treasure: '💰',
    boss: '💀'
  };
  return icons[type] || '?';
};

Game.prototype.findNodeById = function(id){
  for(let floor of this.mapNodes){
    for(let node of floor){
      if(node.id === id) return node;
    }
  }
  return null;
};

Game.prototype.selectNode = function(node){
  if(node.locked) return;
  
  this.currentNode = node;
  node.visited = true;
  this.currentFloor = node.floor;
  
  // Hide map, show appropriate room
  $("mapView").classList.add('hidden');
  
  // Unlock connected nodes
  node.connections.forEach(connId => {
    const targetNode = this.findNodeById(connId);
    if(targetNode) targetNode.locked = false;
  });
  
  // Handle room type
  this.enterRoom(node.type);
};

Game.prototype.enterRoom = function(type){
  $("roomIndex").textContent = this.currentFloor + 1;
  
  if(type === 'combat' || type === 'elite' || type === 'boss'){
    this.startCombat(type);
  } else if(type === 'rest'){
    this.enterRest();
  } else if(type === 'treasure'){
    this.enterTreasure();
  }
};

Game.prototype.showMap = function(){
  if(!this.mapNodes.length){
    this.generateMap();
  }
  $("mapView").classList.remove('hidden');
  $("dungeon").classList.add('hidden');
  $("combat").classList.add('hidden');
  this.renderMap();
};

Game.prototype.nextRoom = function(){
  if(this.currentFloor === -1 || !this.mapNodes.length){
    // Start run - generate map
    this.generateMap();
    this.currentFloor = -1;
    this.startTime = Date.now();
    this.roomsCleared = 0;
    this.enemiesDefeated = 0;
    this.showMap();
    return;
  }
  // After completing a room, show map for next choice
  this.showMap();
};

Game.prototype.enterRest = function(){
  updateUI();
  this.openCampModal();
};

Game.prototype.enterTreasure = function(){
  // Drop treasure loot
  const treasureLoot = generateLoot('treasure');
  if(treasureLoot.length > 0) {
    this.log(`Found ${treasureLoot.length} treasure item(s)!`);
    this.showLootDrop(treasureLoot);
  } else {
    // Fallback to shop if no items dropped
    this.showShop();
  }
};
