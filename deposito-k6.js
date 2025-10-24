import http from 'k6/http';
import { check, sleep, fail } from 'k6';

let requestIndex = 0;

export const options = {
      stages: [
        { duration: '30s', target: 30 }, // Aumenta para 5 usuários em 10s
        { duration: '1m', target: 30 }, // Aumenta para 5 usuários em 10s
        { duration: '30s', target: 60 }, // Sustenta 10 usuários por 20s
        { duration: '1m', target: 60 }, // Sustenta 10 usuários por 20s
        { duration: '30s', target: 90 }, // Sustenta 10 usuários por 20s
        { duration: '1m', target: 90 }, // Sustenta 10 usuários por 20s
        { duration: '30s', target: 100 }, // Reduz para 0 usuários em 10s
        { duration: '1m', target: 100 }, // Reduz para 0 usuários em 10s
        { duration: '30s', target: 150 }, // Reduz para 0 usuários em 10s
        { duration: '1m', target: 150 }, // Reduz para 0 usuários em 10s
        { duration: '30s', target: 200 }, // Reduz para 0 usuários em 10s
        { duration: '1m', target: 200 }, // Reduz para 0 usuários em 10s
        { duration: '30s', target: 300 }, // Reduz para 0 usuários em 10s
        { duration: '1m', target: 300 }, // Reduz para 0 usuários em 10s
        { duration: '30s', target: 500 }, // Reduz para 0 usuários em 10s
        { duration: '1m', target: 500 }, // Reduz para 0 usuários em 10s

      ],
      gracefulStop: "10s", // Tempo de parada suave antes do término
    };

export default function () {

  const currentRequestIndex = ++requestIndex;

  const url = 'https://backdev.fds.bet/api/deposits'; // URL do endpoint de saque (modifique conforme necessário)

    // O payload para o saque
    const payload = JSON.stringify({
      "method": "pix",
      "amount": 1
    });

    const params = {
      headers: {
        'Content-Type': 'application/json',
        'application-encrypt': 'fdstst', // Cabeçalho de segurança, altere conforme necessário
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vYmFja2Rldi5mZHMuYmV0L2FwaS9yZWdpc3RlciIsImlhdCI6MTc0NTk1NjI5MSwiZXhwIjoxNzQ2MDQyNjkxLCJuYmYiOjE3NDU5NTYyOTEsImp0aSI6IlU3anBnRU5BYmJxT3FQYTUiLCJzdWIiOiIyMCIsInBydiI6IjM3YjdjNTBiMjUwNDFhNGMyMGZlNDdjMjQyZTFiZmQwZjYzMDkyYzUifQ.hUkYcfhPg3FsdG0CCTn5Fhs7AxwfQD6ioFQQET92Xi8',
      },
    };

    const response = http.post(url, payload, { ...params, timeout: '300s' });

    // Verificação de falha (status 500)
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

    // Verificação de status diferente de 200
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

    // Verificação de sucesso
    check(response, {
      'status was successful': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });

  sleep(1); // Aguarda 1 segundo antes de repetir a execução
}
