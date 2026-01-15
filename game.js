// Mini DeckRPG prototype
// Save these files together and open index.html

/* Game State */
class Deck {
  constructor(cards){
    this.drawPile = [...cards];
    this.discard = [];
    this.hand = [];
    this.shuffle();
  }
  shuffle(){
    for(let i=this.drawPile.length-1;i>0;i--){
      const j = rand(i+1);
      [this.drawPile[i], this.drawPile[j]] = [this.drawPile[j], this.drawPile[i]];
    }
  }
  draw(n=1){
    while(n-- > 0){
      if(this.drawPile.length===0){
        if(this.discard.length===0) return null;
        this.drawPile = this.discard.splice(0);
        this.shuffle();
      }
      const c = this.drawPile.shift();
      this.hand.push(c);
    }
  }
  playCard(index){
    const [c] = this.hand.splice(index,1);
    this.discard.push(c);
    return c;
  }
  discardHand(){
    this.discard.push(...this.hand);
    this.hand = [];
  }
}

class Entity {
  constructor(name, hp, maxHp){
    this.name = name;
    this.hp = hp;
    this.maxHp = maxHp;
    this.block = 0;
  }
  takeDamage(amount){
    const mitigated = Math.max(0, amount - this.block);
    const usedBlock = Math.min(this.block, amount);
    this.block -= usedBlock;
    this.hp -= mitigated;
    return mitigated;
  }
  heal(amount){
    this.hp = clamp(this.hp + amount, 0, this.maxHp);
  }
}

class Game {
  constructor(){
    this.floors = 15; // Total floors including boss
    this.currentFloor = -1;
    this.currentNode = null;
    this.mapNodes = [];
    this.gold = 0;
    this.inventory = {
      helmet: null,
      leftHand: null,
      rightHand: null,
      necklace: null,
      armor: null,
      ring1: null,
      ring2: null,
      gloves: null,
      belt: null,
      boots: null
    };
    this.startTime = Date.now();
    this.roomsCleared = 0;
    this.enemiesDefeated = 0;
    this.setupUI();
    this.resetPlayer();
    this.makeDeck();
    this.log("Welcome to DeckRPG! Click Start Run to explore the map.");
    $("roomCount").textContent = this.floors;
  }

  setupUI(){
    $("nextRoomBtn").addEventListener('click', ()=> this.nextRoom());
    $("endTurn").addEventListener('click', ()=> this.endTurn());
    $("skipReward").addEventListener('click', ()=> this.skipReward());
    $("leaveShop").addEventListener('click', ()=> this.leaveShop());
    $("restartBtn").addEventListener('click', ()=> this.restart());
    $("closeLootBtn").addEventListener('click', ()=> this.closeLootModal());
    $("openInventoryBtn").addEventListener('click', ()=> this.openInventoryModal());
    $("closeInventoryBtn").addEventListener('click', ()=> this.closeInventoryModal());
    $("inventoryModal").addEventListener('click', (event) => {
      if(event.target.id === 'inventoryModal') {
        this.closeInventoryModal();
      }
    });
    this.updateInventoryUI();
  }

  resetPlayer(){
    this.player = new Entity("You", 50, 50);
    this.player.energy = 3;
    this.player.maxEnergy = 3;
    this.player.baseAttack = 0;
    this.player.bonusDraw = 0;
  }

  makeDeck(){
    // basic card set
    const cards = [];
    
    // populate starting deck: mostly strikes and defends
    for(let i=0;i<6;i++) cards.push(createCardWithEffect(CARD_POOL.common[0], this)); // Strike
    for(let i=0;i<4;i++) cards.push(createCardWithEffect(CARD_POOL.common[1], this)); // Defend
    cards.push(createCardWithEffect(CARD_POOL.uncommon[0], this)); // Heavy Strike
    cards.push(createCardWithEffect(CARD_POOL.uncommon[1], this)); // Heal

    this.deck = new Deck(cards);
    updateUI();
  }

  log(msg){
    const el = $("log");
    const p = document.createElement('div');
    p.textContent = msg;
    el.prepend(p);
  }

  generateMap(){
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
  }

  renderMap(){
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
  }

  showMapTooltip(node, x, y) {
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
  }

  hideMapTooltip() {
    const tooltip = $("mapTooltip");
    tooltip.classList.remove('show');
  }

  getNodeIcon(type){
    const icons = {
      combat: '⚔️',
      elite: '👑',
      rest: '🔥',
      treasure: '💰',
      boss: '💀'
    };
    return icons[type] || '?';
  }

  findNodeById(id){
    for(let floor of this.mapNodes){
      for(let node of floor){
        if(node.id === id) return node;
      }
    }
    return null;
  }

  selectNode(node){
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
  }

  enterRoom(type){
    $("roomIndex").textContent = this.currentFloor + 1;
    
    if(type === 'combat' || type === 'elite' || type === 'boss'){
      this.startCombat(type);
    } else if(type === 'rest'){
      this.enterRest();
    } else if(type === 'treasure'){
      this.enterTreasure();
    }
  }

  showMap(){
    $("mapView").classList.remove('hidden');
    $("dungeon").classList.add('hidden');
    $("combat").classList.add('hidden');
    this.renderMap();
  }

  nextRoom(){
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
  }

  enterRest(){
    // simple rest: restore some HP and draw and reshuffle one card
    const heal = Math.floor(this.player.maxHp * 0.2);
    this.player.heal(heal);
    this.log(`Rest: healed ${heal} HP.`);
    this.roomsCleared++;
    updateUI();
    // Auto-return to map after short delay
    setTimeout(() => this.showMap(), 1500);
  }

  enterTreasure(){
    // Drop treasure loot
    const treasureLoot = generateLoot('treasure');
    if(treasureLoot.length > 0) {
      this.log(`Found ${treasureLoot.length} treasure item(s)!`);
      this.showLootDrop(treasureLoot);
    } else {
      // Fallback to shop if no items dropped
      this.showShop();
    }
  }

  startCombat(type){
    $("combat").classList.remove('hidden');
    $("nextRoomBtn").disabled = true;
    
    let baseHp, baseAtk, enemyName;
    if(type === 'boss'){
      baseHp = 80 + rand(20);
      baseAtk = 12 + rand(5);
      enemyName = 'Boss Dragon';
    } else if(type === 'elite'){
      baseHp = 36 + rand(10);
      baseAtk = 8 + rand(4);
      enemyName = 'Elite Warrior';
    } else {
      baseHp = 20 + rand(12);
      baseAtk = 5 + rand(3);
      enemyName = 'Goblin';
    }
    
    this.enemy = new Entity(enemyName, baseHp, baseHp);
    this.enemy.atk = baseAtk;
    
    // Set Pokemon sprites using PokeAPI
    // Player sprite (Pikachu - #25)
    const playerSpriteId = 25;
    const playerSprite = $("playerSprite");
    playerSprite.style.backgroundImage = `url(https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${playerSpriteId}.png)`;
    
    // Enemy sprite - random Pokemon based on enemy type
    let enemySpriteId;
    if(type === 'boss'){
      // Boss uses legendary dragons
      const bossPokemon = [6, 149, 150, 383, 384, 483, 484, 487, 643, 644];
      enemySpriteId = bossPokemon[rand(bossPokemon.length)];
    } else if(type === 'elite'){
      // Elite enemies use legendary/mythical Pokemon
      enemySpriteId = ELITE_POKEMON_IDS[rand(ELITE_POKEMON_IDS.length)];
    } else {
      // Normal enemies use common Pokemon from curated list
      enemySpriteId = COMMON_POKEMON_IDS[rand(COMMON_POKEMON_IDS.length)];
    }
    const enemySprite = $("enemySprite");
    enemySprite.style.backgroundImage = `url(https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${enemySpriteId}.png)`;
    
    this.log(`Encountered ${this.enemy.name} (HP ${this.enemy.hp}, ATK ${this.enemy.atk})`);
    // reset block/energy and draw
    this.player.block = 0;
    this.player.energy = this.player.maxEnergy || 3;
    this.deck.discardHand(); // discard any leftover hand at new combat start
    // draw initial hand
    this.drawToFull();
    updateUI();
  }

  drawToFull(){
    // hand size 5 + bonus draw from equipment
    const handSize = 5 + (this.player.bonusDraw || 0);
    while(this.deck.hand.length < handSize){
      this.deck.draw(1);
    }
    this.log('Drew cards.');
    updateUI();
  }

  playCardFromHand(index){
    const card = this.deck.hand[index];
    if(!card) return;
    if(this.player.energy < card.cost){
      this.log('Not enough energy.');
      return;
    }
    this.player.energy -= card.cost;
    // play effect; provide references: game, owner, target
    // some cards target enemy, some affect owner
    try {
      card.play(this, this.player, this.enemy);
    } catch(e){
      // fallback
      this.log(`Played ${card.name}.`);
    }
    this.deck.playCard(index);
    // check enemy death
    if(this.enemy && this.enemy.hp <= 0){
      this.log(`${this.enemy.name} defeated!`);
      this.endCombat(true);
      return;
    }
    updateUI();
  }

  enemyTurn(){
    if(!this.enemy) return;
    const atk = this.enemy.atk + rand(3);
    const dmg = this.player.takeDamage(atk);
    this.log(`${this.enemy.name} attacks for ${atk} (${dmg} damage after block).`);
    if(this.player.hp <= 0){
      this.showGameOver();
      return;
    }
    updateUI();
  }

  endTurn(){
    // enemy acts
    this.enemyTurn();
    // refresh energy and draw a new hand
    if(this.enemy && this.enemy.hp > 0){
      this.player.energy = this.player.maxEnergy || 3;
      // discard hand after turn
      this.deck.discard.push(...this.deck.hand);
      this.deck.hand = [];
      this.drawToFull();
    }
    updateUI();
  }

  endCombat(victory){
    if(victory){
      const loot = 5 + rand(8);
      this.gold += loot;
      this.log(`Loot: +${loot} gold.`);
      updateUI();
      this.roomsCleared++;
      this.enemiesDefeated++;
      
      // Generate item drops based on enemy type
      const enemyType = this.currentNode ? this.currentNode.type : 'combat';
      const droppedItems = generateLoot(enemyType);
      
      // Check if boss was defeated
      if(this.currentNode && this.currentNode.type === 'boss'){
        this.showVictory();
        return;
      }
      
      // Show loot drops if any
      if(droppedItems.length > 0) {
        this.log(`${droppedItems.length} item(s) dropped!`);
        // Clean up combat first
        this.enemy = null;
        $("combat").classList.add('hidden');
        this.deck.discard.push(...this.deck.hand);
        this.deck.hand = [];
        updateUI();
        // Show loot modal
        this.showLootDrop(droppedItems);
        return; // Don't proceed to card rewards yet
      }
      
      // Show card rewards
      this.showCardRewards();
      return; // Don't proceed to next room yet
    } else {
      this.log('Fled or defeated.');
    }
    // clean up
    this.enemy = null;
    $("combat").classList.add('hidden');
    $("nextRoomBtn").disabled = false;
    $("playerArea").style.display = '';
    this.deck.discard.push(...this.deck.hand);
    this.deck.hand = [];
    updateUI();
  }

  showCardRewards(){
    $("combat").classList.add('hidden');
    $("reward").classList.remove('hidden');
    $("nextRoomBtn").disabled = true;
    
    // Generate 3 random cards to choose from
    const rewards = [];
    for(let i=0; i<3; i++){
      const pool = selectRandomRarityPool();
      const template = pool[rand(pool.length)];
      rewards.push(template);
    }
    
    const rewardsEl = $("cardRewards");
    rewardsEl.innerHTML = '';
    rewards.forEach((template, idx) => {
      const div = document.createElement('div');
      div.className = `card ${template.rarity}`;
      div.setAttribute('data-description', `${template.desc}\n\nCost: ${template.cost} Energy\nRarity: ${template.rarity.toUpperCase()}`);
      div.innerHTML = `<div><span class="title">${template.name}</span><span class="cost">${template.cost}</span></div>
        <div class="small">${template.desc}</div>
        <div class="small" style="margin-top:4px;color:#888">${template.rarity}</div>`;
      div.addEventListener('click', ()=> this.selectReward(template));
      rewardsEl.appendChild(div);
    });
    updateUI();
  }

  selectReward(template){
    // Add the selected card to the deck
    const newCard = createCardWithEffect(template, this);
    this.deck.discard.push(newCard);
    this.log(`Added ${template.name} to your deck!`);
    this.closeRewardScreen();
  }

  skipReward(){
    this.log('Skipped card reward.');
    this.closeRewardScreen();
  }

  closeRewardScreen(){
    $("reward").classList.add('hidden');
    $("combat").classList.add('hidden');
    // Return to map for next choice
    this.showMap();
  }

  showShop(){
    $("shop").classList.remove('hidden');
    $("nextRoomBtn").disabled = true;
    
    // Generate shop inventory
    const shopItems = [];
    for(let i=0; i<6; i++){
      const pool = selectRandomRarityPool(0.05, 0.15, 0.5); // Slightly higher legendary chance in shop
      const template = pool[rand(pool.length)];
      const price = getCardPrice(template.rarity);
      shopItems.push({...template, price});
    }
    
    const shopEl = $("shopCards");
    shopEl.innerHTML = '';
    shopItems.forEach((item) => {
      const div = document.createElement('div');
      div.className = `card ${item.rarity}`;
      div.setAttribute('data-description', `${item.desc}\n\nCost: ${item.cost} Energy\nRarity: ${item.rarity.toUpperCase()}\nPrice: ${item.price} Gold`);
      const canAfford = this.gold >= item.price;
      div.innerHTML = `<div><span class="title">${item.name}</span><span class="cost">${item.cost}</span></div>
        <div class="small">${item.desc}</div>
        <div class="small" style="margin-top:4px;color:#888">${item.rarity}</div>
        <div style="margin-top:8px;font-weight:700;color:${canAfford?'#ffcc33':'#666'}">${item.price} Gold</div>`;
      if(canAfford){
        div.addEventListener('click', ()=> this.buyCard(item));
      } else {
        div.style.opacity = '0.5';
        div.style.cursor = 'not-allowed';
      }
      shopEl.appendChild(div);
    });
    updateUI();
  }

  buyCard(item){
    if(this.gold < item.price){
      this.log('Not enough gold!');
      return;
    }
    
    this.gold -= item.price;
    const newCard = createCardWithEffect(item, this);
    this.deck.discard.push(newCard);
    this.log(`Purchased ${item.name} for ${item.price} gold!`);
    this.showShop(); // Refresh shop display
  }

  leaveShop(){
    $("shop").classList.add('hidden');
    this.roomsCleared++;
    this.log('Left the shop.');
    // Return to map for next choice
    this.showMap();
  }

  showGameOver(){
    const duration = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    $("endTitle").textContent = "Defeated!";
    $("endStats").innerHTML = `
      <div>Rooms Cleared: ${this.roomsCleared}/${this.floors}</div>
      <div>Enemies Defeated: ${this.enemiesDefeated}</div>
      <div>Gold Collected: ${this.gold}</div>
      <div>Final Deck Size: ${this.deck.drawPile.length + this.deck.discard.length + this.deck.hand.length}</div>
      <div>Time: ${minutes}m ${seconds}s</div>
    `;
    $("gameOver").classList.remove('hidden');
    $("endTurn").disabled = true;
    $("nextRoomBtn").disabled = true;
  }

  showVictory(){
    const duration = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    $("endTitle").textContent = "Victory!";
    $("endTitle").style.color = '#3ad29f';
    $("endStats").innerHTML = `
      <div>🎉 You defeated the boss! 🎉</div>
      <div>Rooms Cleared: ${this.roomsCleared}/${this.floors}</div>
      <div>Enemies Defeated: ${this.enemiesDefeated}</div>
      <div>Gold Collected: ${this.gold}</div>
      <div>Final Deck Size: ${this.deck.drawPile.length + this.deck.discard.length + this.deck.hand.length}</div>
      <div>Time: ${minutes}m ${seconds}s</div>
    `;
    $("gameOver").classList.remove('hidden');
    $("nextRoomBtn").disabled = true;
    this.log("You defeated the boss. Victory!");
  }

  restart(){
    location.reload();
  }

  openInventoryModal(){
    this.updateInventoryUI();
    $("inventoryModal").classList.remove('hidden');
  }

  closeInventoryModal(){
    $("inventoryModal").classList.add('hidden');
  }

  /* Inventory Management */
  equipItem(item) {
    let slot = item.type;
    
    // Map item types to inventory slots
    if(item.type === 'weapon') {
      // Try to equip in left hand first, then right hand
      if(!this.inventory.leftHand) {
        slot = 'leftHand';
      } else if(!this.inventory.rightHand) {
        slot = 'rightHand';
      } else {
        // Replace left hand if both are full
        slot = 'leftHand';
      }
    } else if(item.type === 'ring') {
      // Try ring1 first, then ring2
      if(!this.inventory.ring1) {
        slot = 'ring1';
      } else if(!this.inventory.ring2) {
        slot = 'ring2';
      } else {
        // Replace ring1 if both are full
        slot = 'ring1';
      }
    }
    // For armor, boots, gloves, necklace, use the type directly as slot
    
    const oldItem = this.inventory[slot];
    
    // Unequip old item if exists
    if(oldItem) {
      this.unapplyItemStats(oldItem);
    }
    
    // Equip new item
    this.inventory[slot] = item;
    this.applyItemStats(item);
    this.log(`Equipped ${item.name}!`);
    this.updateInventoryUI();
    updateUI();
  }

  applyItemStats(item) {
    if(!item || !item.stats) return;
    
    const stats = item.stats;
    if(stats.hp) {
      this.player.maxHp += stats.hp;
      this.player.hp = clamp(this.player.hp + stats.hp, 0, this.player.maxHp);
    }
    if(stats.attack) {
      this.player.baseAttack = (this.player.baseAttack || 0) + stats.attack;
    }
    if(stats.energy) {
      this.player.maxEnergy = (this.player.maxEnergy || 3) + stats.energy;
    }
    if(stats.draw) {
      this.player.bonusDraw = (this.player.bonusDraw || 0) + stats.draw;
    }
  }

  unapplyItemStats(item) {
    if(!item || !item.stats) return;
    
    const stats = item.stats;
    if(stats.hp) {
      this.player.maxHp -= stats.hp;
      this.player.hp = clamp(this.player.hp, 0, this.player.maxHp);
    }
    if(stats.attack) {
      this.player.baseAttack = (this.player.baseAttack || 0) - stats.attack;
    }
    if(stats.energy) {
      this.player.maxEnergy = (this.player.maxEnergy || 3) - stats.energy;
    }
    if(stats.draw) {
      this.player.bonusDraw = (this.player.bonusDraw || 0) - stats.draw;
    }
  }

  updateInventoryUI() {
    const slots = Object.keys(this.inventory);
    
    slots.forEach(slot => {
      const slotEl = $(slot + 'Slot');
      const item = this.inventory[slot];
      
      if(item) {
        slotEl.className = `inv-slot ${item.rarity}`;
        slotEl.innerHTML = `
          <div class="item-icon">
            <div class="item-icon-image">${this.getItemEmoji(item.type)}</div>
            <div class="item-icon-name">${item.name}</div>
          </div>
          <div class="item-rarity-border"></div>
        `;
        slotEl.draggable = true;
        slotEl.ondragstart = (e) => this.handleDragStart(e, slot);
        slotEl.onclick = () => this.unequipItem(slot);
        
        // Tooltip on hover
        slotEl.onmouseenter = (e) => this.showItemTooltip(e, item);
        slotEl.onmouseleave = () => this.hideItemTooltip();
      } else {
        slotEl.className = 'inv-slot empty';
        slotEl.innerHTML = `<div class="slot-icon">${this.getSlotEmoji(slot)}</div>`;
        slotEl.draggable = false;
        slotEl.onclick = null;
        slotEl.onmouseenter = null;
        slotEl.onmouseleave = null;
      }
      
      // Allow dropping on all slots
      slotEl.ondragover = (e) => e.preventDefault();
      slotEl.ondragenter = (e) => {
        e.preventDefault();
        slotEl.classList.add('drag-over');
      };
      slotEl.ondragleave = () => slotEl.classList.remove('drag-over');
      slotEl.ondrop = (e) => this.handleDrop(e, slot);
    });
    
    // Update bonus stats display
    const hasAnyEquipment = Object.values(this.inventory).some(item => item !== null);
    const bonusStatsEl = $("bonusStats");
    
    if(hasAnyEquipment) {
      bonusStatsEl.classList.remove('hidden');
      const totalStats = this.getTotalEquipmentStats();
      $("bonusDisplay").innerHTML = this.formatItemStats(totalStats);
    } else {
      bonusStatsEl.classList.add('hidden');
    }
    this.updateEquipmentSlots();
  }

  updateEquipmentSlots() {
    const equipmentSlotsEl = $("equipmentSlots");
    if(!equipmentSlotsEl) return;
    const slotLabels = [
      {slot: 'helmet', label: 'Helmet'},
      {slot: 'leftHand', label: 'Left Hand'},
      {slot: 'rightHand', label: 'Right Hand'},
      {slot: 'necklace', label: 'Necklace'},
      {slot: 'armor', label: 'Armor'},
      {slot: 'ring1', label: 'Ring 1'},
      {slot: 'ring2', label: 'Ring 2'},
      {slot: 'gloves', label: 'Gloves'},
      {slot: 'belt', label: 'Belt'},
      {slot: 'boots', label: 'Boots'}
    ];

    equipmentSlotsEl.innerHTML = '';
    slotLabels.forEach(({slot, label}) => {
      const item = this.inventory[slot];
      const wrapper = document.createElement('div');
      wrapper.className = 'equipment-slot';

      const labelEl = document.createElement('div');
      labelEl.className = 'slot-label';
      labelEl.textContent = label;
      wrapper.appendChild(labelEl);

      const content = document.createElement('div');
      content.className = `slot-content ${item ? 'has-item' : 'empty'}`;
      if(item) {
        content.innerHTML = `
          <div class="item-name">${item.name}</div>
          <div class="item-stats">${this.formatItemStats(item.stats)}</div>
          <div class="item-rarity ${item.rarity}">${item.rarity}</div>
        `;
        content.onclick = () => this.unequipItem(slot);
      } else {
        content.textContent = 'Empty';
      }
      wrapper.appendChild(content);
      equipmentSlotsEl.appendChild(wrapper);
    });
  }

  getSlotEmoji(slot) {
    return EMOJI_MAP[slot] || '?';
  }

  getItemEmoji(type) {
    return EMOJI_MAP[type] || '❓';
  }

  draggedElement = null;

  handleDragStart(e, fromSlot) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', fromSlot);
    this.draggedElement = e.target;
    e.target.classList.add('dragging');
  }

  handleDrop(e, toSlot) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    const fromSlot = e.dataTransfer.getData('text/plain');
    
    if(fromSlot && fromSlot !== toSlot) {
      // Swap items
      const temp = this.inventory[fromSlot];
      this.inventory[fromSlot] = this.inventory[toSlot];
      this.inventory[toSlot] = temp;
      
      this.updateInventoryUI();
      updateUI();
    }
    
    // Clean up dragging state
    if(this.draggedElement) {
      this.draggedElement.classList.remove('dragging');
      this.draggedElement = null;
    }
  }

  showItemTooltip(e, item) {
    const tooltip = $("itemTooltip");
    tooltip.classList.remove('hidden');
    
    tooltip.innerHTML = `
      <div class="tooltip-name">${item.name}</div>
      <div class="tooltip-rarity ${item.rarity}">${item.rarity.toUpperCase()}</div>
      <div class="tooltip-stats">${this.formatItemStatsTooltip(item.stats)}</div>
    `;
    
    // Position tooltip
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = (rect.right + 10) + 'px';
    tooltip.style.top = rect.top + 'px';
  }

  hideItemTooltip() {
    const tooltip = $("itemTooltip");
    tooltip.classList.add('hidden');
  }

  formatItemStatsTooltip(stats) {
    const parts = [];
    if(stats.attack) parts.push(`<div class="tooltip-stat">⚔️ ${stats.attack > 0 ? '+' : ''}${stats.attack} Attack</div>`);
    if(stats.hp) parts.push(`<div class="tooltip-stat">❤️ ${stats.hp > 0 ? '+' : ''}${stats.hp} Health</div>`);
    if(stats.energy) parts.push(`<div class="tooltip-stat">⚡ ${stats.energy > 0 ? '+' : ''}${stats.energy} Energy</div>`);
    if(stats.draw) parts.push(`<div class="tooltip-stat">📜 ${stats.draw > 0 ? '+' : ''}${stats.draw} Draw</div>`);
    return parts.join('');
  }

  getTotalEquipmentStats() {
    const total = {attack: 0, hp: 0, energy: 0, draw: 0};
    
    Object.values(this.inventory).forEach(item => {
      if(item && item.stats) {
        if(item.stats.attack) total.attack += item.stats.attack;
        if(item.stats.hp) total.hp += item.stats.hp;
        if(item.stats.energy) total.energy += item.stats.energy;
        if(item.stats.draw) total.draw += item.stats.draw;
      }
    });
    
    return total;
  }

  formatItemStats(stats) {
    const parts = [];
    if(stats.attack) parts.push(`${stats.attack > 0 ? '+' : ''}${stats.attack} ATK`);
    if(stats.hp) parts.push(`${stats.hp > 0 ? '+' : ''}${stats.hp} HP`);
    if(stats.energy) parts.push(`${stats.energy > 0 ? '+' : ''}${stats.energy} Energy`);
    if(stats.draw) parts.push(`${stats.draw > 0 ? '+' : ''}${stats.draw} Draw`);
    return parts.join(', ');
  }

  unequipItem(slot) {
    const item = this.inventory[slot];
    if(!item) return;
    
    this.unapplyItemStats(item);
    this.inventory[slot] = null;
    this.log(`Unequipped ${item.name}.`);
    this.updateInventoryUI();
    updateUI();
  }

  showLootDrop(lootItems) {
    if(!lootItems || lootItems.length === 0) return;
    
    $("lootModal").classList.remove('hidden');
    const lootEl = $("lootItems");
    lootEl.innerHTML = '';
    
    lootItems.forEach(item => {
      const div = document.createElement('div');
      div.className = `loot-item ${item.rarity}`;
      div.innerHTML = `
        <div class="item-name">${item.name}</div>
        <div class="item-stats">${this.formatItemStats(item.stats)}</div>
        <div class="item-rarity ${item.rarity}">${item.rarity}</div>
      `;
      div.addEventListener('click', () => {
        this.equipItem(item);
        div.style.opacity = '0.5';
        div.style.pointerEvents = 'none';
        div.innerHTML += '<div style="margin-top:8px;color:#3ad29f;font-weight:700">✓ Equipped</div>';
      });
      lootEl.appendChild(div);
    });
  }

  closeLootModal() {
    $("lootModal").classList.add('hidden');
    
    // If we're coming from combat (not treasure), show card rewards
    if(this.enemy === null && this.currentNode && this.currentNode.type !== 'treasure') {
      this.showCardRewards();
    } else {
      // Otherwise return to map
      this.showMap();
    }
  }
}

/* UI helpers */
function updateUI(){
  const g = window.G;
  if(!g) return;
  $("gold").textContent = g.gold;
  $("roomIndex").textContent = (g.currentRoom >=0 ? g.currentRoom+1 : 0);
  $("roomCount").textContent = g.roomCount;

  // player stats
  $("playerHp").style.width = (g.player.hp / g.player.maxHp * 100) + '%';
  $("playerHp").style.background = 'linear-gradient(90deg,var(--hp-green),#18b39b)';
  $("playerStats").textContent = `HP: ${g.player.hp}/${g.player.maxHp}  Block: ${g.player.block}`;

  // enemy
  if(g.enemy){
    $("enemyName").textContent = g.enemy.name;
    $("enemyHp").style.width = (g.enemy.hp / g.enemy.maxHp * 100) + '%';
    $("enemyStats").textContent = `HP: ${g.enemy.hp}/${g.enemy.maxHp}  ATK: ${g.enemy.atk}`;
    $("combat").classList.remove('hidden');
  } else {
    $("enemyName").textContent = '';
    $("enemyHp").style.width = '0%';
    $("enemyStats").textContent = '';
    // hide only if not in combat
  }

  // deck counts
  $("deckCount").textContent = g.deck.drawPile.length;
  $("discardCount").textContent = g.deck.discard.length;
  $("energy").textContent = g.player.energy ?? 0;

  // hand UI
  const handEl = $("hand");
  handEl.innerHTML = '';
  g.deck.hand.forEach((c,i) => {
    const div = document.createElement('div');
    div.className = 'card';
    if(c.rarity) div.classList.add(c.rarity);
    div.setAttribute('data-description', `${c.desc}\n\nCost: ${c.cost} Energy${c.rarity ? '\nRarity: ' + c.rarity.toUpperCase() : ''}`);
    div.innerHTML = `<div><span class="title">${c.name}</span><span class="cost">${c.cost}</span></div>
      <div class="small">${c.desc}</div>`;
    div.addEventListener('click', ()=> {
      g.playCardFromHand(i);
    });
    handEl.appendChild(div);
  });
}
