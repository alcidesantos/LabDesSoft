const { createServer } = require('node:http');
const { createYoga, createSchema } = require('graphql-yoga');

const cursos = [
  { id: 'c1', sigla: 'EI', nome: 'Engenharia Informática' },
  { id: 'c2', sigla: 'GEST', nome: 'Gestão' }
];
const alunos = [
  { id: '42', nome: 'Maria Silva', email: 'maria.silva@universidade.pt', cursoId: 'c1' },
  { id: '43', nome: 'João Costa', email: null, cursoId: 'c2' }
];

const typeDefs = /* GraphQL */ `
  type Curso {
    id: ID!
    sigla: String!
    nome: String!
  }
  type Aluno {
    id: ID!
    nome: String!
    email: String
    curso: Curso!
  }
  type Query {
    alunoPorId(id: ID!): Aluno
    alunoPorEmail(email: String!): Aluno
    listarAlunos: [Aluno!]!
  }
  type Mutation {
    atualizarEmail(id: ID!, novoEmail: String!): Aluno!
    criarAluno(id: ID!, nome: String!, email: String, cursoId: ID!): Aluno!
  }
`;

const resolvers = {
  Aluno: {
    curso(aluno) {
      const curso = cursos.find(c => c.id === aluno.cursoId);
      if (!curso) throw new Error(`Curso não encontrado: ${aluno.cursoId}`);
      return curso;
    }
  },
  Query: {
    alunoPorId: (_, { id }) => alunos.find(a => a.id === id) ?? null,
    alunoPorEmail: (_, { email }) => alunos.find(a => a.email === email) ?? null,
    listarAlunos: () => alunos
  },
  Mutation: {
    atualizarEmail: (_, { id, novoEmail }) => {
      const aluno = alunos.find(a => a.id === id);
      if (!aluno) throw new Error(`Aluno ${id} não encontrado`);
      if (! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail)) throw new Error("Endereço de mail errado");
      aluno.email = novoEmail;
      return aluno;
    },
    criarAluno: (_, { id, nome, email, cursoId }) => {
      if (alunos.some(a => a.id === id)) {
        throw new Error(`Aluno ${id} já existe`);
      };
      const curso = cursos.find(c => c.id === cursoId);
      if (!curso) throw new Error(`Curso ${cursoId} não encontrado`);
      if (! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Endereço de mail errado");
      const novoAluno = { id, nome, email, cursoId };
      alunos.push(novoAluno);
      return novoAluno;
    }
  }
};

const yoga = createYoga({ 
schema: createSchema({ typeDefs, resolvers }),
maskedErrors: false 
});

createServer(yoga).listen(4000, () =>
  console.log('GraphQL disponível em http://localhost:4000/graphql')
);
