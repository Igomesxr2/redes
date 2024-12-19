const http = require('http');
const fs = require('fs');
const exec = require('child_process').exec;

// Função que executa o comando recebido de forma segura
function executeCommand(command, res) {
  // Lista de comandos permitidos
  const allowedCommands = ['ls', 'cat'];

  // Extrai o nome do comando (primeiro parâmetro)
  const commandName = command.split(' ')[0];

  // Verifica se o comando está na lista de permitidos
  if (!allowedCommands.includes(commandName)) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Comando não permitido');
    return;
  }

  // Sanitiza o comando para remover caracteres potencialmente perigosos
  const sanitizedCommand = command.replace(/[^a-zA-Z0-9_\-\.\/ ]/g, '');

  // Executa o comando de forma controlada
  exec(sanitizedCommand, (error, stdout, stderr) => {
    if (error) {
      console.log(`Erro: ${error}`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Erro ao executar o comando: ${stderr}`);
      return;
    }

    // Retorna a saída do comando para o navegador
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(stdout);  // Exibe a saída do comando
  });
}

// Servidor HTTP que serve o HTML e processa os comandos recebidos
http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    // Serve a página HTML
    fs.readFile('index.html', 'utf-8', (err, html) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Erro ao carregar a página.');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    });
  } else if (req.url.startsWith('/run?cmd=') && req.method === 'GET') {
    // Extraí o comando da URL
    const command = decodeURIComponent(req.url.split('=')[1]);
    console.log(`Comando recebido: ${command}`);
    
    // Chama a função de execução com o comando
    executeCommand(command, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Página não encontrada');
  }
}).listen(8080, () => {
  console.log('Servidor rodando na porta 8080');
});
