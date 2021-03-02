const port = process.env.PORT || 3000;
const mongoUser = process.env.MONGOUSER || null;
const mongoPass = process.env.MONGOPASS || null;
const mongoHost = process.env.MONGOHOST || 'localhost';
const mongoPort = process.env.MONGOPORT || 27017;
const mongoDatabase = process.env.MONGODATABASE || 'movies';

let mongoUrl = 'mongodb://' + mongoHost + ':' + mongoPort + '/movies';
if(mongoUser !== null) {
    mongoUrl = 
        'mongodb+srv://' 
        + mongoUser + ':' + mongoPass 
        + '@' + mongoHost 
        + '/' + mongoDatabase + '?retryWrites=true&w=majority';
} 
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const db = mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

db.catch(function(error){
    console.log('DB connection error', error);
    process.exit(1);
});

const app = express();

app.use(bodyParser.json({extended: true}));

app.post('/search', async function(req, res) {

    let response = await axios.get('http://api.tvmaze.com/search/shows?q='  + req.body.query);

    console.log(response.data);

    let searchedMovies = [];

    for(let i in response.data) {
        searchedMovies.push({
            "id": response.data[i].show.id,
            "name": response.data[i].show.name,
            "type": response.data[i].show.type,
            "language": response.data[i].show.language,
            "genres": response.data[i].show.genres,
            "status": response.data[i].show.status,
            "runtime": response.data[i].show.runtime,
            "premiered": response.data[i].show.premiered,
            "officialSite": response.data[i].show.officialSite,
            "rating": response.data[i].show.rating,
            "image": response.data[i].show.image,
            "summary": response.data[i].show.summary
        });
    }
    res.send(searchedMovies);
});

app.get('/search/:id', async function(req, res) {

    let response1 = await axios.get('http://api.tvmaze.com/shows/' + req.params.id);

    console.log(response1.data);

    let movieById = [];

    movieById.push({
        "id":  req.params.id,
        "name": response1.data.name,
        "type": response1.data.type,
        "language": response1.data.language,
        "genres": response1.data.genres,
        "status": response1.data.status,
        "runtime": response1.data.runtime,
        "premiered": response1.data.premiered,
        "officialSite": response1.data.officialSite,
        "rating": response1.data.rating,
        "image": response1.data.image,
        "summary": response1.data.summary
    });

    res.send(movieById);
});

const Comment = require('./model/comment.js');

app.post('/show/:id/comments', async function(req, res) {

    let response = await axios.get('http://api.tvmaze.com/shows/' + req.params.id);

    console.log(response.data);

    var comment = new Comment();

    comment.show_id = req.params.id;
    comment.name = req.body.name;
    comment.content = req.body.content;
    comment.created_at = new Date(Date.now()).toISOString();

    comment.save(function(err, savedComment){
        if(err) {
            res.status(500).send("Comment could not be saved.");
        } else {
            res.send({
                "success": true
            });
        }
    });

});

app.get("/show/:id/comments", async function(req, res) {

    let response = await axios.get('http://api.tvmaze.com/shows/' + req.params.id);

    var query = {"show_id" : req.params.id};

    Comment.find(query, function(err, comments) {
        if(err) {
            res.status(500).send("Could not load comments!");
        } else {
            res.send(comments);
        }
    });
});

app.listen(port, () => {
    console.log('Up and running on port 3000!');
});