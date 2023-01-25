//Imports
import express from "express"
import session from 'express-session'
import MongoStore from "connect-mongo"
import { engine } from "express-handlebars"
import { Server as HttpServer } from "http"
import { Server as IOServer } from "socket.io"
import MessagesMongoDao from "./db/dao/MessagesMongoDao.js"
import AuthMongoDao from "./db/dao/AuthMongoDao.js"
import { normalize, schema } from "normalizr"
import { faker } from '@faker-js/faker'
import cookieParser from "cookie-parser"
faker.locale = 'es'
import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"
import bcrypt from "bcrypt"

//Start express app
const app = express()

//Start io websocket
const httpServer = HttpServer(app)
const io = new IOServer(httpServer)

//Indicate static files in public folder
app.use(express.static("./public"))

//Configure app
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

//Create session
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }
app.use(session({
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://nicobolcatto:x3Q76fnRi0Ahqyoq@cluster0.lm6pupb.mongodb.net/sessions",
        mongoOptions: advancedOptions,
        ttl: 60,
        autoRemove: "native"
    }),
    secret: "Secret password",
    resave: false,
    saveUninitialized: false
}))

//Create template engine
app.engine("handlebars", engine())

app.set("views", "./public/views")
app.set("view engine", "handlebars")

//Create database DAOs
const mongoContainerMessages = new MessagesMongoDao()
const mongoContainerUsers = new AuthMongoDao()

//-------------------------------------------------------------------------
//AUTH STRATEGIES
app.use(passport.initialize())
app.use(passport.session())

async function getData() {
    return await mongoContainerUsers.getAll()
}

passport.use("register", new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'emailId',
    passwordField: 'password'
}, (req, email, password, done) => {
    getData().then((users) => {
        const currentUser = users.find(user => user.email == email)

        if (currentUser) {
            return done(null, false)
        }

        //Encrypt password
        const saltRounds = 10;

        bcrypt.hash(password, saltRounds, function(err, hash) {
            const newUser = {
                email,
                hash
            }
            mongoContainerUsers.insertItems(newUser)
            done(null, newUser)
        });
    })



}))

passport.use("login", new LocalStrategy({
    usernameField: 'emailId',
    passwordField: 'password'
}, (email, password, done) => {
    getData().then((users) => {

        const currentUser = users.find(user => user.email == email)
        if (!currentUser) {
            return done(null, false)
        }

        bcrypt.compare(password, currentUser.hash, function(err, result) {
            if (result) {
                return done(null, currentUser)
            } else {
                return done(null, false)
            }
        });

    })
}))

function requireAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.redirect('/login')
    }
}

passport.serializeUser((err, user, done) => {
    console.log(err)
    done(null, user.email)
})

passport.deserializeUser((err, email, done) => {
    console.log(err)
    getData().then((users) => {
        const currentUser = users.find(user => user.email == email)
        done(null, currentUser)
    })
})

//-------------------------------------------------------------------------
//ROUTES


app.get("/", (req, res) => {
    res.redirect("/login")
})

app.get("/register", (req, res) => {
    try {
        res.render("register", {layout: "register"})
    } catch (error) {
        console.log(`Error: ${error}`)
    }
})

app.post("/register", passport.authenticate("register", { failureRedirect: "/fail-register", successRedirect: "/" }))

app.get("/login", (req, res) => {
    try {
        res.render("login",{layout: "login"})
    } catch (error) {
        console.log(`Error: ${error}`)
    }
})

app.post("/login", passport.authenticate("login", { failureRedirect: "/fail-login", successRedirect: "/api/productos-test" }))

app.get("/fail-login", (req, res) => {
    try {
        res.render("login-error", {layout: "login-error"})
    } catch (error) {
        console.log(`Error: ${error}`)
    }
})

app.get("/fail-register", (req, res) => {
    try {
        res.render("register-error", {layout: "register-error"})
    } catch (error) {
        console.log(`Error: ${error}`)
    }
})

app.get("/bye", (req, res) => {
    try {
        setTimeout(() => {AAA
            res.redirect("/login")
        }, 2000)
    } catch (error) {

    }
})

//GET messages
app.get("/api/productos-test", requireAuthentication, (req, res) => {
    try {   
            console.log(req.session.passport)
            req.session.name = req.session.passport.user
            const loginName = req.session.name
            
            async function getMessages() {
                return await mongoContainerMessages.getAll()
            }
            getMessages().then(database => {
                
                const dataset = { id: "messages", messages: [] }
                for (let item of database) {
                    dataset["messages"].push({ author: item.author, text: item.text, identifier: item.identifier })
                }
                //normalize

                const authorSchema = new schema.Entity("author", { text: String }, { idAttribute: "email" })
                const messageSchema = new schema.Entity("post", { author: authorSchema }, { idAttribute: "identifier" })
                const messageList = new schema.Entity("posts", { messages: [messageSchema] }, { idAttribute: "id" })

                const normalizedDataset = normalize(dataset, messageList)
                const compressionRatio = Math.round((JSON.stringify(normalizedDataset).length / JSON.stringify(dataset).length) * 100)
                res.render("body", { loginName, compressionRatio })
            })


    } catch (error) {
        console.log(`Error: ${error}`)
    }

})

//POST messages
app.post("/api/productos-test", (req, res) => {
        async function postMessages() {
            try {
                const loginName = req.session.name
                const database = await mongoContainerMessages.getAll()
                const dataset = { id: "messages", messages: [] }
                for (let item of database) {
                    dataset["messages"].push({ author: item.author, text: item.text, identifier: item.identifier })
                }
                const count = dataset.messages.length

                const data = req.body
                const msg = {
                    author: {
                        email: data.email,
                        nombre: data.name,
                        apellido: data.surname,
                        edad: data.age,
                        alias: data.alias,
                        avatar: faker.image.avatar()
                    },
                    text: data.text,
                    identifier: count + 1
                }

                dataset.messages.push(msg)



                //normalize

                const authorSchema = new schema.Entity("author", { text: String }, { idAttribute: "email" })
                const messageSchema = new schema.Entity("post", { author: authorSchema }, { idAttribute: "identifier" })
                const messageList = new schema.Entity("posts", { messages: [messageSchema] }, { idAttribute: "id" })

                const normalizedDataset = normalize(dataset, messageList)


                const compressionRatio = Math.round((JSON.stringify(normalizedDataset).length / JSON.stringify(dataset).length) * 100)
                messages.push(msg)
                mongoContainerMessages.insertItems(msg)

                res.render("body", { loginName: loginName, messages: messages, compressionRatio: compressionRatio })
            } catch (error) {
                console.log(`Error: ${error}`)
            }
        }

        postMessages()
    })
    //-------------------------------------------------------------------------


//Start websocket connection for messages and items

const messages = await mongoContainerMessages.getAll()

const items = []
for (let i = 0; i < 5; i++) {
    items.push({
        nombre: faker.commerce.product(),
        precio: faker.commerce.price(100, 200, 0, '$'),
        foto: faker.image.image()
    })
}

io.on("connection", socket => {
    console.log("New client connected")

    socket.emit("items", items)
    socket.emit("messages", messages)

    socket.on("new-item", data => {
        items.push(data)
        io.sockets.emit("items", items)
    })

    socket.on("new-message", data => {
        data.author.avatar = faker.image.avatar()
        messages.push(data)
        console.log("new message emmited")
        io.sockets.emit("messages", messages)
    })
})


//Start listening to server
const PORT = 8080
httpServer.listen(PORT, () => {
    console.log(`Server listening in port ${8080}`)
})

//Indicate error if server fails
httpServer.on("error", error => console.log(`Error on server: ${error}`))