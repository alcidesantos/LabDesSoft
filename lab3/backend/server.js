const express = require('express');
const { PrismaClient, EstadoTarefa, PrioridadeTarefa } = require('@prisma/client');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const swaggerDocument = yaml.load('./openapi.yaml');
const app = express();
const prisma = new PrismaClient(); 
const port = 3000;

const sse = require('./sse');
const nodemon = require('nodemon');

app.use(express.json())

app.use(express.static('public'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('API está a funcionar, (teste 2)!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const items = [
	{ id: 1, name: 'Item1'},
	{ id: 2, name: 'Item2'}
];

app.get('/api/items', (req, res) => {
	const { name, sort, order, page, limit } = req.query;

	let result = [...items];

	if (name !== undefined) {
		if (typeof name !== 'string') {
			return res.status(400).json({ error: 'O parâmetro name deve ser uma string (não pode estar duplicado)' });
		}
		const termo = name.toLowerCase();
		result = result.filter(item => item.name.toLowerCase().includes(termo));
	}

	if (sort) {
		if (typeof sort !== 'string') {
			return res.status(400).json({ error: 'O parâmetro sort deve ser uma string (não pode estar duplicado)' });
		}
		if (sort !== 'name' && sort !== 'id') {
			return res.status(400).json({ error: 'O parâmetro sort deve ser "name" ou "id"' });
		}
		if (!order) {
			return res.status(400).json({ error: 'O parâmetro order é obrigatório quando sort é fornecido' });
		}
		if (typeof order !== 'string') {
			return res.status(400).json({ error: 'O parâmetro order deve ser uma string (não pode estar duplicado)' });
		}
		if (order !== 'asc' && order !== 'desc') {
			return res.status(400).json({ error: 'O parâmetro order deve ser "asc" ou "desc"' });
		}
		const sortOrder = order === 'asc' ? 1 : -1;
		result.sort((a, b) => {
			if (a[sort] < b[sort]) return -1 * sortOrder;
			if (a[sort] > b[sort]) return 1 * sortOrder;
			return 0;
		});
	}

	if (page !== undefined || limit !== undefined) {
		console.log('page:', page, typeof page);
		console.log('limit:', limit, typeof limit);

		if (typeof page !== 'string' && limit === undefined) {
			return res.status(400).json({ error: 'O parâmetro page deve ser uma string (não pode estar duplicado)' });
		}

		if (typeof limit !== 'string' && page === undefined) {
			return res.status(400).json({ error: 'O parâmetro limit deve ser uma string (não pode estar duplicado)' });
		}
		if ((isNaN(parseInt(page)) && page !== undefined) || (isNaN(parseInt(limit)) && limit !== undefined)) {
			return res.status(400).json({ error: 'Os parâmetros page e limit devem ser números válidos' });
		}
		if (parseInt(page) < 1 || parseInt(limit) < 1) {
			return res.status(400).json({ error: 'Os parâmetros page e limit devem ser maiores que 0' });
		}
		const pageNum = parseInt(page) || 1;
		const limitNum = parseInt(limit) || 10;
		const totalItems = result.length;
		const totalPages = Math.ceil(totalItems / limitNum);
		const startIndex = (pageNum - 1) * limitNum;
		const paginatedResult = result.slice(startIndex, startIndex + limitNum);
		
		return res.status(200).json({
			page: pageNum,
			limit: limitNum,
			totalItems,
			totalPages,
			items: paginatedResult
		});

	}

	return res.status(200).json(result);
});


app.get(`/api/items/:id`, (req, res) => {
	const id = Number(req.params.id);

	if(isNaN(id) || id < 1) {
		return res.status(400).json({ error: 'O parâmetro id deve ser um número válido' });
	}

	const item = items.find(item => item.id === id);

	if(!item) {
		return res.status(404).json({ error: 'Item não encontrado'});
	}
	
	res.status(200).json(item);
});

// usar com POST em vez de GET para criar um novo item
app.post('/api/items', (req, res) => {
	const entrou = req.body;
	console.log('Entradas recebidas:', entrou);

	const criados = [];

	if (!entrou) {
		return res.status(400).json({error: 'O body não pode estar vazio'});
	}

	if (Array.isArray(entrou)) {

		if (!Array.isArray(entrou) || entrou.length === 0) {
			return res.status(400).json({error: 'O body deve ser um array não vazio'});
		}

		for (const item of entrou) {
			const { name } = item;
			if (typeof name === 'undefined') {
				return res.status(400).json({error: 'O campo name é obrigatório em todos os itens'});
			}

			if (typeof name !== 'string') {
				return res.status(400).json({error: 'O campo name deve ser uma string em todos os itens'});
			}

			if(name.trim() === '') {
				return res.status(400).json({error: 'O campo name não pode estar vazio em nenhum item'});
			}

			const newItem = {
				id: items.length ? Math.max(...items.map(item => item.id)) + 1: 1,
				name
			};
			items.push(newItem);
			criados.push(newItem);
		}

	} else {
		if (Object.keys(entrou).length === 0) {
			return res.status(400).json({error: 'O body não pode estar vazio'});
		}

		if (typeof entrou.name === 'undefined') {
			return res.status(400).json({error: 'O campo name é obrigatório'});
		}

		if (typeof entrou.name !== 'string') {
			return res.status(400).json({error: 'O campo name deve ser uma string'});
		}

		if(entrou.name.trim() === '') {
			return res.status(400).json({error: 'O campo name não pode estar vazio'});
		}

		const newItem = {
			id: items.length ? Math.max(...items.map(item => item.id)) + 1: 1,
			name: entrou.name
		};
		items.push(newItem);
		criados.push(newItem);
	}

	res.status(201).json(criados);
});


app.post('/api/items/*splat', (req, res) => {
	return res.status(400).json({ error: 'Não são aceites parâmetros no post. Usar o body para criar um novo item.'});
});

app.put('/api/items/:id', (req, res) => {

	console.log('Entradas recebidas:', req.body);

	const id = Number(req.params.id);

	if(isNaN(id) || id < 1) {
		return res.status(400).json({ error: 'O parâmetro id deve ser um número válido' });
	}
	
	const item = items.find(item => item.id === id);
	
	if(!item) {
		return res.status(404).json({ error: "item não encontrado"});
	}

	if(!req.body || Object.keys(req.body).length === 0) {
		return res.status(400).json({ error: "O body não pode estar vazio"});
	}

	const {name} = req.body || {};

	console.log('Nome recebido:', name);

	if(typeof name === 'undefined') {
		return res.status(400).json({ error: "o campo name é obrigatório"});
	}

	if(typeof name !== 'string') {
		return res.status(400).json({ error: "o campo name deve ser uma string"});
	}

	if(name.trim() === '') {
		return res.status(400).json({ error: "o campo name não pode estar vazio"});
	}
	
	item.name = name;
	res.json(item);
})

app.delete('/api/items/:id', (req, res) => {
	const id = Number(req.params.id);

	if(isNaN(id) || id < 1) {
		return res.status(400).json({ error: 'O parâmetro id deve ser um número válido' });
	}

	const item = items.find(item => item.id === id);

	if(!item) {
		return res.status(404).json({ error: 'Item não encontrado'});
	}

	items.splice(items.indexOf(item), 1);
	
	res.status(204).send();
});

app.delete('/api/items', (req, res) => {
	return res.status(404).json({ error: 'Não foi indicado um item para ser eliminado.'});
});

const campos = [
	{ idx: 1, unique: 'Item1', estados: "estado1", gerado: '2026-10-02T19:57:06.654Z' },
	{ idx: 2, unique: 'Item2', estados: "estado2", gerado: '2026-10-02T19:58:06.654Z' }
];

const estadosValidos = ['estado1', 'estado2', 'estado3'];

app.get('/segundorecurso', (req, res) => {
	const result = [...campos];
	return res.status(200).json(result);
});

app.get(`/segundorecurso/:cnt`, (req, res) => {
	const linha = campos.find(item => item.idx === Number(req.params.cnt));
	res.status(200).json(linha);
});

// adicionar um unico item ao segundorecurso
app.post('/segundorecurso', (req, res) => {
	const { unico, estado } = req.body;
	console.log('Entradas recebidas:', req.body);
	console.log(campos.length ? Math.max(...campos.map(item => item.idx)) + 1: 1);
	const cnt = campos.length ? Math.max(...campos.map(item => item.idx)) + 1: 1;
	const cmp = campos.find(item => item.unique === unico);
	console.log('cmp:', cmp);

	// decido não cumprir com o enunciado, que exige que caso a chave existe produza um 409
	// em vez disso, vou criar um novo item com a mesma chave, mas com um sufixo de timestamp para garantir a unicidade
	let newUnico;
	if (cmp) { 
		newUnico = cmp.unique + Date.now();
	} else {
		newUnico = unico;
	};
	
	// opto por dar um estado default caso o estado fornecido não seja válido, em vez de retornar um 400
	let newEstado;
	if (!estadosValidos.includes(estado)) {
		newEstado = estadosValidos[0]; // Atribui o primeiro valor válido se o estado fornecido não for válido
	} else {
		newEstado = estado;
	};
	const newDate = new Date();
	const paraMostrar = {
		cnt: cnt,
		unico: newUnico,
		estado: newEstado,
		momento: newDate
	};
	const novo = {
		idx: campos.length ? Math.max(...campos.map(item => item.idx)) + 1: 1,
		unique: newUnico,
		estados: newEstado,
		gerado: new Date()
	};
	campos.push(novo);
	return res.status(201).json(paraMostrar);
});

// alterar um unico item do segundorecurso
app.put('/segundorecurso/:cnt', (req, res) => {
	console.log('Entradas recebidas:', req.body);
	console.log('Parâmetro cnt:', req.params.cnt);
	const idx = Number(req.params.cnt);
	const linha = campos.find(item => item.idx === idx);
	const { unico, estado } = req.body;
	const cmp = campos.find(item => item.unique === unico);
	if (cmp) { 
		linha.unique = cmp.unique + Date.now();
	};
	if (estadosValidos.includes(estado)) {
		linha.estados = estado; // Atribui o primeiro valor válido se o estado fornecido não for válido
	};
	linha.gerado = new Date();
	res.status(200).json(linha);
});

// eliminar um unico item do segundorecurso
app.delete('/segundorecurso/:cnt', (req, res) => {
	const idx = Number(req.params.cnt);
	const linha = campos.find(item => item.idx === idx);
	if (linha) {
		campos.splice(campos.indexOf(linha), 1);
		res.status(200).json({ message: 'Item eliminado com sucesso.' });
	} else {
		res.status(404).json({ error: 'Item não encontrado.' });
	}
});

// #####################################################
// # Cenário de tarefas com projectos e utilizadores
// #####################################################

/*
const projectos = [
  { id: 1, nome: "Website Empresa1", descricao: "Site Empresa1", estado: "activo" },
  { id: 2, nome: "Website Empresa2", descricao: "Site Empresa2", estado: "activo" }
];

const utilizadores = [
  { id: 1, nome: "Ana Silva", email: "ana@minhaempresa.pt" },
  { id: 2, nome: "Bruno Costa", email: "bruno@minhaempresa.pt" }
];

const tarefas = [
  {
    id: 1,
    titulo: "ER site",
    estado: "concluida",        // aberta | em_progresso | concluida | cancelada
    prioridade: "alta",         // baixa | media | alta | critica
    id_projecto: 1,
    id_utilizador: 1              // id de utilizador
  },
  {
    id: 2,
    titulo: "Autenticação utilizadores",
    estado: "em_progresso",
    prioridade: "critica",
    id_projecto: 1,
    id_utilizador: 2
  }
];
*/

app.get('/api/tarefas', async (req, res) => {
	try {
		const tarefas = await prisma.tarefa.findMany();
		return res.status(200).json(tarefas);
	} catch (error) {
		console.error('Erro ao listar tarefas:', error);
		return res.status(500).json({ error: 'Erro ao listar tarefas' });
	}	
});

app.get('/api/tarefas/:id', async (req, res) => {
	try {
		const idtarefa = Number(req.params.id);
		const tarefa = await prisma.tarefa.findUnique({
			where: { id: idtarefa }
		});
		if (!tarefa) return res.status(404).json({ error: 'tarefa não encontrada' });
		return res.status(200).json(tarefa);
	} catch (error) {
		console.error('Erro ao procurar tarefa:', error);
		return res.status(500).json({ error: 'Erro ao procurar tarefa' });
	}
});

app.get('/api/projectos', async (req, res) => {
	try {
		const projectos = await prisma.projecto.findMany();
		return res.status(200).json(projectos);
	} catch (error) {
		console.error('Erro ao listar projectos:', error);
		return res.status(500).json({ error: 'Erro ao listar projectos' });
	}
});

app.get('/api/projectos/:id', async (req, res) => {
	try {
		const idprojecto = Number(req.params.id);
		const projecto = await prisma.projecto.findUnique({
			where: { id: idprojecto }
		});
		if (!projecto) return res.status(404).json({ error: 'projecto não encontrado' });
		return res.status(200).json(projecto);
	} catch (error) {
		console.error('Erro ao procurar projecto:', error);
		return res.status(500).json({ error: 'Erro ao procurar projecto' });
	}
});

app.get('/api/projectos/:id/tarefas', async (req, res) => {
	try {
		const idprojecto = Number(req.params.id);
		const projecto = await prisma.projecto.findUnique({
			where: { id: idprojecto },
			include: { tarefas: true }
		});
		if (!projecto) return res.status(404).json({ error: 'projecto não encontrado' });
		return res.status(200).json(projecto.tarefas);
	} catch (error) {
		console.error('Erro ao procurar tarefas do projecto:', error);
		return res.status(500).json({ error: 'Erro ao procurar tarefas do projecto' });
	}
});

app.get('/api/utilizadores', async (req, res) => {
	try {
		const utilizadores = await prisma.utilizador.findMany();
		return res.status(200).json(utilizadores);
	} catch (error) {
		console.error('Erro ao listar utilizadores:', error);
		return res.status(500).json({ error: 'Erro ao listar utilizadores' });
	}
});

app.get('/api/utilizadores/:id', async (req, res) => {
	try {
		const idutilizador = Number(req.params.id);
		const utilizador = await prisma.utilizador.findUnique({
			where: { id: idutilizador }
		});
		if (!utilizador) return res.status(404).json({ error: 'utilizador não encontrado' });
		return res.status(200).json(utilizador);
	} catch (error) {
		console.error('Erro ao procurar utilizador:', error);
		return res.status(500).json({ error: 'Erro ao procurar utilizador' });
	}
});

app.get('/api/utilizadores/:id/tarefas', async (req, res) => {
	try {
		const idutilizador = Number(req.params.id);
		const utilizador = await prisma.utilizador.findUnique({
			where: { id: idutilizador },
			include: { tarefas: true }
		});
		if (!utilizador) return res.status(404).json({ error: 'utilizador não encontrado' });
		return res.status(200).json(utilizador.tarefas);
	} catch (error) {
		console.error('Erro ao procurar tarefas do utilizador:', error);
		return res.status(500).json({ error: 'Erro ao procurar tarefas do utilizador' });
	}
});

app.post('/api/tarefas', async (req, res) => {
	const { titulo, estado = 'aberta', prioridade = 'media', id_projecto, id_utilizador } = req.body;

	if (!titulo) {
		return res.status(400).json({ error: "campo titulo obrigatorio" });
	}
	if (!id_projecto ) {
		return res.status(400).json({ erro: "id_projecto invalido" });
	}
	if (!id_utilizador ) {
		return res.status(400).json({ error: "id_utilizador invalido" });
	}

	try {
		const novaTarefa = await prisma.tarefa.create({
			data: {
				titulo,
				estado: estado || EstadoTarefa.aberta,
				prioridade: prioridade || PrioridadeTarefa.media,
				id_projecto: Number(id_projecto),
				id_utilizador: id_utilizador ? Number(id_utilizador) : null
			}
		});

		sse.emitir('tarefa-criada', novaTarefa);

		return res.status(200).json(novaTarefa);
	} catch (error) {
		if (error.name === 'PrismaClientValidationError') {
			return res.status(400).json({ error: 'O estado ou a prioridade são inválidos' });
		}
		// P2002: Unique constraint falhou no titulo
		if (error.code === 'P2002') {
			return res.status(400).json({ error: 'Tarefa com o mesmo titulo já existe' });
		}	
		// P2003: Foreign key constraint falhou no id_projecto ou id_utilizador
		if (error.code === 'P2003') {
			return res.status(400).json({ error: 'id_projecto ou id_utilizador não existe' });
		}
		console.error('Erro ao criar tarefa:', error);
		return res.status(500).json({ error: 'Erro ao criar tarefa' });
	}
});

app.put('/api/tarefas/:id', async (req, res) => {
	const id = Number(req.params.id);

	const { titulo, estado, prioridade, id_projecto, id_utilizador } = req.body;

	if (!titulo || !estado || !prioridade || !id_projecto) {
		return res.status(400).json({ error: "campos obrigatórios: titulo, estado, prioridade, id_projjecto" });
	}

	const estadosTarefas = Object.values(EstadoTarefa);
	if (!estadosTarefas.includes(estado)) {
		return res.status(400).json({ error: "estado de tarfea invalido" });
	}

	const prioridadesTarefas = Object.values(PrioridadeTarefa);
	if (!prioridadesTarefas.includes(prioridade)) {
		return res.status(400).json({ error: "prioridade de tarfea invalida" });
	}	

	try {
		const tarefaActualizada = await prisma.tarefa.update({
			where: { id },
			data: {
				titulo,
				estado,
				prioridade,
				id_projecto: Number(id_projecto),
				id_utilizador: id_utilizador ? Number(id_utilizador) : null
			}
		});

		sse.emitir('tarefa-actualizada', tarefaActualizada);
		return res.status(200).json(tarefaActualizada);

	} catch (error) {
		if (error.code === 'P2025') {
			return res.status(404).json({ error: 'tarefa não encontrada' });
		}
		// P2003: Foreign key constraint falhou no id_projecto ou id_utilizador
		if (error.code === 'P2003') {
			return res.status(400).json({ error: 'id_projecto ou id_utilizador não existe' });
		}
		console.error('Erro ao atualizar tarefa:', error);
		return res.status(500).json({ error: 'Erro ao atualizar tarefa' });
	}
});

app.delete('/api/tarefas/:id', async (req, res) => {
	const id = Number(req.params.id);

	try {
		const tarefaRemovida = await prisma.tarefa.delete({
			where: { id }
		});
		sse.emitir('tarefa-apagada', { id: tarefaRemovida.id });
		return res.status(204).send();
	} catch (error) {
		// P2025: Record to delete does not exist.
		if (error.code === 'P2025') {
			return res.status(404).json({ error: 'tarefa não encontrada' });
		}
		console.error('Erro ao remover tarefa:', error);
		return res.status(500).json({ error: 'Erro ao remover tarefa' });
	}
});

// SSE
app.get('/api/eventos', (req, res) => {
	res.set({
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive',
		'X-Accel-Buffering': 'no'
	});
	
	res.flushHeaders();

	res.write(`event: ligado\ndata: ${JSON.stringify({ ts: new Date().toISOString() })}\n\n`);

	sse.adicionarCliente(res);

	const ping = setInterval(() => res.write(': ping\n\n'), 25000);
	
	req.on('close', () => clearInterval(ping));
});



app.listen(port, () => {
	console.log(`\n==========================================================================`);
  	console.log(`API do Lab3 a correr (Prisma + Postgres):  http://localhost:3002`);
  	console.log(`Endpoint SSE:                              http://localhost:3002/api/eventos`);
  	console.log(`Swagger UI (OpenAPI):                      http://localhost:3002/api-docs`);
  	console.log(`AsyncAPI Studio:                           http://localhost:8001`);
	console.log(`Prisma Studio (Base de Dados):             http://localhost:5555`);
  	console.log(`---------------------------------------------------------------------------`);
	console.log(`Base de Dados (PostgreSQL):`);
  	console.log(`   Host: localhost | Porta: 5433`);
  	console.log(`   Base de Dados: lab3db | User: consultar .env | Pass: consultar .env`);
  	console.log(`   String de conexão: consultar .env`);
  	console.log(`===========================================================================\n`);
});