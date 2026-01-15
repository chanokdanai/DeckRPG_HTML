// Mini DeckRPG prototype
// Save these files together and open index.html

/* Game State */
const BAG_SIZE = 12;
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
    this.startTime = Date.now();
    this.roomsCleared = 0;
    this.enemiesDefeated = 0;
    this.draggedElement = null;
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
