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
	res.json(items);
});

app.get(`/api/items/:id`, (req, res) => {
	const id = Number(req.params.id);
	const item = items.find(item => item.id === id);

	if(!item) {
		return res.status(404).json({ error: 'Item não encontrado'});
	}
	
	res.json(item);
});

// usar com POST em vez de GET para criar um novo item
app.post('/api/items', (req, res) => {
	const {name} = req.body;
	
	if(!name ) {
		return res.status(400).json({error: 'o campo name é obrigatorio'})
	}
	
	const newItem = {
		id: items.length ? Math.max(...items.map(item => item.id)) + 1: 1,
		name
	};
	items.push(newItem);
	
	res.status(201).json(newItem);
});

app.put('/api/items/:id', (req, res) => {
	const id = Number(req.params.id);
	const item = items.find(item => item.id === id);
	
	if(!item) {
		return res.status(404).json({ error: "item não encontrado"});
	}
	
	const {name} = req.body;
	if(!name) {
		return res.status(400).json({ error: "o campo name é obrigatorio"});
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