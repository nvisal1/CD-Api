
const bcrypt = require('bcrypt');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');


const app = express();

const saltRounds = 10;

//Mock user info
const users = [
    {
        name: "User",
        email: "user@students.towson.edu",
        password: "$2b$10$MxEw.lpmLjMvUc10oW6WZuhRUN1p.LkYvPN4hX5BFKZRBzFZWK1k6",
        TowsonID: "1111111",
        Semester: "2",
    }
]

//Mock project info
const projects = [
    { 
        "projectId": 1,
        "project": "project1",
        "users": 2,
        "adminName": "Charles"
    },
    {
        "projectId": 2,
        "project": "project2",
        "users": 3,
        "adminName": "Stacey"
    },
    {
        "projectId": 3,
        "project": "project3",
        "users": 1,
        "adminName": "Lucy"
    },
    {
        "projectId": 4,
        "project": "project4",
        "users": 4,
        "adminName": "Drake"
    } 
]


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
});

app.get("/users")

app.get("/projects", (req, res) => {
    res.send(projects);
})

app.get("/user/:tuid/project", (req, res) => {
    // const findProject = 
})

app.get("/user/:TowsonID", (req, res) => {
     const user = users.find(u => {
       return u.TowsonID === parseInt(req.params.TowsonID);
    });
        if(!users){
            res.status(404).send("The user with that id was not found!");
        }else{
            res.status(200).send("Found the user!: ");
        }
});

const port = process.env.PORT || 4000;

app.listen(3000, () => {
    console.log("Server Running");
});
