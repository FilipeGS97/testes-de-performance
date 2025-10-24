// essa automação em K6 tem a finalidade de testar a performance da API de login. 


import http from 'k6/http';
import { sleep, check } from 'k6';
import { usuarios } from './lista2.js'; // importa a listagem 

let requestIndex = 0;

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Aumenta para 5 usuários em 10s
    { duration: '1m', target: 10 }, // Aumenta para 5 usuários em 10s
    { duration: '30s', target: 20 }, // Sustenta 10 usuários por 20s
    { duration: '1m', target: 20 }, // Sustenta 10 usuários por 20s
    { duration: '30s', target: 30 }, // Sustenta 10 usuários por 20s
    { duration: '1m', target: 30 }, // Sustenta 10 usuários por 20s
    { duration: '30s', target: 40 }, // Reduz para 0 usuários em 10s
    { duration: '1m', target: 40 }, // Reduz para 0 usuários em 10s
    { duration: '30s', target: 50 }, // Reduz para 0 usuários em 10s
    { duration: '1m', target: 50 }, // Reduz para 0 usuários em 10s
    { duration: '30s', target: 60 }, // Reduz para 0 usuários em 10s
    { duration: '1m', target: 60 }, // Reduz para 0 usuários em 10s
    { duration: '30s', target: 70 }, // Reduz para 0 usuários em 10s
    { duration: '1m', target: 70 }, // Reduz para 0 usuários em 10s
    { duration: '30s', target: 80 }, // Reduz para 0 usuários em 10s
    { duration: '1m', target: 80 }, // Reduz para 0 usuários em 10s


  ],
};

export default function () {
  const currentRequestIndex = ++requestIndex;

  // Escolher um usuário aleatório
  const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
  
  // Realiza o login com o email e senha
  const url = 'https://api.exemplo.com/api/auth/login';
  const payload = JSON.stringify({
    email: '11111111111', // CPF também é uma opção de login
    password: '@bet2025',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'application-encrypt': 'fdstst',
      // 'User-Agent': 'k6',
    },
  };

  // Envia a requisição HTTP POST
  const response = http.post(url, payload, params);

  if (response.status !== 200) {
    console.log(`Requisição #${currentRequestIndex}`);
    console.log(`URL: ${url}`);
    console.log(`Status: ${response.status}`);
    console.log(`Resposta: ${response.body}`);
    console.log(`###############################################################`);
  } 
    check(response, {
      'status was successful': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });

  sleep(1); // Aguarda 1 segundo antes de repetir a execução
}

