//Create App and adding Express, HTTP and Socket
var app = require("express")();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

//For Hashing and Secured Password
const bcrypt = require("bcrypt")

//Cors : To enable CORS & Body Parer to Parse data which is sent from Client 
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

//Port Intialization
const port = process.env.PORT || 4040


//Importing MongoDB and Connectiong to Online DB
const mongodb = require("mongodb");
const url =  "mongodb+srv://admin:admin@login.7aoxw.mongodb.net/Login?retryWrites=true&w=majority";


//connection occurs when users open the client link (Home page)
// io.on('connection', (socket) => {
//     console.log('User connected with ID : ',socket.id);

//     //Gets data from one Client and Emits(Sends) to all client for Button1 When Clicked
//     socket.on("click1",data => {
//       io.sockets.emit("click1",data)
//     })

//      //Gets data from one Client and Emits(Sends) to all client for Button2 When Clicked
//     socket.on("click2",data => {
//       io.sockets.emit("click2",data)
//     })

//   });

//To Get Login Data From Client & Finds using the username and sends back to frontend
app.post("/", async (req, res) => {

  console.log(req.body)

  if(req.body.SubmitType === "Login"){

    try {

      //Creating a client from MongoDB URL & connecting it to it's Collection
      let client = await mongodb.connect(url);
      let db = client.db("login");
  
      //getting user Data by finding it in the collection
      let dataUser = await db.collection("userLogin").find({ name: req.body.name }).toArray();
      await client.close();

      bcrypt.compare(req.body.password, dataUser[0].password, function(err, result) {
          console.log("Result",result)          
          //Sending User Data
          res.send({result,dataUser}); 
        });

      //Console Log for Test Purpose
      console.log("User Data :",dataUser);
      console.log(req.body);
  
      //Error Handling
    } catch (err) {
      res.status(500).send('Something broke!')
    }

  }else{
    console.log("User Registering")
    try {

      let salt = await bcrypt.genSalt(10)
      let hash = await bcrypt.hash(req.body.password,salt)

      req.body.password=hash

      let client = await mongodb.connect(url);
      let db = client.db("login");
      let data = await db.collection("userLogin").insertOne({name : req.body.name, password: req.body.password});
      await client.close();

      res.json({
        message: "Registered As User",
      })

      console.log(req.body)

    } catch (error) {

      console.log(err)

    }

  }

});


//opening Port on 4040 or Heroku's Port
http.listen(port, () => {
  console.log("listening on : ",port);
});
