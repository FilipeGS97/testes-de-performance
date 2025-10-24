// a finalidade dessa automação é testar a perfomance da API do cassino, simulando o envio de requisições de apostas (bet) e ganhos (win).
// 

import http from 'k6/http';
import { check, sleep, group } from 'k6';

// Função para gerar strings aleatórias de 44 caracteres
function generateUniqueId(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Cabeçalhos para todas as requisições
const headers = {
  'Content-Type': 'application/json',
  'application-encrypt': 'apitst',
  //'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vYmFja2Rldi5mZHMuYmV0L2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNzQyNTY3MTU1LCJleHAiOjE3NDI2NTM1NTUsIm5iZiI6MTc0MjU2NzE1NSwianRpIjoia3hoajZlRGFiSEl4a0FUVCIsInN1YiI6IjIxIiwicHJ2IjoiMzdiN2M1MGIyNTA0MWE0YzIwZmU0N2MyNDJlMWJmZDBmNjMwOTJjNSJ9.uxh6lBwKG0MJBJPaJYPrzWD5Svf6uLsH21WwigPszL4',
};

export const options = {
  stages: [
    { duration: "10s", target: 10 },   // Sobe para 5 usuários em 10s
    { duration: "20s", target: 25 },  // Depois para 10 usuários em 20s
    { duration: "30s", target: 50 },  // Sobe para 20 usuários em 30s
    { duration: "1m", target: 300 },   // Sobe para 50 usuários em 1 minuto
    //{ duration: "5m", target: 300 },  // Chega a 100 usuários em 1 minuto
    //{ duration: "2m", target: 500 },  // Chega a 100 usuários em 1 minuto
    //{ duration: "30s", target: 800 },  // Chega a 100 usuários em 1 minuto
    //{ duration: "1m", target: 1100 },  // Chega a 100 usuários em 1 minuto
    //{ duration: "1m", target: 1500 },  // Chega a 100 usuários em 1 minuto
    //{ duration: "1m", target: 1700 },  // Chega a 100 usuários em 1 minuto
    //{ duration: "1m", target: 2000 },  // Chega a 100 usuários em 1 minuto
    //{ duration: "1m", target: 2500 },  // Chega a 100 usuários em 1 minuto
    //{ duration: "1m", target: 3000 },  // Chega a 100 usuários em 1 minuto
  ],
};

// gerando números aleatórios para diferenciar na hora de comparar apostas e ganhos.


export default function () {
  const providerSessionId = generateUniqueId(44);

  //const bet = Number((Math.random() * (2.00 - 0.10) + 0.10).toFixed(2));
  //const win = Number((Math.random() * (2.00 - 0.10) + 0.10).toFixed(2));


  group('Operações simultâneas', function () {
    // Criando os dados da requisição Bet
    let betRequest = {
      method: 'POST',
      url: 'https://api.exemplo/api/casino/',
      body: JSON.stringify({
        token: 'backdev-6617a60b61e594.039013',
        event_name: 'bet',
        amount: 2,//bet,
        user_id: 27,
        game_id: 726,
        game_provider_id: 5,
        provider_session_id: providerSessionId,
        provider_round_id: providerSessionId,
        provider_transaction_id: providerSessionId,
      }),
      params: { headers },
    };
    
    //console.log(`bet: ${bet}`); // para acompanhar divergências

    // Envia a requisição Bet primeiro
    let betResponse = http.post(betRequest.url, betRequest.body, betRequest.params);

    // Verificação da requisição Bet e log
    
    if (betResponse.status !== 200) {
      console.log(`Round id da Bet: ${providerSessionId}`);
      console.log(`Erro na requisição Bet:`);
      console.log(`URL: ${betRequest.url}`);
      console.log(`Status: ${betResponse.status}`);
      const betResponseBody = JSON.parse(betResponse.body);
      console.log(`Event Name: ${betResponseBody.event_name}`);
      console.log(`###############################################################`);
      
    } else {
      check(betResponse, {
        'Bet request foi bem sucedida': (r) => r.status === 200,
        'tempo de resposta < 500ms': (r) => r.timings.duration < 500,
      });
    }


    // Se a requisição BET for bem-sucedida, envia a requisição WIN. A API aceita a requisição WIN apenas se houver uma requisição BET de mesmo ID. 

    if (betResponse.status === 200) {
      // Criando os dados da requisição Win
      let winRequest = {
        method: 'POST',
        url: 'https://api.exemplo.com/api/casino/',
        body: JSON.stringify({
          token: 'backdev-6617a60b61e594.039013',
          event_name: 'win',
          amount: 2,//bet,
          user_id: 27,
          game_id: 726,
          game_provider_id: 5,
          provider_session_id: providerSessionId,
          provider_round_id: providerSessionId,
          provider_transaction_id: providerSessionId,
          bet_transaction_id: providerSessionId, // igual o round id
        }),
        params: { headers },
      };

      //console.log(`win: ${bet}`); // para acompanhar divergências

      // Envia a requisição Win
      let winResponse = http.post(winRequest.url, winRequest.body, winRequest.params);

      // Verificação da requisição Win e log
    
      if (winResponse.status !== 200) {
        console.log(`Round id da Win: ${providerSessionId}`);
        console.log(`Erro na requisição Win:`);
        console.log(`URL: ${winRequest.url}`);
        console.log(`Status: ${winResponse.status}`);
        const winResponseBody = JSON.parse(winResponse.body);
        console.log(`Event Name: ${winResponseBody.event_name}`);
        console.log(`###############################################################`);
        
      } else {
        check(winResponse, {
          'Win request foi bem sucedida': (r) => r.status === 200,
          'tempo de resposta < 500ms': (r) => r.timings.duration < 500,
        });
      }
    }
  });

  sleep(1); // Aguarda 3 segundos antes de repetir a execução
}
