const socket = io()
const items = document.getElementById("items")
const messages = document.getElementById("messages")
//Define structure for items in table
socket.on("items", data => {
    const html = data.map(it => {
        return `<tr><td>${it.nombre}</td>
        <td>${it.precio}</td>
        <td><img style="width: 4rem" src=${it.foto} alt="product thumbnail"></td>
        </tr>`
        })
        .join(" ")
    items.innerHTML = html
})



//Define structure for chat messages

socket.on("messages", data => {
    const html = data.map(it => {
            return `<div class="mt-6"><span class="text-primary">${it.author.email}</span>
        <span>[${it.author.nombre}]</span>
        <span class="text-success fw-bold text-break">${it.text}</span>
        <span><img style="width: 4rem;border-radius: 4rem" src=${it.author.avatar} alt="avatar pic"/></span></div>
        <br>
        `
        })
        .join(" ")
    messages.innerHTML = html

})

function addMessage(){
    const msg = {
        author:{
            email: document.getElementById("email").value,
            name: document.getElementById("name").value
        },
        text: document.getElementById("text").value
        
    }
    socket.emit("new-message", msg)
    return false
    }

function sayGoodbye(userName){
    document.getElementById("mainBody").innerHTML = `<h2 class="fw-bold fs-2 text-success text-center d-flex justify-content-center my-2">Hasta luego ${userName}!</h2>`
}