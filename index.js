
const bcrypt = require('bcrypt');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');


const app = express();

const saltRounds = 10;

const users = {
    "name": "User",
    "email": "user@students.towson.edu",
    "password": "$2b$10$MxEw.lpmLjMvUc10oW6WZuhRUN1p.LkYvPN4hX5BFKZRBzFZWK1k6",
    "TowsonID": "1111111",
    "Semester": "2"
}


app.use(bodyParser.json());

app.get("/", (req, res) => {
    bcrypt.hash(users.password, saltRounds, function(err, hash) {
        console.log(hash);
      });
    res.status(200).json({message: "HOME PAGE"});
});

app.get("/register", (req, res) => {
    res.status(200).json({message: "Register page"})
});

app.post("/login", (req, res) => {
    const user = req.body;
    
    if(user.email === users.email){
        bcrypt.compare(user.password, users.password, (err, isCorrect) => {
            if(err){
                res.sendStatus(500);
            }else{
               if(isCorrect){
                res.status(200).send(user);
               }else{
                res.status(404).json({message: "Incorrect Password"});
               }
            }

        });    

    }else{
        res.status(404).json({message: "Incorrect Email"});
    }   
})

app.listen(3000, () => {
    console.log("Server Running");
});
