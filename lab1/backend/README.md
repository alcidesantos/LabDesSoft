# Lab1 — Backend

API Node.js/Express do Laboratório 1 da cadeira LabDesSoft.

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

## Declaração de utilização de IA

- adicionar link do deepseek
- Usei IA para perceber as opções de arquitectura e como usar o git
- Necessitei de usar IA porque algumas partes da exposição da aula foram algo pobres. Como comentário pessoal, não faz sentido os professores estarem com medo de os estudantes usem a IA para aprender, não faz sentido limitarem aquilo que é feito em aula com medo que os alunos se limitem a copiar o que foi dito em aula. Actualmente, parece-me que a principal preocupação dos professores é aferir o que o aluno responde ou não responde. Penso que a principal preocupação dos professores deveria de ser que os alumos aprendessem. Sabemos que numa conversa entre professor e aluno, o professor, se quiser, fica a saber se o aluno sabe ou não sabe. Mesmo que não o consiga evidenciar materialmente. Pessoalmente, penso que o professor deveria dar notas sem ter que o documentar. Mesmo que isso implique recusar Bolonha. Por analogia, não é por pesar uma vaca que ela aumenta de peso. O peso decorre do que foi feito antes. 