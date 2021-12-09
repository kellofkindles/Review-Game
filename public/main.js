let started = false;
let socket;
let clueLength;

function joinGame(username) {
  socket = io({
    auth: {
      "username": username,
    }
  })
}

function submit(){
  let input = document.getElementById("input").value.trim();
  if (started && input.length === clueLength) {
    socket.emit("guess", input)
  } else if (socket === undefined) {
    joinGame(input);
    socket.on("start game", (data) => {
      started = true;
    });

    socket.on("right", () => {
      document.getElementById("input").style.backgroundColor = "green";
      document.getElementById('input').disabled = true;
    })

    socket.on("wrong", () => {
      document.getElementById("input").style.backgroundColor = "red";
    })

    socket.on("update sentence", (data) => {
      document.getElementById("sentence").innerText = data.sentence;
      if(data.clueLength){
        clueLength = data.clueLength;
        document.getElementById("input").disabled = false;
        document.getElementById("input").value = "";
        document.getElementById("input").style.backgroundColor = "white";
      }
    });

    socket.on("connect_error", (err) => {
    });
    document.getElementById("input").disabled = true;
  }
}

document.addEventListener("keyup", function (e) {

  let input = document.getElementById("input").value.trim();
  if (started && input.length === clueLength) {
    socket.emit("guess", input)
  } else if (!started && e.key === "Enter" && socket === undefined) {
    joinGame(input);
    socket.on("start game", (data) => {
      started = true;
    });

    socket.on("right", () => {
      document.getElementById("input").style.backgroundColor = "green";
      document.getElementById('input').disabled = true;
    })

    socket.on("wrong", () => {
      document.getElementById("input").style.backgroundColor = "red";
    })

    socket.on("update sentence", (data) => {
      document.getElementById("sentence").innerText = data.sentence;
      if(data.clueLength){
        clueLength = data.clueLength;
        document.getElementById("input").disabled = false;
        document.getElementById("input").value = "";
        document.getElementById("input").style.backgroundColor = "white";
      }
    });

    socket.on("connect_error", (err) => {
      alert(err.message);
    });
    document.getElementById("input").disabled = true;
  }
});