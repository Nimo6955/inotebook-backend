const mongoose = require('mongoose')
const mongoURI = `mongodb+srv://Cluster0:8RS0oCQ6gl7E2W8U@cluster0.dfj0em4.mongodb.net/inotebookData`

const connectToMongo = () => {
        mongoose.connect(mongoURI, () => {
                console.log('mongoooooooo')
            })
        }
        



        
        module.exports = connectToMongo
