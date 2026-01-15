const CLASS_SELECTION_LIMIT = 1;
const CLASS_OPTION_COUNT = 3;
const CLASS_NAMES = [
  'Blade Dancer',
  'Stormcaller',
  'Shadow Rogue',
  'Iron Guard',
  'Mystic Sage',
  'Beast Tamer',
  'Arcane Warden',
  'Flame Herald'
];
const PASSIVE_POOL = [
  { label: 'Gain +1 energy.', apply: (game) => { game.player.maxEnergy += 1; game.player.energy = game.player.maxEnergy; } },
  { label: 'Gain +6 max HP.', apply: (game) => { game.player.maxHp += 6; game.player.hp += 6; } },
  { label: 'Draw +1 card each combat.', apply: (game) => { game.player.bonusDraw += 1; } },
  { label: 'Gain +2 base attack.', apply: (game) => { game.player.baseAttack += 2; } },
  { label: 'Gain +4 max HP.', apply: (game) => { game.player.maxHp += 4; game.player.hp += 4; } }
];
const POKEMON_SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

const getRandomPokemonId = () => {
  if(Array.isArray(COMMON_POKEMON_IDS) && COMMON_POKEMON_IDS.length){
    return COMMON_POKEMON_IDS[rand(COMMON_POKEMON_IDS.length)];
  }
  return 1 + rand(151);
};

const createClassOption = (index) => {
  const name = CLASS_NAMES[rand(CLASS_NAMES.length)];
  const passive = PASSIVE_POOL[rand(PASSIVE_POOL.length)];
  const pokemonId = getRandomPokemonId();
  return {
    id: `class-${index}-${pokemonId}`,
    name,
    pokemonId,
    passive: passive.label,
    apply: passive.apply
  };
};

const applyClassSelection = (game, selections) => {
  game.selectedClasses = selections.map((selection) => ({
    name: selection.name,
    passive: selection.passive,
    pokemonId: selection.pokemonId
  }));
  selections.forEach((selection) => selection.apply(game));
  const lead = selections[0];
  if(lead && lead.pokemonId){
    game.playerSpriteId = lead.pokemonId;
    const spriteEl = $("playerSprite");
    if(spriteEl){
      spriteEl.style.backgroundImage = `url(${POKEMON_SPRITE_BASE}/${lead.pokemonId}.png)`;
    }
  }
  game.log(`Selected classes: ${selections.map((selection) => selection.name).join(', ')}.`);
};

const openClassSelection = (game) => {
  const modal = $("classSelectModal");
  const optionsEl = $("classOptions");
  const countEl = $("classSelectCount");
  const selections = [];
  const selectedIds = new Set();
  let selectionLocked = false;

  optionsEl.innerHTML = '';
  const updateCount = () => {
    countEl.textContent = `Selected ${selectedIds.size}/${CLASS_SELECTION_LIMIT}`;
  };

  for(let i = 0; i < CLASS_OPTION_COUNT; i++){
    const option = createClassOption(i);
    selections.push(option);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'class-card';
    card.innerHTML = `
      <div>
        <div class="class-card-title">${option.name}</div>
        <div class="class-card-subtitle">Partner #${option.pokemonId}</div>
      </div>
      <div class="class-card-sprite" style="background-image:url(${POKEMON_SPRITE_BASE}/${option.pokemonId}.png)"></div>
      <div class="class-card-passive">${option.passive}</div>
    `;
    card.addEventListener('click', () => {
      if(selectionLocked) return;
      if(selectedIds.has(option.id)){
        selectedIds.delete(option.id);
        card.classList.remove('selected');
        updateCount();
        return;
      }
      if(selectedIds.size >= CLASS_SELECTION_LIMIT) return;
      selectedIds.add(option.id);
      card.classList.add('selected');
      updateCount();
      if(selectedIds.size === CLASS_SELECTION_LIMIT){
        selectionLocked = true;
        modal.classList.add('hidden');
        const chosen = selections.filter((entry) => selectedIds.has(entry.id));
        applyClassSelection(game, chosen);
        updateUI();
        $("nextRoomBtn").disabled = false;
        game.nextRoom();
      }
    });
    optionsEl.appendChild(card);
  }
  updateCount();
  modal.classList.remove('hidden');
};

/* bootstrap */
window.addEventListener('load', ()=>{
  // Main Menu Handlers
  const mainMenu = $("mainMenu");
  const gameScreen = $("gameScreen");
  const saveManagementScreen = $("saveManagementScreen");
  
  $("newRunBtn").addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    window.G = new Game();
    $("nextRoomBtn").disabled = true;
    updateUI();
    openClassSelection(window.G);
  });
  
  $("saveManagementBtn").addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    saveManagementScreen.classList.remove('hidden');
  });
  
  $("backToMenuBtn").addEventListener('click', () => {
    saveManagementScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
  });
  
  // Show main menu first
  mainMenu.classList.remove('hidden');
});
