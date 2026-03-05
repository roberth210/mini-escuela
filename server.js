const express=require("express")
const http=require("http")
const fs=require("fs")
const {Server}=require("socket.io")

const app=express()
const server=http.createServer(app)
const io=new Server(server)

app.use(express.json())
app.use(express.static("public"))

let users=require("./users.json")
let players=require("./ranking.json")

/* LOGIN */

app.post("/login",(req,res)=>{

const {user,pass}=req.body

let u=users.find(x=>x.user==user && x.pass==pass)

if(u){

let p=players.find(x=>x.user==user)

res.json({
ok:true,
points:p?p.points:0
})

}else{

res.json({ok:false})

}

})

/* CREAR USUARIO */

app.post("/create",(req,res)=>{

users.push(req.body)

fs.writeFileSync("users.json",JSON.stringify(users,null,2))

res.json({ok:true})

})

/* VER USUARIOS */

app.get("/users",(req,res)=>{

res.json(users)

})

/* SOCKET */

io.on("connection",(socket)=>{

/* ENVIAR TOP AL CONECTAR */

socket.emit("top",players.slice(0,5))

socket.on("score",(data)=>{

let p=players.find(x=>x.user==data.user)

if(!p){

players.push(data)

}else{

p.points=data.points

}

players.sort((a,b)=>b.points-a.points)

fs.writeFileSync("ranking.json",JSON.stringify(players,null,2))

io.emit("top",players.slice(0,5))

})

})

/* SERVIDOR PARA RED LOCAL */

server.listen(3000,"0.0.0.0",()=>{

console.log("🚀 Servidor funcionando")
console.log("🌐 PC: http://localhost:3000")
console.log("📱 Celular: http://192.168.100.11:3000")

})