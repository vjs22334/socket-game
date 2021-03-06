        $(function(){
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        var x=150,y=50,width=50;

            $("#submit").click(function(){
                $(".signIn").hide();
                var socket = io('http://localhost:3000',{query: "username="+$("#userName").val()});
                socket.on("new player",(data)=>{
                    playerList=data.players;
                    updatePlayers(data.players);
                    alert("welcome player "+data.username);
                });
                 socket.on("update players",(data)=>{
                    updatePlayers(data);
                    alert("player left");
                });
                 socket.on("wait",(data)=>{
                    updatePlayers(data.players);
                    $("#player").html("you are "+$("#userName").val());
                    $("#message").html("waiting for new players");
                });
                socket.on("game start",()=>{
                    $(".console").show();
                });
                socket.on("game",(data)=>{
                    drawGrid(data.stacks);
                    $("#turn").html("player"+(data.turn+1)+"'s turn");
                    $("#message").html(data.message);
                });
                socket.on("invalid",()=>{
                    alert("invalid input");
                });
                socket.on("wrong turn",()=>{
                    alert("not your turn");
                });
                socket.on("game finished",(data)=>{
                    $("#message").html("player"+(data.turn+1)+" wins");
                     $("#turn").html("");
                });
                $("#move").click(function(){
                    var data={
                    "stack":$("#stack").val(),
                    "remove":$("#remove").val()
                    };
                    $("#stack").val('');
                    $("#remove").val('');
                    socket.emit("input",data);
                });

            });
        function drawGrid(stacks){
        ctx.clearRect(0,0,1000,250);
        var i=0,j=0;
        ctx.font = '38px serif';
        ctx.fillText("stack", x-150, y+35);
        for(i=0;i<2;i++){
        for(j=0;j<stacks.length;j++){
            ctx.strokeRect(x+j*width, y+i*width, width, width);
            if(i===1){

            ctx.fillText(stacks[j], x+j*width+10, y+i*width+35);
            }
            if(i===0){
            ctx.fillText(j+1, x+j*width+10, y+i*width+35);
            }
        }
        }
        }
        function updatePlayers(players)
        {
            players;
            var playerString="";
            for(let player of players){
                playerString=playerString+"<li>"+player.username+" is player "+player.id+"</li>";
            }
            $("#playerlist").html(playerString);
        }
        });

