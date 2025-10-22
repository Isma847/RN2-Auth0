const http = require('http');
const mysql = require('mysql');
const url = require('url');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'rn2'
});

connection.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos: ' + err.stack);
    return;
  }
  console.log('Conectado a la base de datos como id ' + connection.threadId);
});

// Crear el servidor HTTP
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Login/Registro con Google
  if (req.method === 'POST' && req.url === '/google-signin') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const datosGoogle = JSON.parse(body);
      const email = datosGoogle.email;
      
      // Primero buscar si el usuario ya existe
      const sqlBuscar = 'SELECT * FROM usuario WHERE email = ?';
      connection.query(sqlBuscar, [email], (error, results) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Error al buscar usuario: ' + error.stack }));
          return;
        }
        
        // Si el usuario existe, devolver sus datos
        if (results.length > 0) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            mensaje: 'Usuario existente',
            usuario: results[0],
            nuevo: false
          }));
        } 
        // Si no existe, crear nuevo usuario
        else {
          const sqlInsertar = 'INSERT INTO usuario SET ?';
          connection.query(sqlInsertar, datosGoogle, (errorInsert, resultsInsert) => {
            if (errorInsert) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Error al crear usuario: ' + errorInsert.stack }));
              return;
            }
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              mensaje: 'Usuario creado correctamente',
              usuario: datosGoogle,
              nuevo: true
            }));
          });
        }
      });
    });
  }
  // Buscar usuario por email (GET con query parameter)
  else if (req.method === 'GET' && parsedUrl.pathname === '/usuario') {
    const email = parsedUrl.query.email;
    
    if (!email) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Debes proporcionar el parámetro email' }));
      return;
    }
    
    const sql = 'SELECT * FROM usuario WHERE email = ?';
    connection.query(sql, [email], (error, results, fields) => {
      if (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al buscar usuario: ' + error.stack }));
        return;
      }
      if (results.length === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Usuario no encontrado' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results[0]));
    });
  }
  // Actualizar usuario por email (PUT)
  else if (req.method === 'PUT' && parsedUrl.pathname === '/usuario') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const datos = JSON.parse(body);
      const email = parsedUrl.query.email;
      
      if (!email) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Debes proporcionar el parámetro email' }));
        return;
      }
      
      // Remover el email de los datos a actualizar para evitar modificarlo
      delete datos.email;
      
      if (Object.keys(datos).length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No hay datos para actualizar' }));
        return;
      }
      
      const sql = 'UPDATE usuario SET ? WHERE email = ?';
      connection.query(sql, [datos, email], (error, results, fields) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Error al actualizar usuario: ' + error.stack }));
          return;
        }
        if (results.affectedRows === 0) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Usuario no encontrado' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          mensaje: 'Usuario actualizado correctamente',
          filasAfectadas: results.affectedRows 
        }));
      });
    });
  }
  // Obtener todos los usuarios
  else if (req.method === 'GET' && req.url === '/usuarios') {
    const sql = 'SELECT * FROM usuario';
    connection.query(sql, (error, results, fields) => {
      if (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al obtener datos: ' + error.stack }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results));
    });
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Ruta no encontrada');
  }
});

const port = 3000;
server.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});