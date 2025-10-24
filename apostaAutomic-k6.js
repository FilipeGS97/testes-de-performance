// essa automação visa testar a capacidade de carga que a API de apostas de cassino aguenta. Alguns ajustes foram feitos durante os testes para tentar algumas possibilitades.

import http from 'k6/http';
import { check, sleep, fail } from 'k6';

let jogo = 500;

let requestIndex = 0;
// Função para gerar strings aleatórias de 44 caracteres
function generateUniqueId(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const options = {
  // LoadTest
  scenarios: {
    test_until_failure: {
      executor: "ramping-vus",
      startVUs: 1, // Começa com 1 usuário
      stages: [
        { duration: "10s", target: 25 },   // Sobe para 25 usuários em 10s
        { duration: "20s", target: 50 },  // Depois para 50 usuários em 20s
        { duration: "30s", target: 100 },  // Sobe para 100 usuários em 30s
        { duration: "30s", target: 500 },  // Chega a 500 usuários em 30s
        { duration: "30s", target: 800 },  // Chega a 800 usuários em 30s
        { duration: "30s", target: 1100 },  
        { duration: "1m", target: 1500 },  
        { duration: "1m", target: 1700 },  
        { duration: "1m", target: 2000 },  
        { duration: "1m", target: 2500 },  
        { duration: "1m", target: 3000 },  

      ],
      gracefulStop: "0s", // Tempo de parada suave antes do término
    },
  },
};

export default function () {
  const currentRequestIndex = ++requestIndex;

  const generateRandomIds = (size) => {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 500) + 1);
  };

  
  const url = 'https://api.exemplo.com/api/casino/';
  //const url = 'https://backoffice.cacifebet.com/api/casino/fds';

  // const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 185268]
  const ids = generateRandomIds(600);

  let allPassed = true; 

  // Gera um valor único para provider_session_id
  const providerSessionId = generateUniqueId(44);

  ids.forEach(id => {
    const payload = JSON.stringify({
      token: 'exemple-6617a60b61e594.039013',
      event_name: 'bet',
      amount: 2.5,
      user_id: 540,
      game_id: jogo,     //esse não é o id do jogo, é o page_code dele.
      game_provider_id: 5,
      provider_session_id: generateUniqueId(44),
      provider_round_id: generateUniqueId(44),
      provider_transaction_id: generateUniqueId(44),
    });


  const params = {
    headers: {
      'Content-Type': 'application/json',
      'application-encrypt': 'exptst',
    // 'User-Agent': 'k6',
    },
  };

  const response = http.post(url, payload, { ...params, timeout: '150s' });


  if (response.status === 500) {
    console.log(`Requisição #${currentRequestIndex}`);
    console.log(`URL: ${url}`);
    console.log(`Status: ${response.status}`);
    console.log(`Resposta: ${response.body}`);
    console.log(`###############################################################`);

    console.error(`❌ Falha detectada!`);
    console.error(`⏳ Usuários no momento: ${__VU}`);
    console.error(`🚀 Iterações realizadas: ${__ITER}`);
    console.error(`📡 Status HTTP: ${response.status}`);
    console.error(`⚡ Tempo de resposta: ${response.timings.duration}ms`);
    
    fail(`🔥 Teste interrompido! O servidor retornou 500 com ${__VU} usuários.`);
  } 

  if (response.status !== 200) {
    console.log(`Requisição #${currentRequestIndex}`);
    console.log(`URL: ${url}`);
    console.log(`Status: ${response.status}`);
    console.log(`Resposta: ${response.body}`);
    console.log(`###############################################################`);

    console.error(`❌ Falha detectada!`);
    console.error(`⏳ Usuários no momento: ${__VU}`);
    console.error(`🚀 Iterações realizadas: ${__ITER}`);
    console.error(`📡 Status HTTP: ${response.status}`);
    console.error(`⚡ Tempo de resposta: ${response.timings.duration}ms`);
  } 
    check(response, {
      'status was successful': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });
  });

  jogo++

  console.log('entrou aqui')
  sleep(1); // Aguarda 1 segundo antes de repetir a execução
}