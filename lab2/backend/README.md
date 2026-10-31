# Lab2 — Backend

API Node.js/Express do Laboratório 2 da cadeira Laboratório de Desenvolvimento de Software.

## Requisitos

- Docker Desktop (Windows) com integração WSL ativa
- WSL

## Como correr

A partir desta pasta (`lab2/backend`):

```bash
# Arrancar em foreground (vês logs; Ctrl+C para parar)
docker compose up

# Arrancar em background (liberta o terminal)
docker compose up -d

# Ver logs em direto
docker compose logs -f

# Parar
docker compose down

# Abrir um shell no container que está a correr
docker compose exec app sh

# Instalar um pacote novo
docker compose exec app npm install <pacote>
```

## Portas e Documentação

O servidor Node.js está configurado para ouvir a porta `3000` **dentro** do container Docker (definido no `server.js`). No entanto, o `docker-compose.yml` mapeia a porta `3001` do host para a `3000` do container (`"3001:3000"`). 

Esta separação é intencional e permite correr o **lab1** (porta 3000) e o **lab2** (porta 3001) em simultâneo sem conflitos de rede. Por este motivo, os logs do container mostram a porta 3000, mas o acesso externo (no browser) deve ser feito sempre através da porta 3001.

### Endpoints e Interfaces Disponíveis

- **API REST:** `http://localhost:3001`
- **Endpoint SSE (Eventos):** `http://localhost:3001/api/eventos`
- **Documentação Swagger (OpenAPI):** `http://localhost:3001/api-docs`
- **Documentação AsyncAPI Studio:** `http://localhost:8000`

### Banner de Arranque
Para facilitar o desenvolvimento, o servidor imprime um resumo de todos os pontos de acesso no terminal assim que arranca, juntamente com o log do Docker:

```text
app-1     | =========================================================
app-1     | API do Lab2 a correr:  http://localhost:3001
app-1     | Endpoint SSE:          http://localhost:3001/api/eventos
app-1     | Swagger UI (OpenAPI):  http://localhost:3001/api-docs
app-1     | AsyncAPI Studio:       http://localhost:8000
app-1     | =========================================================
```

## Versão node.js

- v24.21.0

## Segundo Recurso

* **Domínio**: dominio
* **Campos**:
  * cnt: inteiro
  * unique: string unique 
  * estados: (estado1, estado2, estado3) 
  * gerado: new Date()

## Cenário de tarefas com projectos e utilizadores

* **Domínio**: Cenário de tarefas com projectos e utilizadores
* **Endpoints**:
  * /api/tarefas
  * /api/tarefas/{id}
  * /api/projectos
  * /api/projectos/{id}
  * /api/projectos/{id}/tarefas
  * /api/utilizadores
  * /api/utilizadores/{id}
  * /api/utilizadores/{id}/tarefas
  * /api/eventos
* **Campos**: 
  * ***tarefa***:
    * id: inteiro
    * titulo: string
    * estado: (aberta, em_progresso, concluida, cancelada)
    * prioridade: (alta, baixa, media, alta, critica)
    * id_projecto: inteiro
    * id_utilizador: inteiro
  * ***projectos***:
    * id: inteiro 
    * nome: string
    * descricao: string
    * estado: (activo, arquivado, cancelado)~
  * ***utilizadores***:
    * id: inteiro 
    * nome: string 
    * email: string

## Declaração de utilização de IA

- Link para interacção com IA https://chat.deepseek.com/share/8tfcrqsp45gpdzuril que consiste no seguimento do lab1, mantendo assim o contexto no diálogo coma a IA. A interação com a IA foi usada várias vezes como ponto de partida para a realização do laboratório. Tipicamente começo qualquer trabalho (de programação e não só) com um outro que tenha uma estrutura sememlhante e vou ajustando para a realidade que tenho pela frente. Há dezenas de anos era com um exemplo tirado de um livro. Depois, com um exemplo tirado de uma disquete. Mais tarde, com um exemplo tirado de algum site na Internet. Agora, é com algo extraído da IA. continua a ser a mesma forma de proceder.
- Para maior controlo, desactivei o autocomplete do VSC

## Justificação Técnica: REST (Lab1) vs. SSE (Lab2)

No desenvolvimento do Lab2, a arquitetura evoluiu de uma abordagem puramente REST para uma arquitectura híbrida, integrando Server-Sent Events (SSE). Esta escolha foi feita para responder aos requisitos de notificação em tempo real, mantendo os endpoints REST para as operações de manipulação de dados.

* **Padrão de comunicação e direcção do fluxo**
  * **REST (Lab1)**: Baseia-se no padrão Request/Response (pedido/resposta). O fluxo é unidirecional e iniciado pelo cliente (pull). O cliente solicita um recurso (ex: GET /tarefas) e o servidor responde e fecha a ligação.
  * **SSE (Lab2)**: Baseia-se num padrão orientado a eventos (Event-Driven). O fluxo é unidirecional do servidor para o cliente (push). O cliente abre uma única ligação HTTP persistente (GET /api/eventos), e o servidor mantém essa ligação aberta para enviar actualizações (novas tarefas, alterações de estado) à medida que ocorrem.
* **Adequação ao requisito e aos clientes envolvidos**
  * A abordagem REST do Lab1 é adequada para operações CRUD (Create, Read, Update, Delete), onde o cliente dita o ritmo da interação.
  * Para o Lab2, o requisito de mostrar alterações de tarefas em tempo real a múltiplos utilizadores num dashboard tornaria o REST puro ineficiente, pois exigiria polling constante (o cliente a perguntar "houve mudanças?" a cada segundo). O SSE é o padrão ideal para este cenário, pois o cliente (o browser) suporta nativamente a API EventSource, eliminando a necessidade de bibliotecas externas pesadas.
* **Complexidade de implementação e operação**
  * **REST**: É conceptualmente simples e, na sua essência, stateless (sem estado). Cada pedido é independente, o que facilita a escalabilidade horizontal (basta adicionar mais servidores).
  * **SSE**: Aumenta a complexidade porque introduz estado no servidor. O servidor tem de manter uma lista (no nosso caso, um objeto Set) de todos os clientes ligados. Além disso, exige gestão de keep-alive (envio de pings periódicos para evitar que eventuais proxies cortem a ligação) e gestão de memória para remover clientes que se desligaram abruptamente.
* **Tratamento de erros, validação e limitações relevantes**
  * **REST**: O tratamento de erros é padronizado e simples, utilizando códigos de estado HTTP (400, 404, 500). A validação de dados (ex: campos obrigatórios, enums de estado) ocorre antes de a resposta ser enviada, garantindo a integridade dos dados.
  * **SSE**: Não substitui o REST para validação. A validação continua a ser feita nos endpoints REST (POST/PUT). Se a validação falhar, o SSE não é acionado. No SSE, os erros estão maioritariamente ligados à perda de ligação (Network Errors). A principal limitação é que o SSE é estritamente unidirecional (servidor → cliente) e está limitado pelo protocolo HTTP/1.1 a 6 ligações simultâneas por domínio no browser (no HTTP/2 este limite desaparece).
* **Vantagens e Desvantagens da Tecnologia Escolhida (SSE)**
  * **Vantagem (Justificada): Comunicação em tempo real com baixo consumo de recursos.** Em vez de o cliente fazer dezenas de pedidos HTTP por minuto para verificar alterações (polling), o servidor notifica-o apenas quando há um evento real (ex: tarefa-criada). Isto poupa largura de banda e processamento no servidor, e a reconexão em caso de falha de rede é feita automaticamente pelo browser.
  * **Desvantagem (Justificada): Dificuldade de escalabilidade horizontal (Stateful).** Como o servidor guarda as ligações em memória, se a aplicação crescer e precisar de correr em múltiplos servidores (ex: Load Balancer), um evento criado no Servidor A não chegará aos clientes ligados ao Servidor B. Para resolver isto, seria necessário implementar um message broker para sincronizar os eventos entre instâncias, o que adiciona uma camada significativa de complexidade à operação.

## Testes e evidências

- Consultar /lab2/testes/lab2.postman_collection.json que é autoexplicativo





