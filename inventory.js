/* Inventory helpers */
Game.prototype.openInventoryModal = function(){
  this.updateInventoryUI();
  $("inventoryModal").classList.remove('hidden');
};

Game.prototype.closeInventoryModal = function(){
  $("inventoryModal").classList.add('hidden');
};

Game.prototype.equipItem = function(item) {
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
};

Game.prototype.applyItemStats = function(item) {
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
};

Game.prototype.unapplyItemStats = function(item) {
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
};

Game.prototype.updateInventoryUI = function() {
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
  this.updateBagUI();
};

Game.prototype.updateEquipmentSlots = function() {
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
};

Game.prototype.updateBagUI = function() {
  const grid = $("bagGrid");
  if(!grid) return;
  grid.innerHTML = '';
  this.bag.forEach((item, index) => {
    const slotEl = document.createElement('div');
    slotEl.className = `inv-slot bag-slot ${item ? item.rarity : 'empty'}`;

    if(item) {
      slotEl.innerHTML = `
        <div class="item-icon">
          <div class="item-icon-image">${this.getItemEmoji(item.type)}</div>
          <div class="item-icon-name">${item.name}</div>
        </div>
        <div class="item-rarity-border"></div>
      `;
      slotEl.onclick = () => this.equipItemFromBag(index);
      slotEl.onmouseenter = (e) => this.showItemTooltip(e, item);
      slotEl.onmouseleave = () => this.hideItemTooltip();
    } else {
      slotEl.innerHTML = `<div class="slot-icon">+</div>`;
    }
    grid.appendChild(slotEl);
  });
};

Game.prototype.addItemToBag = function(item, silent = false) {
  const emptyIndex = this.bag.findIndex(slot => slot === null);
  if(emptyIndex === -1) {
    if(!silent) this.log('Bag is full.');
    return false;
  }
  this.bag[emptyIndex] = item;
  if(!silent) {
    this.log(`Stored ${item.name} in bag.`);
  }
  this.updateInventoryUI();
  return true;
};

Game.prototype.canEquipItem = function(item) {
  if(!item) return false;
  if(item.type === 'weapon' || item.type === 'ring') return true;
  return Object.prototype.hasOwnProperty.call(this.inventory, item.type);
};

Game.prototype.equipItemFromBag = function(index) {
  const item = this.bag[index];
  if(!item) return;
  this.bag[index] = null;
  this.equipItem(item);
};

Game.prototype.getSlotEmoji = function(slot) {
  return EMOJI_MAP[slot] || '?';
};

Game.prototype.getItemEmoji = function(type) {
  return EMOJI_MAP[type] || '❓';
};

Game.prototype.handleDragStart = function(e, fromSlot) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', fromSlot);
  this.draggedElement = e.target;
  e.target.classList.add('dragging');
};

Game.prototype.handleDrop = function(e, toSlot) {
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
};

Game.prototype.showItemTooltip = function(e, item) {
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
};

Game.prototype.hideItemTooltip = function() {
  const tooltip = $("itemTooltip");
  tooltip.classList.add('hidden');
};

Game.prototype.formatItemStatsTooltip = function(stats) {
  const parts = [];
  if(stats.attack) parts.push(`<div class="tooltip-stat">⚔️ ${stats.attack > 0 ? '+' : ''}${stats.attack} Attack</div>`);
  if(stats.hp) parts.push(`<div class="tooltip-stat">❤️ ${stats.hp > 0 ? '+' : ''}${stats.hp} Health</div>`);
  if(stats.energy) parts.push(`<div class="tooltip-stat">⚡ ${stats.energy > 0 ? '+' : ''}${stats.energy} Energy</div>`);
  if(stats.draw) parts.push(`<div class="tooltip-stat">📜 ${stats.draw > 0 ? '+' : ''}${stats.draw} Draw</div>`);
  return parts.join('');
};

Game.prototype.getTotalEquipmentStats = function() {
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
};

Game.prototype.formatItemStats = function(stats) {
  const parts = [];
  if(stats.attack) parts.push(`${stats.attack > 0 ? '+' : ''}${stats.attack} ATK`);
  if(stats.hp) parts.push(`${stats.hp > 0 ? '+' : ''}${stats.hp} HP`);
  if(stats.energy) parts.push(`${stats.energy > 0 ? '+' : ''}${stats.energy} Energy`);
  if(stats.draw) parts.push(`${stats.draw > 0 ? '+' : ''}${stats.draw} Draw`);
  return parts.join(', ');
};

Game.prototype.unequipItem = function(slot) {
  const item = this.inventory[slot];
  if(!item) return;

  if(!this.addItemToBag(item, true)) {
    this.log('Bag is full. Cannot unequip.');
    return;
  }

  this.unapplyItemStats(item);
  this.inventory[slot] = null;
  this.log(`Moved ${item.name} to bag.`);
  this.updateInventoryUI();
  updateUI();
};

Game.prototype.showLootDrop = function(lootItems) {
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
      const stored = this.addItemToBag(item, true);
      if(stored) {
        this.log(`Stored ${item.name} in bag.`);
        const status = document.createElement('div');
        status.className = 'loot-status stored';
        status.textContent = '✓ Stored';
        div.appendChild(status);
      } else if(this.canEquipItem(item)) {
        this.equipItem(item);
        const status = document.createElement('div');
        status.className = 'loot-status equipped';
        status.textContent = '✓ Equipped';
        div.appendChild(status);
      } else {
        this.log('Bag is full.');
      }
      div.style.opacity = '0.5';
      div.style.pointerEvents = 'none';
    });
    lootEl.appendChild(div);
  });
};

Game.prototype.closeLootModal = function() {
  $("lootModal").classList.add('hidden');
  
  // If we're coming from combat (not treasure), show card rewards
  if(this.enemy === null && this.currentNode && this.currentNode.type !== 'treasure') {
    this.showCardRewards();
  } else {
    // Otherwise return to map
    this.showMap();
  }
};
