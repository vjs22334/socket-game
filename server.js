const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const app = express();




// Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));


// Send all other requests to the Angular app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

//Set Port
const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);
var io = require('socket.io')(server);
var players=[];
var turn = 0;
var stacks=[12,6,25,7];
var playerNo=2;
var gameRunning=false;

function reset(){
console.log("reset");
players=[];
turn = 0;
stacks=[12,6,25,7];
playerNo=2;
gameRunning=false;

}

io.on("connect",function(socket){
    var username=socket.handshake.query.username;
    var id=players.length+1;
    players.push({"username":username,"id":id});
    console.log(username);
    socket.broadcast.emit("new player",{"username":username,"players":players});
    socket.emit("wait",{"players":players,"id":id});
    if(players.length===playerNo){
    gameRunning=true;
    io.emit("game start");
    io.emit("game",{"stacks":stacks,"turn":turn,"message":"game started"} );
    }
    socket.on("input",(data)=>{
        if(gameRunning){
        //turn check
            if((id-1)===turn){
            // validity check
                if(data.stack>=0&&(data.stack-1)<=stacks.length&&stacks[data.stack-1]>=data.remove&&data.remove!=0){
                stacks[data.stack-1]-=data.remove;
                var gameFinished=true;
                for(let stack of stacks){
                    if(stack!==0){gameFinished=false}
                }
                if(gameFinished){
                    io.emit("game finished",{"stacks":stacks,"turn":turn});
                    setTimeout(reset,3000);
                }
                else{
                turn=(turn+1)%playerNo;
                var msg="player "+id+" removed "+data.remove+" from "+data.stack;
                io.emit("game",{"stacks":stacks,"turn":turn,"message":msg});
                }
            }
            else{
                socket.emit("invalid");
            }
        }
        else{
            socket.emit("wrong turn");
        }
        }
    });


    socket.on("disconnect",function(socket){
        console.log("user disconnected");
        players.splice(id-1,1);
        playerNo=players.length;
        if(players.length===0){
        reset();
        }
        for(var i=0;i<players.length;i++){
        players[i].id=i+1;
        }
        io.emit("update players",players);
        if(players.length===1){
        io.emit("game finished",{"stacks":stacks,"turn":0});
        setTimeout(reset,3000);
        }
        else {
            if(id===turn+1){
            turn=(turn+1)%playerNo;}
            io.emit("game",{"stacks":stacks,"turn":turn});
        }
    });
});




//listen
server.listen(port, () => console.log(`Running on localhost:${port}`));
