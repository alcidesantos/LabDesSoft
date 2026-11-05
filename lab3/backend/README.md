# Lab3 — Backend

API Node.js/Express do Laboratório 3 da cadeira Laboratório de Desenvolvimento de Software. 
Nesta versão, os dados deixaram de estar em memória e passaram a ser persistidos numa base de dados **PostgreSQL** utilizando o ORM **Prisma**.

## Requisitos

- Docker Desktop (Windows) com integração WSL ativa
- WSL

## Como correr

A partir desta pasta (`lab3/backend`):

```bash
# 1. Arrancar a base de dados (PostgreSQL) em background
docker compose up -d db

# 2. Aplicar as migrações do Prisma (criar as tabelas na BD)
docker compose exec app npx prisma migrate dev

# 3. Arrancar a API e os visualizadores (foreground)
docker compose up

# Outros comandos úteis:
docker compose up -d                          # Arrancar tudo em background
docker compose logs -f app                    # Ver logs da API em direto
docker compose down                           # Parar tudo
docker compose exec app sh                    # Abrir um shell no container Node
docker compose exec app npm install <pacote>  # Instalar um novo pacote
```

## Portas e Documentação

O servidor Node.js está configurado para ouvir a porta 3000 dentro do container Docker. O docker-compose.yml mapeia as portas para evitar conflitos com os laboratórios anteriores (Lab1 e Lab2):
- **API REST**: http://localhost:3002 (mapeado para a 3000 interna)
- **Endpoint SSE (Eventos)**: http://localhost:3002/api/eventos
- **Documentação Swagger (OpenAPI)**: http://localhost:3002/api-docs
- **Documentação AsyncAPI Studio**: http://localhost:8001
- **PostgreSQL**: localhost:5433 (mapeado para a 5432 interna)

### Justificação da alteração da porta do PostgreSQL

**Nota sobre a porta da Base de Dados (5433)**

Por defeito, o PostgreSQL utiliza a porta 5432. No entanto, o ambiente de desenvolvimento (Windows) já possui uma instância local do PostgreSQL a correr nessa mesma porta.

Para evitar um conflito de portas (Port Collision), que impediria o contentor Docker de arrancar corretamente ou criaria ambiguidade na ligação, optou-se por mapear a porta interna do contentor (5432) para a porta 5433 no host ("5433:5432" no `docker-compose.yml`).

Desta forma, é possível manter a instância nativa do Windows e a instância contentorizada do Lab3 a correr em simultâneo, sem interferências. O Prisma, ao correr dentro da rede do Docker, comunica internamente com a porta 5432 (através do nome do serviço db), pelo que o código da aplicação não precisou de ser alterado para acomodar esta mudança.

### Banner de Arranque
Para facilitar o desenvolvimento, o servidor imprime um resumo de todos os pontos de acesso no terminal assim que arranca, juntamente com o log do Docker:

```text
app-1     | ==========================================================================
app-1     | API do Lab3 a correr (Prisma + Postgres):  http://localhost:3002
app-1     | Endpoint SSE:                              http://localhost:3002/api/eventos
app-1     | Swagger UI (OpenAPI):                      http://localhost:3002/api-docs
app-1     | AsyncAPI Studio:                           http://localhost:8001
app-1     | --------------------------------------------------------------------------
app-1     | Base de Dados (PostgreSQL):
app-1     |    Host: localhost | Porta: 5433
app-1     |    Base de Dados: lab3db | User: consultar .env | Pass: consultar .env
app-1     |    String de conexão: consultar .env
app-1     | ===========================================================================
```

## Base de Dados e Prisma

Os dados residem num volume Docker (`lab3_pgdata`). Para aceder à base de dados através de uma ferramenta gráfica (DBeaver, pgAdmin) ou do terminal:
### Via DBeaver/pgAdmin (no Windows):
- **Host**: localhost
- **Porta**: 5433
- **Base de Dados**: lab3db
- **User/Password**: (verificar ficheiro .env)
### Via terminal (psql):
```bash
docker compose exec db psql -U lab3user -d lab3db
```

## Ficheiro .env

A string de conexão está definida no ficheiro `.env` (`DATABASE_URL`). Este ficheiro está no `.gitignore` e nunca deve ser commitado para o GitHub.

## Comandos úteis do Prisma
```bash
docker compose exec app npx prisma migrate dev --name <nome>  # Criar nova migração
docker compose exec app npx prisma generate                   # Atualizar o Prisma Client
docker compose exec app npx prisma studio                     # Abrir interface visual do Prisma
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
- Voltei a activar o autocomplete do VSC

## Testes e evidências

- Consultar /lab2/testes/lab3.postman_collection.json que é autoexplicativo

## O que mudou e porquê:
1. **Título e Introdução:** Atualizado para Lab3 e adicionada a menção ao PostgreSQL e Prisma.
2. **Como correr:** Adicionada a etapa obrigatória de correr as *migrações* (`npx prisma migrate dev`) antes de arrancar a API. Isto é vital para quem clonar o projeto, senão a base de dados está vazia.
3. **Portas:** Atualizadas para `3002` (API) e `8001` (AsyncAPI). Adicionada a porta `5433` da base de dados.
4. **Base de Dados:** Nova secção a explicar como ligar-se à BD usando o DBeaver/pgAdmin ou o `psql`, e um alerta sobre o `.env`.
5. **Modelos:** Atualizei a secção de campos para refletir os modelos exatos do `schema.prisma` (ex: `id` autoincrement, `email` unique).



