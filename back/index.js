require('dotenv').config()
const http = require('http')
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
app.use(express.static('build'))
app.use(cors())
app.use(express.json())
const Laulu = require('./models/laulu')

const PORT = process.env.PORT

app.use(morgan('## :method :url -- :status -- :response-time ms -- :body'))

morgan.token('body', (req, res) => JSON.stringify(req.body));

let laulut = []


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

app.get('/api/laulut', (request, response, next) => {
    console.log('pöröt')
    Laulu.find({}).then(laulut => {
        response.json(laulut)
    })
        .catch(error => next(error))
})

app.post('/api/laulut', (request, response, next) => {
    const body = request.body

    if (body.nimi === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }

    const laulu = new Laulu({
        nimi: body.nimi,
        sanat: body.sanat
    })

    laulu.save()
        .then(savedLaulu => {
            response.json(savedLaulu)
        })
        .catch(error => next(error))
})

app.get('/api/laulut/:id', (request, response, next) => {
    Laulu.findById(request.params.id)
        .then(laulu => {
            if (laulu) {
                response.json(laulu)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/laulut/:id', (request, response, next) => {
    Laulu.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/laulut/:id', (request, response, next) => {
    const { nimi, sanat } = request.body
    console.log(request.body)
    Laulu.findByIdAndUpdate(
      request.params.id, 
      { nimi, sanat },
      //{ new: true, runValidators: true, context: 'query' }
    ) 
      .then(updatedLaulu => {
        response.json(updatedLaulu)
      })
      .catch(error => next(error))
  })


const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.nimi === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.nimi === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

app.use(errorHandler)