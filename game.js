// Mini DeckRPG prototype
// Save these files together and open index.html

/* Game State */
const BAG_SIZE = 12;
const POTION_SLOTS = 3;
const BASE_ATTRIBUTE_POINTS = 5;
const STARTING_EXP_TO_LEVEL = 20;
const EXP_LEVEL_MULTIPLIER = 1.35;
const EXP_LEVEL_BONUS = 5;
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
    this.playerSpriteId = 25;
    this.selectedClasses = [];
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
    this.bag = Array(BAG_SIZE).fill(null);
    this.potions = Array(POTION_SLOTS).fill(null);
    this.startTime = Date.now();
    this.roomsCleared = 0;
    this.enemiesDefeated = 0;
    this.draggedElement = null;
    this.lastCardId = null;
    this.pendingLevelUps = 0;
    this.selectedEnemyIndex = 0;
    this.enemies = [];
    this.setupUI();
    this.resetPlayer();
    this.makeDeck();
    this.log("Welcome to DeckRPG! Select your classes to begin the run.");
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
    const campRestBtn = $("campRestBtn");
    if(campRestBtn){
      campRestBtn.addEventListener('click', ()=> this.resolveCampRest());
    }
    const campRemoveBtn = $("campRemoveBtn");
    if(campRemoveBtn){
      campRemoveBtn.addEventListener('click', ()=> this.openCardSelectModal('remove'));
    }
    const campUpgradeBtn = $("campUpgradeBtn");
    if(campUpgradeBtn){
      campUpgradeBtn.addEventListener('click', ()=> this.openCardSelectModal('upgrade'));
    }
    const cardSelectCancel = $("cardSelectCancel");
    if(cardSelectCancel){
      cardSelectCancel.addEventListener('click', ()=> this.closeCardSelectModal());
    }
    const levelUpModal = $("levelUpModal");
    if(levelUpModal){
      levelUpModal.querySelectorAll('[data-attr]').forEach((button) => {
        button.addEventListener('click', () => {
          const attr = button.getAttribute('data-attr');
          this.applyLevelUp(attr);
        });
      });
    }
    $("inventoryModal").addEventListener('click', (event) => {
      if(event.target.id === 'inventoryModal') {
        this.closeInventoryModal();
      }
    });
    const logMinimize = $("logMinimize");
    if(logMinimize){
      logMinimize.addEventListener('click', () => {
        const logArea = $("logArea");
        logArea.classList.toggle('minimized');
        logMinimize.setAttribute('aria-pressed', logArea.classList.contains('minimized'));
      });
    }
    this.setupWindowDrag("logArea", "logHeader");
    if(this.hotkeyHandler){
      document.removeEventListener('keydown', this.hotkeyHandler);
    }
    this.hotkeyHandler = (event) => {
      const keyIndex = Number(event.key);
      if(!Number.isInteger(keyIndex) || keyIndex < 1 || keyIndex > 9) return;
      if($("combat").classList.contains('hidden') || !this.enemy) return;
      const index = keyIndex - 1;
      if(index >= this.deck.hand.length) return;
      this.playCardFromHand(index);
    };
    document.addEventListener('keydown', this.hotkeyHandler);
    this.updateInventoryUI();
  }

  setupWindowDrag(windowId, handleId){
    const windowEl = $(windowId);
    const handle = $(handleId);
    if(!windowEl || !handle) return;
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    handle.addEventListener('pointerdown', (event) => {
      if(event.target.closest('button')) return;
      dragging = true;
      const rect = windowEl.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      windowEl.style.left = rect.left + 'px';
      windowEl.style.top = rect.top + 'px';
      windowEl.style.right = 'auto';
      windowEl.style.bottom = 'auto';
      handle.setPointerCapture(event.pointerId);
    });

    handle.addEventListener('pointermove', (event) => {
      if(!dragging) return;
      windowEl.style.left = (event.clientX - offsetX) + 'px';
      windowEl.style.top = (event.clientY - offsetY) + 'px';
    });

    const stopDrag = () => {
      dragging = false;
    };
    handle.addEventListener('pointerup', stopDrag);
    handle.addEventListener('pointercancel', stopDrag);
  }

  resetPlayer(){
    this.player = new Entity("You", 50, 50);
    this.player.energy = 3;
    this.player.maxEnergy = 3;
    this.player.baseAttack = 0;
    this.player.tempAttack = 0;
    this.player.bonusDraw = 0;
    this.player.level = 1;
    this.player.exp = 0;
    this.player.expToLevel = STARTING_EXP_TO_LEVEL;
    this.player.attributes = this.rollBaseAttributes();
    this.player.subAttributes = {
      resistance: 0,
      critRate: 0.05,
      critDamage: 1.5
    };
  }

  rollBaseAttributes(){
    const attributes = {str:0, dex:0, int:0, spd:0};
    const keys = Object.keys(attributes);
    for(let i = 0; i < BASE_ATTRIBUTE_POINTS; i++){
      const key = keys[rand(keys.length)];
      attributes[key] += 1;
    }
    return attributes;
  }

  gainExperience(amount){
    if(!this.player) return;
    this.player.exp += amount;
    while(this.player.exp >= this.player.expToLevel){
      this.player.exp -= this.player.expToLevel;
      this.player.level += 1;
      this.player.expToLevel = Math.floor(this.player.expToLevel * EXP_LEVEL_MULTIPLIER) + EXP_LEVEL_BONUS;
      this.pendingLevelUps += 1;
    }
    if(this.pendingLevelUps > 0){
      this.showLevelUpModal();
    }
    updateUI();
  }

  showLevelUpModal(){
    const modal = $("levelUpModal");
    if(modal){
      modal.classList.remove('hidden');
    }
  }

  applyLevelUp(attribute){
    if(!attribute || !this.player || !this.player.attributes) return;
    if(!Object.prototype.hasOwnProperty.call(this.player.attributes, attribute)) return;
    this.player.attributes[attribute] += 1;
    this.pendingLevelUps = Math.max(0, this.pendingLevelUps - 1);
    this.log(`Level up! Increased ${attribute.toUpperCase()} to ${this.player.attributes[attribute]}.`);
    if(this.pendingLevelUps === 0){
      const modal = $("levelUpModal");
      if(modal){
        modal.classList.add('hidden');
      }
    }
    updateUI();
  }

  getAttributeValue(key){
    if(!this.player || !this.player.attributes) return 0;
    return this.player.attributes[key] || 0;
  }

  resolveCampRest(){
    const heal = Math.floor(this.player.maxHp * 0.2);
    this.player.heal(heal);
    this.log(`Rested at camp and healed ${heal} HP.`);
    this.roomsCleared++;
    $("campModal").classList.add('hidden');
    updateUI();
    this.showMap();
  }

  openCampModal(){
    $("campModal").classList.remove('hidden');
  }

  openCardSelectModal(mode){
    const modal = $("cardSelectModal");
    const list = $("cardSelectList");
    const title = $("cardSelectTitle");
    if(!modal || !list) return;
    this.cardSelectMode = mode;
    title.textContent = mode === 'upgrade' ? 'Choose a Card to Upgrade' : 'Choose a Card to Remove';
    list.innerHTML = '';
    const entries = this.getDeckCardEntries();
    entries.forEach(({card, location, index}) => {
      const div = document.createElement('div');
      div.className = `card ${card.rarity || ''}`;
      div.setAttribute('data-description', `${card.desc}\n\nCost: ${card.cost} Energy`);
      div.innerHTML = `<div><span class="title">${card.name}</span><span class="cost">${card.cost}</span></div>
        <div class="small">${card.desc}</div>`;
      div.addEventListener('click', () => {
        if(mode === 'upgrade'){
          this.upgradeCard(card);
          this.log(`Upgraded ${card.name}.`);
        } else {
          this.removeCardFromDeck(location, index);
          this.log(`Removed ${card.name} from your deck.`);
        }
        this.closeCardSelectModal(false);
        this.roomsCleared++;
        updateUI();
        this.showMap();
      });
      list.appendChild(div);
    });
    $("campModal").classList.add('hidden');
    modal.classList.remove('hidden');
  }

  closeCardSelectModal(returnToCamp = true){
    const modal = $("cardSelectModal");
    if(modal){
      modal.classList.add('hidden');
    }
    this.cardSelectMode = null;
    if(returnToCamp){
      const campModal = $("campModal");
      if(campModal){
        campModal.classList.remove('hidden');
      }
    }
  }

  getDeckCardEntries(){
    const entries = [];
    this.deck.drawPile.forEach((card, index) => entries.push({card, location:'drawPile', index}));
    this.deck.discard.forEach((card, index) => entries.push({card, location:'discard', index}));
    this.deck.hand.forEach((card, index) => entries.push({card, location:'hand', index}));
    return entries;
  }

  removeCardFromDeck(location, index){
    if(!this.deck[location]) return;
    this.deck[location].splice(index, 1);
  }

  upgradeCard(card){
    if(!card || card.upgraded) return;
    card.upgraded = true;
    card.cost = Math.max(0, card.cost - 1);
    if(!card.name.endsWith('+')){
      card.name = `${card.name}+`;
    }
    if(!card.desc.includes('Upgraded')){
      card.desc = `${card.desc} (Upgraded)`;
    }
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

  cleanup(){
    if(this.hotkeyHandler){
      document.removeEventListener('keydown', this.hotkeyHandler);
      this.hotkeyHandler = null;
    }
  }

  restart(){
    this.cleanup();
    location.reload();
  }
}
