const mineflayer = require('mineflayer');

// Criando o bot
const bot = mineflayer.createBot({
  host: 'kamaga321.aternos.me', // IP do servidor
  port: 11324, // Porta do servidor
  username: 'BotName' // Nome de usuário
});

// Função de memória para armazenar respostas aprendidas
let responseDatabase = {
  "olá": "Olá, como posso ajudar?",
  "ajuda": "Posso ajudar com recursos ou proteção!",
  "tchau": "Até mais, espero que tenha uma boa jornada!"
};

// Função para ajustar a recompensa com base nos erros/sucessos
let reward = 0;  // Inicializando a recompensa
function adjustReward(actionOutcome) {
  if (actionOutcome === 'success') {
    reward += 10; // Recompensa por sucesso
    bot.chat('Consegui! Isso foi bom!');
  } else if (actionOutcome === 'failure') {
    reward -= 5; // Penalidade por falha
    bot.chat('Isso não deu certo...');
  }
  console.log(`Recompensa atual: ${reward}`);
}

// Função para explorar o mundo e tentar minerar
function exploreAndMine() {
  const blocks = bot.findBlocks({
    matching: [14, 15], // Diamante, ouro (exemplo)
    maxDistance: 64
  });

  if (blocks.length > 0) {
    const targetBlock = blocks[0];
    bot.chat(`Encontrei um recurso: ${targetBlock}`);
    moveToBlock(targetBlock);
    adjustReward('success');  // Sucesso ao encontrar recurso
  } else {
    bot.chat('Nada por aqui...');
    adjustReward('failure');  // Falha ao não encontrar nada
  }
}

// Função para mover para o bloco desejado
function moveToBlock(targetBlock) {
  bot.pathfinder.setGoal(new mineflayer.pathfinder.goals.GoalBlock(targetBlock.x, targetBlock.y, targetBlock.z));
  bot.chat('Movendo para o recurso!');
}

// Função para aprender novas respostas
function learnNewResponse(userMessage, botResponse) {
  responseDatabase[userMessage.toLowerCase()] = botResponse;
  console.log(`Bot aprendeu a responder '${userMessage}' com '${botResponse}'`);
}

// Responder ao chat
bot.on('chat', (username, message) => {
  message = message.toLowerCase();

  // Verifica se já existe uma resposta armazenada
  if (responseDatabase[message]) {
    bot.chat(responseDatabase[message]);
  } else {
    bot.chat("Desculpe, não entendi isso ainda. Quer me ensinar?");
    learnNewResponse(message, `Eu aprendi a responder '${message}'!`);
  }
});

// Função para analisar o ambiente
function analyzeEnvironment() {
  const entities = bot.entities;
  for (const id in entities) {
    const entity = entities[id];
    if (entity.mobType) {
      if (entity.mobType === 'Zombie') {
        bot.chat('Perigo! Monstro detectado!');
        avoidDanger(entity);
      }
    }
  }
}

// Função para evitar perigo (simples: fugir de monstros)
function avoidDanger(entity) {
  if (entity.position.distanceTo(bot.entity.position) < 10) {
    bot.setControlState('back', true); // Fugir para trás
    setTimeout(() => {
      bot.setControlState('back', false); // Parar de fugir
    }, 3000);
  }
}

// Inicializando o bot
bot.on('spawn', () => {
  console.log('Bot entrou no mundo!');
  exploreAndMine();  // Inicia o processo de exploração
});

// Chamando função para analisar o ambiente e tomar decisões
setInterval(() => {
  analyzeEnvironment();
}, 5000);  // Analisando o ambiente a cada 5 segundos

bot.on('error', err => console.log(err));
bot.on('end', () => console.log('Bot desconectado.'));
