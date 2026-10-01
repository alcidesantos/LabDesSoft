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
		if (typeof page !== 'string' || typeof limit !== 'string') {
			return res.status(400).json({ error: 'Os parâmetros page e limit devem ser strings (não podem estar duplicados)' });
		}
		if (isNaN(parseInt(page)) || isNaN(parseInt(limit))) {
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

		return res.status(200).json(items);
	}

	const filteredItems = items.filter(item => item.name.toLowerCase().includes(name.toLowerCase()));

	res.status(200).json(filteredItems);
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
	
	if(!req.body || Object.keys(req.body).length === 0) {
		return res.status(400).json({error: 'O corpo da requisição não pode estar vazio'});
	}

	if(typeof req.body.name !== 'string') {
		return res.status(400).json({error: 'O campo name deve ser uma string'});
	}

	if(req.body.name.trim() === '') {
		return res.status(400).json({error: 'O campo name não pode estar vazio'});
	}

	const {name} = req.body || {};
	
	const newItem = {
		id: items.length ? Math.max(...items.map(item => item.id)) + 1: 1,
		name
	};
	items.push(newItem);
	
	res.status(201).json(newItem);
});

app.put('/api/items/:id', (req, res) => {
	const id = Number(req.params.id);

	if(isNaN(id) || id < 1) {
		return res.status(400).json({ error: 'O parâmetro id deve ser um número válido' });
	}
	
	const item = items.find(item => item.id === id);
	
	if(!item) {
		return res.status(404).json({ error: "item não encontrado"});
	}

	if(!req.body || Object.keys(req.body).length === 0) {
		return res.status(400).json({ error: "o corpo da requisição não pode estar vazio"});
	}

	const {name} = req.body || {};

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
	const index = items.findIndex(item => item.id == id);
	if(index == -1) {
		return res.status(404).json({ error: 'Item não encontrado'});
	}
	
	items.splice(index, 1);
	
	res.status(204).send();
});


app.listen(port, () => {
  console.log(`API está a correr em http://localhost:${port}`);
});