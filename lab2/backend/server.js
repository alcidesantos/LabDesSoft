const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const swaggerDocument = yaml.load('./openapi.yaml');
const app = express();
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

const projectos = [
  { id: 1, nome: "Website Empresa1", descricao: "Site Empresa1", estado: "ativo" },
  { id: 2, nome: "Website Empresa2", descricao: "Site Empresa2", estado: "ativo" }
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

app.get('/api/tarefas', (req, res) => {
	return res.status(200).json(tarefas);
});

app.get('/api/tarefas/:id', (req, res) => {
	const idtarefa = Number(req.params.id);
	const tarefa = tarefas.find(t => t.id === idtarefa);
	if (!tarefa) return res.status(404).json({ error: 'tarefa não encontrada' });
  	return res.status(200).json(tarefa);
});

app.get('/api/projectos', (req, res) => {
	return res.status(200).json(projectos);
});

app.get('/api/projectos/:id', (req, res) => {
	const idprojecto = Number(req.params.id);
	const projecto = projectos.find(p => p.id === idprojecto);
	if (!projecto) return res.status(404).json({ error: 'projecto não encontrado' });
  	return res.status(200).json(projecto);	
});

app.get('/api/projectos/:id/tarefas', (req, res) => {
	const idprojecto = Number(req.params.id);
	const projecto = projectos.find(p => p.id === idprojecto);
	if (!projecto) return res.status(404).json({ error: 'projecto não encontrado' });
	const listaTarefas = tarefas.filter(t => t.id_projecto === idprojecto);
	return res.status(200).json(listaTarefas);
});

app.get('/api/utilizadores', (req, res) => {
	return res.status(200).json(utilizadores);
});

app.get('/api/utilizadores/:id', (req, res) => {
	const idutilizador = Number(req.params.id);
	const utilizador = utilizadores.find(u => u.id === idutilizador);
	if (!utilizador) return res.status(404).json({ error: 'utilizador não encontrado' });
  	return res.status(200).json(utilizador);
});

app.get('/api/utilizadores/:id/tarefas', (req, res) => {
	const idutilizador = Number(req.params.id);
	const utilizador = utilizadores.find(u => u.id === idutilizador);
	if (!utilizador) return res.status(404).json({ error: 'utilizador não encontrado' });
	const listaTarefas = tarefas.filter(t => t.id_utilizador === idutilizador);
	return res.status(200).json(listaTarefas);
});

app.post('/api/tarefas', (req, res) => {
	const { titulo, estado = 'aberta', prioridade = 'media', id_projecto, id_utilizador } = req.body;

	if (!titulo) {
		return res.status(400).json({ error: "campo titulo obrigatorio" });
	}
	if (!id_projecto || !projectos.find(p => p.id === Number(id_projecto) ) ) {
		return res.status(400).json({ erro: "id_projecto invalido" });
	}
	if (!id_utilizador || !utilizadores.find(u => u.id === Number(id_utilizador) ) ) {
		return res.status(400).json({ error: "id_utilizador invalido" });
	}

	novaTarefa = {
		id: tarefas.length ? Math.max(...tarefas.map(t => t.id)) + 1 : 1,
		titulo,
		estado,
		prioridade,
		id_projecto: Number(id_projecto),
		id_utilizador: id_utilizador ? Number(id_utilizador) : null
	};
	tarefas.push(novaTarefa);

	sse.emitir('tarefa-criada', novaTarefa);

	return res.status(200).json(novaTarefa);
});

app.put('/app/tarefas', (req, res) => {
	const id = Number(req.params.id);
	
	const idx = tarefas.findIndex(t => t.id === id);
	if (idx === -1) return res.status(404).json({ error: "tarefa não encontrada" });

	const { titulo, estado, prioridade, id_projecto, id_utilizador } = req.body;

	if (!titulo || !estado || !prioridade || !id_projecto) {
		return res.status(400).json({ error: "campos obrigatórios: titulo, estado, prioridade, id_projjecto" });
	}

	const estadosTarefas = ["aberta", "em_progresso", "concluida", "cancelada"];
	if (!estadosTarefas.includes(estado)) {
		return res.status(400).json({ error: "estado de tarfea invalido" });
	}

	const prioridadesTarefas = ["baixa", "media", "alta", "critica"];
	if (!prioridadesTarefas.includes(prioridade)) {
		return res.status(400).json({ error: "prioridade de tarfea invalida" });
	}	

	if (!projectos.find(p => p.id === Number(id_projecto))) {
		return res.status(400).json({ error: "id_projecto não existe" });
	}

	if (!id_utilizador && !utilizadores.find(u => u.id == Number(id_utilizador))) {
		return res.status(400).json({ error: "id_utilizador não existe" });
	}

	const tarefaActualizada = {
		id,
		titulo,
		estado,
		id_projecto: Number(id_projecto),
		id_utilizador: Number(id_utilizador)
	}; 
	tarefas[idx] = tarefaActualizada;

	sse.emitir('tarefa-actualizada', tarefaActualizada);
	return res.status(200).json(tarefaActualizada);
});

app.delete('app/tarefas/:id', (req, res) => {
	const id = Number(req.params.id);
	const idx = tarefas.findIndex(t => t.id === id);
	if (idx === -1) {
		return res.status(404).json({ error: "tarefa não encontrada" });
	}

	const removida = tarefas.splice(idx, 1)[0];

	sse.emitir('tarefa-apagada', { id: removida.id });
	return res.status(204).send();
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
  console.log(`API do Lab2 está a correr em http://localhost:${port}`);
  console.log(`Documentação da API disponível em http://localhost:${port}/api-docs`);
});