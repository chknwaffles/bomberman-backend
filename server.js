const https = require('https')
const express = require('express')
const expressWs = require('express-ws')
const app = express()
const server = https.createServer(app)
const mongoose = require('mongoose')
const bodyParser = require("body-parser")
const cors = require('cors')
const User = require('./models/User')
const Game = require('./models/Game')

const GAME_PORT = process.env.PORT || 3000
const CHAT_PORT = 3002
const SERVER_PORT = 4000

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

expressWs(app, server)
//MongoDB connection through mongoose
mongoose.connect('mongodb://localhost/bomberman', { useNewUrlParser: true})
.then(() => console.log('MongoDB connected!'))
mongoose.set('useCreateIndex', true)
mongoose.Promise = global.Promise

//express routes
// const GameRoutes = require('./routes/GameRoutes');
const UserRoutes = require('./routes/UserRoutes')

// GameRoutes(app)
UserRoutes(app)

app.ws('/', (ws, next) => {
    console.log('Game connected!')

    ws.on('message', (data) => {
        let dataObj = JSON.parse(data)

        switch(dataObj.type) {
            case 'B': {
                // send targets to explode
                let targetRow = (dataObj.x)
                let targetCol = (dataObj.y)
                let targets = [
                    'BOMB TARGETS',
                    { x: targetRow - 1, y: targetCol },
                    { x: targetRow, y: targetCol - 1 },
                    { x: targetRow, y: targetCol },
                    { x: targetRow + 1, y: targetCol },
                    { x: targetRow, y: targetCol + 1 },
                ]

                bombTimer = () => {
                    setTimeout(() => {
                        gameSocket.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify(targets))
                                console.log('sending data', targets)
                                clearTimeout(bombTimer)
                            }
                        })
                    }, 4000)
                }

                bombTimer() 
                break
            }
            default: {
                console.log('message', dataObj)
            }
        }
    })
})

// chatSocket.on('connection', (ws) => {
//     console.log('Chat connected!')

//     ws.on('message', (data) => {
//         let dataObj = JSON.parse(data)

//         if (dataObj.type === 'message') {
//             wss.clients.forEach(client => {
//                 if (client !== ws && client.readyState === WebSocket.OPEN) {
//                     client.send(JSON.stringify(data))
//                     console.log('sending message back', data)
//                 }
//             })
//         }
//     })
// })

server.listen(SERVER_PORT, () => {
    console.log('connected to server_port')
})

