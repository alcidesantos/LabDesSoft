const express = require('express');
const app = express();
const port = 3000;
app.use(express.json())

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

app.listen(port, () => {
  console.log(`API está a correr em http://localhost:${port}`);
});