# testes-de-performance
Testes de performance aplicados à plataforma de apostas.


🚀 **Repositório de Testes de Carga (Load Testing) com K6**
Este repositório contém scripts de automação de testes de desempenho e carga, desenvolvidos com a ferramenta K6, para avaliar a robustez, escalabilidade e desempenho de nossas APIs e serviços.

🎯 **Objetivo Principal**
O objetivo central é identificar o limite de capacidade do sistema e verificar se as APIs conseguem suportar o volume esperado de usuários (VUs - Virtual Users) e de requisições por segundo (RPS) sem apresentar degradação de desempenho ou falhas, como erros HTTP 500 ou timeouts.

**Focos Específicos**
- **Testes de Estresse** (Stress Testing): Encontrar o ponto de quebra (capacidade máxima) das APIs, forçando o sistema além de sua capacidade nominal.

- **Testes de Carga** (Load Testing): Simular o tráfego de pico esperado em condições normais de uso.

- **Testes de Rampagem** (Ramping-VUs): Aumentar gradualmente a carga para observar como o sistema reage ao crescimento do tráfego.

⚙️ **Configuração dos Testes**
Os testes são configurados no arquivo principal do K6 e utilizam o executor: "ramping-vus" para simular um aumento gradual e escalonado da carga.

✅ **Critérios de Sucesso e Verificação**
O sucesso do teste é verificado através de cheques (check) e da ausência de falhas críticas:

**Código de Status HTTP**: O status deve ser 200 (OK) para todas as requisições válidas. Códigos 5xx (500, 503, etc.) indicam falha e interrompem o teste.

'status was successful': (r) => r.status === 200,

**Tempo de Resposta (Latência):** O tempo de resposta deve ser mantido dentro de um limite aceitável, geralmente abaixo de 500ms para a maioria das requisições.

'response time < 500ms': (r) => r.timings.duration < 500,

**Interrupção no 500**
O script está configurado para interromper a execução (fail) imediatamente se for detectado um status HTTP 500 (Erro Interno do Servidor), fornecendo o número exato de usuários virtuais (__VU) no momento da falha, que é o limite de quebra.
