import ContainerMongo from "../ContainerMongo.js"
import mongoose from "mongoose"

class MessagesMongoDao extends ContainerMongo {
    constructor() {
        super("mongodb+srv://nicobolcatto:x3Q76fnRi0Ahqyoq@cluster0.lm6pupb.mongodb.net/?retryWrites=true&w=majority")
        this.model = this.createModel()
    }

    createModel() {
        let schemaStructure = {
            author: {
                email: { type: String, required: true },
                nombre: { type: String, required: true },
                apellido: { type: String, required: true },
                edad: { type: Number, required: true },
                alias: { type: String, required: true },
                avatar: { type: String, required: true }
            },
            text: { type: String, required: true },
            identifier: { type: Number, required: true }
        }
        let schema = new mongoose.Schema(schemaStructure)
        return mongoose.model("messageList", schema)
    }
}



export default MessagesMongoDao