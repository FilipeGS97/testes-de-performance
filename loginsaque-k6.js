// Essa automação visa testar a performance da API de login e saques, simulando o fluxo cotidiano de muitos jogadores. 

import http from 'k6/http';
import { check, sleep, fail } from 'k6';
import { usuarios } from './listacadastros.js'; // importa a listagem (listas existentes: lista.js, lista2, lista3, lista4...) -> existe uma limitação de saques por usuário, definida na API, por isso utilizei a lista.

let requestIndex = 0;

let indicesUsuariosUsados = [];

export const options = {
  stages: [
    { duration: "10s", target: 5 },
    { duration: "10s", target: 50 },
    { duration: "10s", target: 100 },
    { duration: "10s", target: 500 },
    { duration: "20s", target: 900 },
    { duration: "30s", target: 1300 },
    { duration: "30s", target: 1600 },
  ],
  gracefulStop: "10s", // Tempo de parada suave antes do término
};

function selecionarUsuarioAleatorio() {
  // Selecione um usuário aleatório que ainda não tenha sido utilizado
  let indiceAleatorio;

  // Garante que o índice aleatório não tenha sido usado antes
  do {
    indiceAleatorio = Math.floor(Math.random() * usuarios.length);
  } while (indicesUsuariosUsados.includes(indiceAleatorio));

  // Marca o usuário como utilizado
  indicesUsuariosUsados.push(indiceAleatorio);

  // Se todos os usuários já foram utilizados, retorna null
  if (indicesUsuariosUsados.length === usuarios.length) {
    console.log('Todos os usuários foram selecionados.');
    return null;
  }

  // Retorna o usuário correspondente ao índice selecionado
  return usuarios[indiceAleatorio];
}

export default function () {

  const currentRequestIndex = ++requestIndex;

  const usuario = selecionarUsuarioAleatorio();

  if (!usuario) {
    // Caso todos os usuários tenham sido selecionados, finaliza o teste
    fail('Todos os usuários foram selecionados. Teste interrompido.');
  }

  // Realiza o login com o email e senha
  const loginUrl = 'https://api.exemplo.com/api/auth/login';
  const loginPayload = JSON.stringify({
    email: usuario.email,
    password: '@bet2024',
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

//console.log(indicesUsuariosUsados);

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
  const saqueUrl = 'https://api.exemplo.com/api/withdrawals'; 
  const payload = JSON.stringify({
    method: "pix",
    amount: 2,  // Valor de saque, pode ser modificado conforme necessário
    type: "email",
    pix: "api.exemplo@gmail.com",  // PIX (pode ser modificado conforme necessário)
  });

  const saqueParams = {
    headers: {
      'Content-Type': 'application/json',
      'application-encrypt': 'fdstst',
      'Authorization': `Bearer ${bearerToken}`,
    },
  };

  // Envia a requisição de depósito
  const saqueResponse = http.post(saqueUrl, payload, saqueParams);

  // Verificação de falha na requisição de depósito
  if (saqueResponse.status === 500) {
    console.log(`Requisição de saque #${currentRequestIndex}`);
    console.log(`URL: ${saqueUrl}`);
    console.log(`Status: ${saqueResponse.status}`);
    console.log(`Resposta: ${saqueResponse.body}`);
    console.log('###############################################################');
    
    console.error(`❌ Falha detectada no saque!`);
    console.error(`⏳ Usuários no momento: ${__VU}`);
    console.error(`🚀 Iterações realizadas: ${__ITER}`);
    console.error(`📡 Status HTTP: ${saqueResponse.status}`);
    console.error(`⚡ Tempo de resposta: ${saqueResponse.timings.duration}ms`);
    
    fail(`🔥 Teste interrompido! O servidor retornou 500 com ${__VU} usuários.`);
  }


  if (saqueResponse.status === 401) {
    console.log(`Requisição de saque #${currentRequestIndex}`);
    console.log(`URL: ${saqueUrl}`);
    console.log(`Status: ${saqueResponse.status}`);
    console.log(`Resposta: ${saqueResponse.body}`);
    console.log('###############################################################');
    
    console.error(`❌ Falha detectada no saque!`);
    console.error(`⏳ Usuários no momento: ${__VU}`);
    console.error(`🚀 Iterações realizadas: ${__ITER}`);
    console.error(`📡 Status HTTP: ${saqueResponse.status}`);
    console.error(`⚡ Tempo de resposta: ${saqueResponse.timings.duration}ms`);
    
    fail(`🔥 Teste interrompido! O servidor retornou 500 com ${__VU} usuários.`);
  }

  if (saqueResponse.status === 403) {
    console.log(`Requisição de saque #${currentRequestIndex}`);
    console.log(`URL: ${saqueUrl}`);
    console.log(`Status: ${saqueResponse.status}`);
    console.log(`Resposta: ${saqueResponse.body}`);
    console.log('###############################################################');
    console.log(usuario);
    
    console.error(`❌ Falha detectada no saque!`);
    console.error(`⏳ Usuários no momento: ${__VU}`);
    console.error(`🚀 Iterações realizadas: ${__ITER}`);
    console.error(`📡 Status HTTP: ${saqueResponse.status}`);
    console.error(`⚡ Tempo de resposta: ${saqueResponse.timings.duration}ms`);
    
    fail(`🔥 Teste interrompido! O servidor retornou 500 com ${__VU} usuários.`);
  }
  console.log(usuario);

  // Verificação de sucesso no depósito
  check(saqueResponse, {
    'status was successful': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(2); // Aguarda 1 segundo antes de repetir a execução
}
