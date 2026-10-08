# Lab1 — Backend

API Node.js/Express do Laboratório 1 da cadeira Laboratório de Desenvolvimento de Software.

## Requisitos

- Docker Desktop (Windows) com integração WSL ativa
- WSL

## Como correr

A partir desta pasta (`lab1/backend`):

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

## Versão node.js

- v24.21.0

## Segundo Recurso

* Domínio: dominio
* Campos:
  * cnt: inteiro
  * unique: string unique 
  * estados: (estado1, estado2, estado3) 
  * gerado: new Date()

## Declaração de utilização de IA

- Link para interacção com IA https://chat.deepseek.com/share/dtew6et16uf6p0hgtn onde a usei para perceber as opções de arquitectura e como usar o git
- Link para interacção com IA https://chat.deepseek.com/share/hzv594wpx28t03ehyv onde a usei para aclarar o código dado em aula e para esclarecer dúvidas de jscript e/ou arquitectura API REST
- Link para interacção com IA https://chat.deepseek.com/share/9lrmnfepvb291i928g onde a usei para aprender na íntegra algo não aprendido em aula; optei por fazer, no Postman, copy-paste da IA do detalhe de cada um dos request. Usei a informação gerada para preencher as tabelas mais à frente 
- Muitas vezes aceitei o autocomplete do VSC, que é produzido por IA

## Testes e evidências

| Teste | Corpo | Esperado | Objectivo |
| --- | --- | --- | --- |
| GET / | | 200 | Estado Aplicação |
| GET /health | | 200 | Estado aplicação|
| GET /api/items | | 200 | Colecção |
| GET /api/items&name=Item1 | | 200 | Recurso existente |
| GET /api/items&name=a&name=b | | 400 | Duplicação parâmetro |
| GET /api/items&sort=name&order=asc | | 200 | Sentido ordenação |
| GET /api/items&sort=name | | 400 | Sentido obrigatório em função da ordenação |
| GET /api/items&sort=invalido&order=asc | | 400 | Se ordenação é fornecida, deve ser defido em função de quê |
| GET /api/items&page=1&limit=1 | | 200 | Parametros página e limite consistentes |
| GET /api/items&page=0&limit=1 | | 400 | Parâmetros página e limite positivos |
| GET /api/items/1 | | 200 | Item devolvido |
| GET /api/items/999 | | 404 | Item inexistente |
| POST /api/items | { "name": "ItemPostman" } | 201 | Criação de um item |
| POST /api/items | [ { "name": "Lote1" }, { "name": "Lote2" } ] | 201 | Criação de um array de itens |
| POST /api/items&x=1 | | 400 | Corpo deve estar preenchido |
| PUT /api/items/5 | { "name": "ItemAtualizado" } | 200 | Actualizado item |
| PUT /api/items/9999 | { "name": "X" } | 404 | Item não encontrado |
| PUT /api/items/1 | { "name": "   " } | 200 | Actualizado item |
| DELETE /api/items/5 | | 204 | Item não existente |
| DELETE /api/items/ | | 404 | Não foi identificado que item eliminar |
| GET /segundorecurso | | 200 | Listagem itens existentes |
| GET /segundorecurso/1 | | 200 | Item existe |
| POST /segundorecurso | { "unico": "RegistoPostman", "estado": "estado1" } | 201 | Item criado |
| POST /segundorecurso | { "unico": "RegistoPostman", "estado": "estado1" } | 201| Se duplicado chave alterada |
| POST /segundorecurso | { "unico": "RegistoEstadoInvalido", "estado": "estadoXPTO" } | 201 | Estado corrigido se inválido |
| PUT /segundorecurso/3 | { "unico": "RegistoAtualizado", "estado": "estado3" } | | 200 | Adicionado item |
| DELETE /segundorecurso/3 | | 200 | Item eliminado |
| DELETE /segundorecurso/9999 | | 404 | Iem não encontrado |

## Tabela de Endpoints

| Método | Endpoint | Parâmetros / corpo | Sucesso | Erros |
| --- | --- | --- | --- | --- |
| GET | / | | 200 | 4xx, 5xx |
| GET | /health | | 200 | 4xx, 5xx |
| GET | /api/items | | 200 | 400 |
| GET | /api/items/1 | | 200 | 400 |
| POST | /api/items | { "name": "ItemPostman" } | 201 | 400 |
| POST | /api/items/*splat | | | 400 |
| PUT | /api/items/5 | { "name": "ItemAtualizado" } | 200 | 400, 404 |
| DELETE | /api/items/5 | | 204 | 400, 404 |
| DELETE | /api/items/ | | | 404 |
| GET | /segundorecurso | | 200 | |
| GET | /segundorecurso/1 | | 200 | |
| POST | /segundorecurso | { "unico": "RegistoPostman", "estado": "estado1" } | 201 | |
| PUT | /segundorecurso/3 | { "unico": "RegistoAtualizado", "estado": "estado3" } | 200 | |
| DELETE | /segundorecurso/3 | | 200 | 404 |

## Adicionada Documentação 

Documentação da API disponível em http://localhost:${port}/api-docs

## Comentários livres

- Em /api/items optei por fazer um interface propositadamente complexo porque queria aprender; num ambiente real, não seria como foi feito aqui; no /segundorecurso/, pelo contrário, optei por ser bastante mais minimalista e não validar nada, mas por outro lado, não expor o nome interno dos campos.
- Como comentário pessoal, penso que não faz sentido os professores estarem com medo de que os estudantes usem a IA para aprender, e não faz sentido limitarem aquilo que é feito em aula com medo que que os alunos se limitem a copiar o que foi dito em aula. Actualmente, lamento, parece-me que a principal preocupação dos professores é aferir o que o aluno responde ou não responde (porque nem se tenta saber se o aluno sabe de facto). Penso que a principal preocupação dos professores deveria de ser que os alumos aprendessem. Sabemos que numa conversa entre professor e aluno, o professor, se quiser, fica a saber se o aluno sabe ou não sabe. Mesmo que não o consiga evidenciar materialmente... mas esse é outro problema. Pessoalmente, penso que o professor deveria dar notas sem ter que o documentar. Mesmo que isso implique recusar Bolonha. Por analogia, não é por pesar uma vaca que ela aumenta de peso. O peso decorre da alimentação.
- Depois, observo que já nem se declara qualquer bibliografia, empurrando dessa forma para o uso da IA. Recordo perfeitamente que a forma de aprender era com exemplos, uns mais simples, outros mais complexos e nalgum mommento, formalizando. Nessa altura, a discussão era sobre o que apresentar primeiro: se os exemplos, se a definição formal.
- Pessolmente, tenho dificuldade em eprender sem ter uma referência, sem ter um texto que me sirva de apoio quando tenho dúvidas, que tenha tanto a definição formal como vários exemplos e, oxalá, um texto corrido, que pode ser uma explicação, um enquadramento, um mostrar da necessidade, um abrir de olhos. Não significa que leia sempre esse texto de suporte, mas pode ajudar muito. A alternativa é questionar a IA... que devido à sua natureza, tende a ser maioritária, e nem sempre correcta. É aqui que faz sentido haver professores... a IA não guia e pode levar-nos a dispersar por assuntos laterais.
- Gostaria de ter tido um exemplo detalhado de como fazer os testes mais profundos com o Postman. Novamente sou empurrado para a IA... o que não é um problema, mas retira necessidade de assistir às aulas para aprender. Ou seja, converte a sala de aula numa peça de teatro em que os alumos fingem que aprendem e os professores fingem que ensinam.
- Na realidade, como este exercicio só vale 2% da nota, é irrelevante a sua entrega. Só a teimosia e a vontade de aprender leva a seguir em frente. 
- Penso que o enunciado do laboratório foi realizado por inteligência artificial. Não vem mal ao mundo por isso. Acontece que duvido que alguem tenha verificado se o que consta do enunciado foi de facto ensinado em aula. Refiro-me ao uso do postman, de como fazer testes de comparação de pedido esperado e pedido obtido. Não tem mal obrigar o aluno a investigar por conta própria determinado assunto. Mas penso que isso (necessidade de investigar por conta própria) deveria ser declarado no enunciado. Não porque seja complicado mas porque requer tempo adicional. Admito que esta situação decorra do facto de a cadeira estar a ser dada a duas mãos e não existir momento para de facto sincronizar o que cada mão fez. 
- Não vou fazer o vídeo. Vale só 0,2% da nota final. Não justifica o esforço e não me ensina nada. 

## Comntário livre II

- Estou enormemente agradecido aos dois professores. A aula que se seguiu à realização e entrega do trabalho foi adicionou tudo aquilo que tinha faltado na primeira aula. Foi evidenciada humildade e capacidade de encaixe. 