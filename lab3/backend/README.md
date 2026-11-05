# Lab3 — Backend

API Node.js/Express do Laboratório 3 da cadeira Laboratório de Desenvolvimento de Software. 
Nesta versão, os dados deixaram de estar em memória e passaram a ser persistidos numa base de dados **PostgreSQL** utilizando o ORM **Prisma**.

## Requisitos

- Docker Desktop (Windows) com integração WSL ativa
- WSL

## Como correr 

### Setup Inicial

Na primeira vez que clonas o projeto, ou se alterar o `schema.prisma`, deves preparar a base de dados a partir desta pasta (`lab3/backend`):

```bash
# 1. Arrancar todos os serviços (API, BD, Studios)
docker compose up -d

# 2. Aplicar as migrações do Prisma (criar as tabelas na BD)
docker compose exec app npx prisma migrate dev

# 3. Popular a base de dados com os dados iniciais (Seed)
docker compose exec app node prisma/seed.js
```

### Depois do setup inicial

A partir desta pasta (`lab3/backend`), basta correr:

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
- **Prisma Studio (Interface visual da BD)**: http://localhost:5555
- **PostgreSQL**: http://localhost:5433 (mapeado para a 5432 interna)

### Banner de Arranque
Para facilitar o desenvolvimento, o servidor imprime um resumo de todos os pontos de acesso no terminal assim que arranca, juntamente com o log do Docker:

```text
app-1     | ==========================================================================
app-1     | API do Lab3 a correr (Prisma + Postgres):  http://localhost:3002
app-1     | Endpoint SSE:                              http://localhost:3002/api/eventos
app-1     | Swagger UI (OpenAPI):                      http://localhost:3002/api-docs
app-1     | AsyncAPI Studio:                           http://localhost:8001
app-1     | Prisma Studio (Base de Dados):             http://localhost:5555
app-1     | --------------------------------------------------------------------------
app-1     | Base de Dados (PostgreSQL):
app-1     |    Host: localhost | Porta: 5433
app-1     |    Base de Dados: lab3db | User: consultar .env | Pass: consultar .env
app-1     |    String de conexão: consultar .env
app-1     | ===========================================================================
```

## Base de Dados, Prisma e Seed

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

## Modelos de Dados

### Prisma Schema

* **Enums**: O modelo de dados utiliza Enums para garantir a integridade dos estados:
  * EstadoTarefa: aberta, em_progresso, concluida, cancelada
  * PrioridadeTarefa: baixa, media, alta, critica

* **Tabelas**
  * ***Utilizador:***
    * id: inteiro (autoincrement)
    * nome: string
    * email: string (unique)
  * ***Projecto:***
    * id: inteiro (autoincrement)
    * nome: string
    * descricao: string
    * estado: string
  * ***Tarefa:***
    * id: inteiro (autoincrement)
    * titulo: string
    * estado: EstadoTarefa
    * prioridade: PrioridadeTarefa
    * id_projecto: inteiro (FK)
    * id_utilizador: inteiro (FK opcional)

### Segundo Recurso (resquício do lab1)

* **Domínio**: dominio
* **Campos**:
  * cnt: inteiro
  * unique: string unique 
  * estados: (estado1, estado2, estado3) 
  * gerado: new Date()

### Cenário de tarefas com projectos e utilizadores

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

## Declaração de utilização de IA

- Link para interacção com IA https://chat.deepseek.com/share/jvy319rvy2rx2ql4yx que consiste no seguimento do lab1 e lab2 mantendo assim o contexto no diálogo coma a IA. A interação com a IA foi usada várias vezes como ponto de partida para a realização do laboratório. Tipicamente começo qualquer trabalho (de programação e não só) com um outro que tenha uma estrutura sememlhante e vou ajustando para a realidade que tenho pela frente. Há dezenas de anos era com um exemplo tirado de um livro. Depois, com um exemplo tirado de uma disquete. Mais tarde, com um exemplo tirado de algum site na Internet. Agora, é com algo extraído da IA. continua a ser a mesma forma de proceder.
- Voltei a activar o autocomplete do VSC

## Testes e evidências

- Consultar /lab3/testes/lab3.postman_collection.json que é autoexplicativo

## Justificação de Decisões Técnicas

### Alteração da porta do PostgreSQL

O ambiente Windows já possui uma instância local do PostgreSQL a correr na porta padrão (5432). Para evitar conflitos de rede (port collision), o contentor mapeia a porta interna 5432 para a 5433 no host. O Prisma comunica internamente na rede Docker usando o hostname db e a porta 5432, pelo que a aplicação não sofre alterações.

### Porquê um Dockerfile customizado?

A imagem node:24-slim não inclui o OpenSSL por defeito. O Prisma requer o OpenSSL para estabelecer ligações seguras (TLS) à base de dados. O Dockerfile instala essa dependência para garantir o correto funcionamento da app e do Prisma Studio.





