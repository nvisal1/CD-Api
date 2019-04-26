
const bcrypt = require('bcrypt');
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const assert = require('assert');
require('dotenv').config();


const app = express();

const saltRounds = 10;

// Database Name
const dbName = 'cd-api';

// Use connect method to connect to the server
MongoClient.connect(process.env.MONGO_URI, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    //Mock user info
    const users = [
        {
            name: "User",
            email: "user@students.towson.edu",
            password: "$2b$10$MxEw.lpmLjMvUc10oW6WZuhRUN1p.LkYvPN4hX5BFKZRBzFZWK1k6",
            TowsonID: "1111111",
            Semester: "2",
            projectId: "12345"
        }
    ]

    //Mock project info
    const projects = [
        {
            "projectId": 1,
            "project": "project1",
            "users": [
                "12345",
                "98765"
            ],
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
        bcrypt.hash(users.password, saltRounds, function (err, hash) {
            console.log(hash);
        });
        res.status(200).json({ message: "HOME PAGE" });
    });

    app.post("/register", (req, res) => {

        const user = req.body;
        bcrypt.hash(user.password, saltRounds, function(err, hash) { // Store hash in your password DB.
            if(err){
                console.error(err);
                res.status(500).json({message: "Internal Server Error"});
            } else{
                db.collection("users").insertOne({...user, password: hash}, function (err, result) {
                    if (err) {
                        console.error(err);
                        res.status(500).json({message: "error"})
                    } else {
                        console.log(result);
                        res.status(200).json({ message: "Register page" })
                    }
                });

            }
        });
    });

    app.post("/login", (req, res) => {
        const user = req.body;
        db.collection('users').findOne({
            email: user.email,
        }, function(err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "Error"});
            } else {
                if (!result) {// Empty object returned by the database 
                    console.log("Email not in database");
                    res.status(404).json({message: "Not Found"});
                } else {
                    bcrypt.compare(user.password, result.password, (err, isCorrect) => {
                        if (err) {
                            res.sendStatus(500);
                        } else {
                            if (isCorrect) {
                                res.status(200).send(user);
                            } else {
                                res.status(404).json({ message: "Incorrect Password" });
                            }
                        }
                    })
                }
            }
        })
    });
    
    app.get("/users", (req, res) => {
        if (req.query.id) {
            db.collection("users").find({_id: new ObjectId(req.query.id)},{projection: {password: 0}}).toArray(function(err,result){
                if(err){
                    console.error(err);
                    res.status(500).json({message: "error, unable to find user"});
                } else{
                    res.status(200).json(result);
                }
            });
        } else {
            //get all users in the system. Don't display password. Return Users obj.
            db.collection("users").find({},{projection: {password: 0}}).toArray(function(err,result) {
                if(err){
                    console.error(err);
                    res.status(500).json({message: "error"});
                } else{
                    res.status(200).json(result);
                }
            });
        }
    });
    

    app.get("/projects", (req, res) => {
        //display all projects and their users
        if(req.query.projectId){
            db.collection("projects").findOne({_id: new ObjectId(req.query.projectId)}, function(err, result){
                if(err){
                    res.status(500);
                } else if (!result){      
                    res.status(404).json({message: "Could not find project"});
                } else{
                    res.status(200).json(result);
                }
            })
        } else{
            db.collection("projects").find({}).toArray(function(err,result){
                if(err){
                    res.status(500).json({message:"error"});
                } else{
                    res.status(200).json({result});
                }
            }); 
        }
    });

    

    app.get("/user/:tuid/project", (req, res) => {
        //find the all projects that a user has worked on
        const query = {TowsonID: tuid};

        //joining where, users.projectId = projects.projectId
        db.collection('users').aggregate([
            {
                $lookup:
                {
                    from: 'projects',
                    localField: 'projectId', //primary key from 'projects' collection
                    foreignField:'projectId', //foreign key from 'users' collection
                    as:'userProjects'
                }
            }
        ]).toArray(function(err,result){
            if(err){
                console.error(err);
                res.status(500).json({message: "error"});
            } else{
                res.status(200).json(result);
            }
        })

    })

    app.get("/user/:TowsonID", (req, res) => {
        const user = req.params.TowsonID;
        db.collection("users").findOne({TowsonID:user},function(err,result){
            if (err) {
                console.log(err)
                res.status(500).json({message:"err"});
            } else if (!user){
                res.status(404).send("The user with that id was not found!");
            } else {
                res.status(200).send(`Found the user: ${user.name}`);
            }
        })    
    });

    app.post("/project", (req,res) => {
        const project = req.body;

        db.collection("projects").insertOne(project, function(err,result){
            if(err){
                console.log(err);
                res.status(500).json({message:"err"});
            } else{
                console.log(result);
                res.status(200).json({result});
            }
        })
    })



    const port = process.env.PORT || 4000;

    app.listen(3000, () => {
        console.log("Server Running");
    });
});

