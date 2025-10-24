// Essa automação testa a performance da API de confirmação de pagamento. 
// A lista que é consumida são das solicitações de depósito feitas anteriormente. 

import http from 'k6/http';
import { check, fail } from 'k6';
import { usuarios_update } from './lista_usuarios_update.js';
import { sleep } from 'k6';

let requestIndex = 0;
let usuarios = usuarios_update; // Lista de usuários importada
let currentIndex = 0; // Índice atual da lista de usuários

export const options = {
  stages: [
    { duration: "10s", target: 5 },   // Sobe para 5 usuários em 10s
    { duration: "10s", target: 10 },  // Depois para 10 usuários em 20s
    { duration: "10s", target: 20 },  // Sobe para 20 usuários em 30s
    { duration: "10s", target: 100 },  // Sobe para 20 usuários em 30s

  ],
  gracefulStop: "10s", // Tempo de parada suave antes do término
};

// Função para pegar o próximo usuário de forma linear, sem repetição
function selecionarUsuario() {
  if (currentIndex < usuarios.length) {
    return usuarios[currentIndex++]; // Retorna o próximo usuário e incrementa o índice
  } else {
    currentIndex = 0; // Reseta o índice para começar novamente
    console.log('Todos os usuários foram utilizados. Reiniciando o ciclo.');
    return usuarios[currentIndex++]; // Retorna o primeiro usuário e incrementa o índice
  }
}

const url = 'https://api.exemplo/api/deposits/updates';
const params = {
  headers: {
    'Content-Type': 'application/json',
    'application-encrypt': 'apitst',
  },
};

// Função default para o fluxo principal do teste
export default function () {
  const usuario = selecionarUsuario(); // Chama a função para pegar o próximo usuário

  if (!usuario) {
    console.log('Todos os usuários já foram utilizados. Terminando o teste.');
    return;
  }

  const payload = JSON.stringify({
    requestBody: {
      dateApproval: true,
      transactionType: "RECEIVEPIX",
      transactionId: usuario.api_id,
      amount: usuario.valor,
      external_id: usuario.api_id,
    },
  });

  // Simulando a requisição de atualização de depósito
  const saqueResponse = http.post(url, payload, { ...params, timeout: '150s' });

  console.log('Resposta do servidor:', saqueResponse.body);
  console.log(usuario.api_id);

  // Verifica se o status da resposta é 200 (OK)
  check(saqueResponse, {
    'Requisição enviada com sucesso': (r) => r.status === 200,
  });

  // Se o status não for 200, falha no teste
  if (saqueResponse.status !== 200) {
    console.log(`Erro na requisição. Status: ${saqueResponse.status}`);
  }

  // Verificação de falha nas requisições de depósito
  if (saqueResponse.status === 500 || saqueResponse.status === 401 || saqueResponse.status === 403) {
    console.log(`Requisição de saque #${requestIndex}`);
    console.log(`Status: ${saqueResponse.status}`);
    console.log(`Resposta: ${saqueResponse.body}`);
    console.log('###############################################################');

    console.error(`❌ Falha detectada no saque!`);
    console.error(`⏳ Usuários no momento: ${__VU}`);
    console.error(`🚀 Iterações realizadas: ${__ITER}`);
    console.error(`📡 Status HTTP: ${saqueResponse.status}`);
    console.error(`⚡ Tempo de resposta: ${saqueResponse.timings.duration}ms`);

    fail(`🔥 Teste interrompido! O servidor retornou ${saqueResponse.status} com ${__VU} usuários.`);
  }

  // Verificação de sucesso no depósito
  check(saqueResponse, {
    'status was successful': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(2); // Aguarda 2 segundos antes de repetir a execução
}
