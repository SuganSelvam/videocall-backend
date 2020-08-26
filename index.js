
var app = require("express")();
var http = require('http').createServer(app);
var io = require('socket.io')(http);


const bcrypt = require("bcrypt")


const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());


const port = process.env.PORT || 4040



const mongodb = require("mongodb");
const url =  "mongodb+srv://admin:admin@login.7aoxw.mongodb.net/Login?retryWrites=true&w=majority";


io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})


app.post("/", async (req, res) => {

  console.log(req.body)

  if(req.body.SubmitType === "Login"){

    try {


      let client = await mongodb.connect(url);
      let db = client.db("login");
  

      let dataUser = await db.collection("userLogin").find({ name: req.body.name }).toArray();
      await client.close();

      bcrypt.compare(req.body.password, dataUser[0].password, function(err, result) {
          console.log("Result",result)          
          res.send({result,dataUser}); 
        });


      console.log("User Data :",dataUser);
      console.log(req.body);
  

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



http.listen(port, () => {
  console.log("listening on : ",port);
});
