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

## Portas

O servidor Node ouve na porta **3000** dentro do container (definido em `server.js`).

O `docker-compose.yml` mapeia a porta **3001 do host** para a **3000 do container**:

    ports:
      - "3001:3000"

- Acesso no browser: http://localhost:3001
- Swagger: http://localhost:3001/api-docs
- Os logs do container mostram 3000, porque é a porta interna.

Esta separação permite correr o lab1 (porta 3000) e o lab2 (porta 3001) ao mesmo tempo.

## Versão node.js

- v24.21.0

## Segundo Recurso

* Domínio: dominio
* Campos:
  * cnt: inteiro
  * unique: string unique 
  * estados: (estado1, estado2, estado3) 
  * gerado: new Date()

## Cenário de tarefas com projectos e utilizadores

* Domínio: Cenário de tarefas com projectos e utilizadores
* Pontos de entrada (entry points)
  * /api/tarefas
  * /api/tarefas/{id}
  * /api/projectos
  * /api/projectos/{id}
  * /api/projectos/{id}/tarefas
  * /api/utilizadores
  * /api/utilizadores/{id}
  * /api/utilizadores/{id}/tarefas
  * /api/eventos
* Campos: 
  * tarefa:
    * id: inteiro
    * titulo: string
    * estado: (aberta, em_progresso, concluida, cancelada)
    * prioridade: (alta, baixa, media, alta, critica)
    * id_projecto: inteiro
    * id_utilizador: inteiro
  * projectos:
    * id: inteiro 
    * nome: string
    * descricao: string
    * estado: (activo, arquivado, cancelado)~
  * utilizadores:
    * id: inteiro 
    * nome: string 
    * email: string

## Declaração de utilização de IA

- Link para interacção com IA https://chat.deepseek.com/share/dtew6et16uf6p0hgtn que é o seguimento do lab1, mantendo assim o contexto no diálogo coma a IA
- Desactivei o autocomplete do VSC

## Testes e evidências

- Consultar /lab2/testes/lab2.postman_collection.json que é autoexplicativo


## Adicionada Documentação 

Documentação da API disponível em http://localhost:$3001/api-docs

## Comentários livres

