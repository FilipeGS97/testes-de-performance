import http from 'k6/http';
import { check, sleep, fail } from 'k6';

let requestIndex = 0;

export const options = {
      stages: [
        { duration: "10s", target: 5 },   // Sobe para 25 usuários em 10s
        { duration: "20s", target: 50 },  // Depois para 50 usuários em 20s
        { duration: "30s", target: 100 },  // Sobe para 100 usuários em 30s
        { duration: "30s", target: 150 },  // Sobe para 100 usuários em 30s
        { duration: "30s", target: 200 },   // Sobe para 200 usuários em 30s

      ],
      gracefulStop: "10s", // Tempo de parada suave antes do término
    };

export default function () {

  const currentRequestIndex = ++requestIndex;

  const url = 'https://backdev.fds.bet/api/withdrawals'; // URL do endpoint de saque (modifique conforme necessário)

    // O payload para o saque
    const payload = JSON.stringify({
      method: "pix",
      amount: 2,  // Valor de saque, pode ser modificado conforme necessário
      type: "email",
      pix: "filipegabriel132@gmail.com",  // PIX (pode ser modificado conforme necessário)
    });

    const params = {
      headers: {
        'Content-Type': 'application/json',
        'application-encrypt': 'fdstst', // Cabeçalho de segurança, altere conforme necessário
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vYmFja2Rldi5mZHMuYmV0L2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNzQyMzA3NjQ3LCJleHAiOjE3NDIzOTQwNDcsIm5iZiI6MTc0MjMwNzY0NywianRpIjoiWmszMkc0c1pHV0lCdDZYdSIsInN1YiI6IjUiLCJwcnYiOiIzN2I3YzUwYjI1MDQxYTRjMjBmZTQ3YzI0MmUxYmZkMGY2MzA5MmM1In0.YzEVAGGyakegWxEYxvJVgKMu0_V18zCL0soFg8KtJbw',
      },
    };

    const response = http.post(url, payload, params);

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
