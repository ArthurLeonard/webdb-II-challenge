const express = require('express');
const helmet = require('helmet');
const knex = require('knex');

const knexConfig = {
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: './data/lambda.sqlite3'
  }
}
const database = knex(knexConfig);

const server = express();

server.use(express.json());
server.use(helmet());

// endpoints here

server.get('/api/zoos', (req, res) => {
  // returns a promise
  database('zoos')
    .then( zoos => {
      res.status(200).json(zoos);
    })
    .catch( error => { 
      res.status(500).json(error);
     })
 
});

server.get('/api/zoos/:id', (req, res) => {
  // retrieve a role by id
  let id = req.params.id;
  database('zoos').where(({ id }))
  .first() //prevents it from being passed back as an array
  .then( role => { 
    if (!role )
        res.status(404).json( { message: 'no animal with this id exists' })
    else 
        res.status(200).json(role)})
  .catch(error => { res.status(500).json(error); })
});

 

server.post('/api/zoos', (req, res) => {
  
  if (!req.body.name) 
      res.status(400).json( { message: 'Name is a required field'}).end(); 
  else {
      database('zoos').insert({name: req.body.name})
         .then( ids => {   res.status(201).json(ids);                     
                  })//end then
          .catch( error => { res.status(500).json(error) })
                }
});
 
server.put('/api/zoos/:id', (req, res) => {
  // update zoos
  database('zoos').where( {id: req.params.id }).update(req.body).then( count => {
    if( count > 0 ) { //IF SUCCESful returns the number of records changed
        res.status(200).json( count)
    } else {
        res.status(404).json({ message: "record not found" })
    }
}) //end then
.catch(error => { res.status(500).json(error)})
  
});

server.delete('/api/zoos/:id', (req, res) => {
 
  database('zoos').where({ id: req.params.id })
             .del().then( count => { 
                            if (count > 0) {
                              res.status(204).end();
                            }
                            else {
                              res.status(404).json( {message: 'Record not found'});
                            }
             })//end then
             .catch( error => { res.status(500).json(error) ; })
 
});


const port = 3300;
server.listen(port, function() {
  console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});
