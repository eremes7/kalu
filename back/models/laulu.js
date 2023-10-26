const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

mongoose.connect(url)
    .then(result => {
        console.log('Yhdistetty MongoDB')
    })
    .catch((error) => {
        console.log('Virhe yhdistäessä tietokantaan:', error.message)
    })

const lauluSchema = new mongoose.Schema({
    nimi: {
        type: String,
        minlength: 3
    },
    numero: Number,
    sanat: {
        type: String,
    }
})

lauluSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Laulu', lauluSchema)