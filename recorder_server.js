const fs  = require('fs');
const http = require('http');
const qs = require('querystring');
const static = require('node-static');
const cookie = require('cookie');

const recorderDocument = fs.readFileSync('recorder.html', 'utf-8');
const playerDocument = fs.readFileSync('player.html', 'utf-8');

const fileServer = new static.Server();

const requestListener = function (request, response) {

  // Serve static files.
  if (request.method === 'GET' && request.url.startsWith('/assets/')){
    fileServer.serve(request, response);
  }

  else if (request.method === 'GET' && request.url.startsWith('/json/')) {
    fileServer.serve(request, response);
  }

  // Serve dynamic recorder-page.
  else if (request.method === 'GET' && request.url === '/') {
    // Following retrieves file names in json-directory.
    fs.readdir('json', function (error, fileNames) {
      if (error) {
        response.writeHead(500);
        response.end(error);
      } else {
        let splitDoc = recorderDocument.split("<option>-!-</option>");
        let result = "";
        for (let i = 0; i < fileNames.length; i++) { 
          let string = "<option>"+ fileNames[i] + "</option>";
          result += string;
        }
        
        let lengthOfLast = splitDoc.length;
        let newDoc = splitDoc[0] + result + splitDoc[lengthOfLast-1];

        response.writeHead(200);
        response.end(newDoc);
      }
    });
  }

  // Handle POST-requests.
  else if (request.method === 'POST') {
    let body = "";
    request.on('data', function (chunk) {
      body += chunk;
    });
    request.on('end', function () {
      let query = qs.parse(body);

      let userChose = qs.parse(body);
      let notesSelect = userChose.note_names;

      let chosenNotes = cookie.serialize('notes', notesSelect);
      response.setHeader('Set-Cookie', chosenNotes);      

      const documentParts = playerDocument.split('-!-');
      response.writeHead(200);
      response.end(documentParts[0] + query.note_names + documentParts[1]);
    });
  }

  else {
    response.writeHead(404);
    response.end('404 Not found.');
  }
};

const server = http.createServer(requestListener);
server.listen(3000);