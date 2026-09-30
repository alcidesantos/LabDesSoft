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
```

## Declaração de utilização de IA

- Link para interacção com IA: https://chat.deepseek.com/share/dtew6et16uf6p0hgtn
- Usei IA para perceber as opções de arquitectura e como usar o git
- Necessitei de usar IA porque algumas partes da exposição da aula foram algo pobres. 

## Comentários livres

- Como comentário pessoal, penso que não faz sentido os professores estarem com medo de os estudantes usem a IA para aprender, e não faz sentido limitarem aquilo que é feito em aula com medo que os alunos se limitem a copiar o que foi dito em aula. Actualmente, parece-me que a principal preocupação dos professores é aferir o que o aluno responde ou não responde (porque nem se tenta saber se o aluno sabe de facto). Penso que a principal preocupação dos professores deveria de ser que os alumos aprendessem. Sabemos que numa conversa entre professor e aluno, o professor, se quiser, fica a saber se o aluno sabe ou não sabe. Mesmo que não o consiga evidenciar materialmente... mas esse é outro problema. Pessoalmente, penso que o professor deveria dar notas sem ter que o documentar. Mesmo que isso implique recusar Bolonha. Por analogia, não é por pesar uma vaca que ela aumenta de peso. O peso decorre do que foi feito antes. 
- Depois, observo que já nem se declara qualquer bibliografia, empurrando dessa forma para o uso da IA. Recordo perfeitamente que a forma de aprender era com exemplos, uns mais simples, outros mais complexos e nalgum mommento, formalizando. Nessa altura, a discussão era sobre o que apresentar primeiro: se os exemplos, se a definição formal.
- Pessolmente, tenho dificuldade em eprender sem ter uma referência, sem ter um texto que me sirva de apoio quando tenho dúvidas, que tenha tanto a definição formal como vários exemplos e, oxalá, um texto corrido, que pode ser uma explicação, um enquadramento, um mostrar da necessidade. Não significa que leia sempre esse texto de suporte, mas ajuda muito. A alternativa é questionar a IA... que devido à sua natureza, tende a ser maioritária, e nem sempre correcta. É aqui que faz sentido haver professores... a IA não guia e pode levar-nos a dispersar por assuntos laterais.