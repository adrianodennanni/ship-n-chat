  var SERVER_ADDRESS;

  var ctx;
  var playerListElem;

  var keys;
  var name;

  $( document ).ready(function() {

    /*window.addEventListener("keydown", function(e) {
        // space and arrow keys
        if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);*/

    SERVER_ADDRESS = document.URL;

    ctx = document.getElementById("paper").getContext("2d");
    playerListElem = document.getElementById("playerList");
    name = prompt("Escreva seu nome:");

    if (name.length > 10) {
      name = invalidName(name);
    }

    if (name === null || name === "" || name === "null") {
      name = "Jogador";
    }

    keys = {};

    ctx.lineWidth = 2;
    ctx.font = "normal 14px sans-serif";
  })

  function invalidName(name) {
    var new_name = prompt("Seu nome não pode exceder 10 caracteres. Escreva seu nome:");
    if (new_name.length > 10) {
      return invalidName(new_name);
    }
    return new_name;
  }

  function render(state) {
    ctx.clearRect(0, 0, 1024, 768);
    var newListHTML = "";

    // Renderiza as naves
    for (var i = 0; i < state.p.length; ++i) {
      ctx.save();
      ctx.strokeStyle = "#" + state.p[i][5];
      ctx.fillStyle = "#" + state.p[i][5];
      ctx.translate(state.p[i][0], state.p[i][1]);
      ctx.fillText(state.p[i][3], 12, -10);
      ctx.rotate(state.p[i][2]);

      ctx.beginPath();
      ctx.moveTo(-12, -10);
      ctx.lineTo(-14, -4);
      ctx.lineTo(-14, -3);
      ctx.lineTo(-16, -3);
      ctx.lineTo(-16, -1);
      ctx.lineTo(-14, -1);

      ctx.lineTo(-14, 1);
      ctx.lineTo(-16, 1);
      ctx.lineTo(-16, 3);
      ctx.lineTo(-14, 3);
      ctx.lineTo(-14, 4);
      ctx.lineTo(-12, 10);

      ctx.lineTo(6, 10);
      ctx.lineTo(-6, 10);
      ctx.lineTo(-6, 3);
      ctx.lineTo(-2, 3);
      ctx.lineTo(-2, 2);
      ctx.lineTo(4, 2);

      ctx.lineTo(16, 0);

      ctx.lineTo(4, -2);
      ctx.lineTo(-2, -2);
      ctx.lineTo(-2, -3);
      ctx.lineTo(-6, -3);
      ctx.lineTo(-6, -10);
      ctx.lineTo(6, -10);

      ctx.lineWidth = 1;
      ctx.closePath();

      ctx.fill();
      ctx.stroke();
      if (i == state.i && keys[38]) {
        ctx.beginPath();
        ctx.moveTo(-12, -4);
        ctx.lineTo(-22, 0);
        ctx.lineTo(-12, 4);
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();

      newListHTML += "<li>" + state.p[i][3] + " : " + state.p[i][4] + "</li>";
    }

    // Renderiza as balas
    for (var i = 0; i < state.b.length; ++i) {
      ctx.fillStyle = "#" + state.b[i][2];

      ctx.save();
      ctx.translate(state.b[i][0], state.b[i][1]);
      ctx.fillRect(-4, -4, 4, 4);
      ctx.restore();
    }

    playerListElem.innerHTML = newListHTML;
  }

  // Conecta no servidor
  var socket = io.connect(SERVER_ADDRESS);

  // Chat
  $(function() {
    $('form').submit(function() {
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
      return false;
    });
    socket.on('chat message', function(msg) {
      $('#messages').append($('<li>').text(msg)).focus();
      $('#messages').animate({scrollTop: $('#messages').prop("scrollHeight")}, 1);
    });
  });

  // Jogo
  socket.on("connect", function() {
    window.onkeydown = function(e) {
      keys[e.keyCode] = true;
      socket.send(JSON.stringify(keys));
    }
    window.onkeyup = function(e) {
      delete keys[e.keyCode];
      socket.send(JSON.stringify(keys));
    }

    socket.on("message", function(data) {
      var state = JSON.parse(data);
      render(state);
    });

    socket.send(JSON.stringify({
      name: name
    }));
  });
