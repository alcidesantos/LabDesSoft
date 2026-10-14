const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const path = require('node:path');
const def = loader.loadSync(path.join(__dirname, 'protos/academico.proto'), {
  keepCase: true, longs: String, defaults: true, oneofs: true
});
const api = grpc.loadPackageDefinition(def).academico;

function SubmeterNota(call, cb) {
  const r = call.request;
  if (!r.aluno_id || !r.disciplina_code || r.nota < 0 || r.nota > 20)
    return cb(null, { code: grpc.status.INVALID_ARGUMENT, mensagem: 'Dados inválidos; nota deve estar entre 0 e 20.' });
  //  return cb(null, { sucesso: false, mensagem: 'Dados inválidos; nota deve estar entre 0 e 20.' });
  console.log('Nota recebida:', r);
  cb(null, { sucesso: true, mensagem: 'Nota registada (demonstração).' });
}
function ObterPerfil(call, cb) {
  const perfis = {
    '12345678': { nome: 'Ana Martins', departamento: 'Informática' },
    '87654321': { nome: 'Rui Lopes', departamento: 'Matemática' }
  };
  const perfil = perfis[call.request.nif];
  if (!perfil) return cb({ code: grpc.status.NOT_FOUND, message: 'Professor não encontrado.' });
  cb(null, perfil);
}
function MonitorizarLocalizacao(call) {
  const pontos = [
    { latitude: 39.236, longitude: -8.686 },
    { latitude: 39.238, longitude: -8.683 },
    { latitude: 39.241, longitude: -8.680 }
  ];
  let i = 0;
  const timer = setInterval(() => {
    if (i >= pontos.length) { clearInterval(timer); call.end(); return; }
    call.write({ ...pontos[i++], timestamp: Date.now() });
  }, 1000);
  call.on('cancelled', () => clearInterval(timer));
}
function EnviarLogs(call, cb) {
  let n = 0;
  call.on('data', x => { n++; console.log(`[${x.origem}] ${x.mensagem}`); });
  call.on('end', () => cb(null, { recebidos: n, mensagem: `Recebidas ${n} entradas.` }));
}
function CanalChat(call) {
  call.on('data', x => call.write({
    utilizador: 'servidor', texto: `Recebido: ${x.texto}`
  }));
  call.on('end', () => call.end());
}
const server = new grpc.Server();
server.addService(api.AvaliacaoService.service, {
  SubmeterNota, ObterPerfil, MonitorizarLocalizacao, EnviarLogs, CanalChat
});
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) throw err;
  console.log(`gRPC a escutar na porta ${port}`);
  server.start();
});
