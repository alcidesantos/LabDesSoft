const clientes = new Set();

function adicionarCliente(res) {
    clientes.add(res);
    
    function remover() {
        clientes.delete(res);
        console.log("[SSE] cliente desligado. Total actual:" + clientes.size);
    }

    res.on('close', remover);
    res.on('error', remover);

    console.log("[SSE] cliente ligado. Total actual:" + clientes.size);
}

function emitir(evento, dados) {
    const informacao = `event: ${evento}\ndata: ${JSON.stringify(dados)}\n\n`;
    for (const res of clientes) {
        res.write(informacao);
    }
    console.log("[SSE] evento " + evento + " enviado a " + clientes.size + " clientes");
}

module.exports = { adicionarCliente, emitir };