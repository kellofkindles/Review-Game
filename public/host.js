let started = false;
const socket = io({
  auth: {
    host: true,
    username: "HOST"
  }
});

socket.on("start game", (data) => {
  started = true;
});

socket.on("update sentence", (data) => {
  document.getElementById("sentence").innerText = data.sentence;
});

socket.on("leaderboard", (data) => {
  document.getElementById("leaderboard").innerHTML = "";
  data.forEach(score => {
    document.getElementById("leaderboard").insertAdjacentHTML("beforeend", `<div class="listItem"><span class="username">${score[0]}</span> <span class="score">${score[1]}</span></div>`)
  });
})

socket.on("connect_error", (err) => {
  alert(`connect_error due to ${err.message}`);
});

function startGame() {
  socket.emit("start");
}
document.addEventListener("keyup", function (e) {
  if(e.key === "Enter" && !started){
    startGame()
  }
});