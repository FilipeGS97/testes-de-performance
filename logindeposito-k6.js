// Essa automação visa testar a performance da API de login e depósito, simulando o fluxo normal de muitos jogadores. 

import http from 'k6/http';
import { check, sleep, fail } from 'k6';
import { usuarios } from './lista.js'; // importa a listagem 

let requestIndex = 0;

export const options = {
  stages: [
    { duration: "10s", target: 5 },   // Sobe para 25 usuários em 10s
    { duration: "20s", target: 50 },  // Depois para 50 usuários em 20s
    { duration: "30s", target: 100 },  // Sobe para 100 usuários em 30s
    { duration: "30s", target: 150 },  // Sobe para 100 usuários em 30s
],
  gracefulStop: "10s", // Tempo de parada suave antes do término
};

export default function () {
  const currentRequestIndex = ++requestIndex;

  // Escolher um usuário aleatório
  const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
  
  // Realiza o login com o email e senha
  const loginUrl = 'https://api.exemplo.com/api/auth/login';
  const loginPayload = JSON.stringify({
    email: usuarios.email,
    password: 'fds123!',
  });

  const loginParams = {
    headers: {
      'Content-Type': 'application/json',
      'application-encrypt': 'apitst', // Cabeçalho de segurança, altere conforme necessário
    },
  };

  // Envia a requisição de login
  const loginResponse = http.post(loginUrl, loginPayload, loginParams);

  // Log da resposta do login para depuração
  //console.log('Resposta do login:', loginResponse.body);

  const testlogin = JSON.parse(loginResponse.body);

  //console.log('Resposta do teste 1:', testlogin);

  let token = testlogin.token.split(" ");

  const token1 = token[0];

  //console.log('Resposta do teste 2 :', token1);



  // Verificação de falha no login
  if (loginResponse.status !== 200) {
    console.error(`❌ Login falhou para o usuário: ${usuario.email}`);
    console.error(`Status HTTP: ${loginResponse.status}`);
    console.error(`Resposta: ${token1}`);
    fail(`🔥 Teste interrompido! Login falhou.`);
  }

  // Obtém o Bearer token do login
  const bearerToken = token1;

  //console.log('Resposta do login:', bearerToken);
  if (!bearerToken) {
    console.error('❌ Token de autenticação não encontrado no header!');
    fail('🔥 Teste interrompido! Token não encontrado.');
  }

  // Realiza o depósito com o Bearer Token obtido
  const depositUrl = 'https://api.exemplo.com/api/deposits'; 
  const depositPayload = JSON.stringify({
    method: 'pix',
    amount: 1,
  });

  const depositParams = {
    headers: {
      'Content-Type': 'application/json',
      'application-encrypt': 'apitst',
      'Authorization': `Bearer ${bearerToken}`,
    },
  };

  // Envia a requisição de depósito
  const depositResponse = http.post(depositUrl, depositPayload, depositParams);

  // Verificação de falha na requisição de depósito
  if (depositResponse.status === 500) {
    console.log(`Requisição de depósito #${currentRequestIndex}`);
    console.log(`URL: ${depositUrl}`);
    console.log(`Status: ${depositResponse.status}`);
    console.log(`Resposta: ${depositResponse.body}`);
    console.log('###############################################################'); 
    
    console.error(`❌ Falha detectada!`);
    console.error(`⏳ Usuários no momento: ${__VU}`);
    console.error(`🚀 Iterações realizadas: ${__ITER}`);
    console.error(`📡 Status HTTP: ${depositResponse.status}`);
    console.error(`⚡ Tempo de resposta: ${depositResponse.timings.duration}ms`);
    
    fail(`🔥 Teste interrompido! O servidor retornou 500 com ${__VU} usuários.`);
  }

  // Verificação de sucesso no depósito
  check(depositResponse, {
    'status was successful': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1); // Aguarda 1 segundo antes de repetir a execução
}
