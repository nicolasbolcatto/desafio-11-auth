import ContainerMongo from "../ContainerMongo.js"
import mongoose from "mongoose"

class AuthMongoDao extends ContainerMongo {
    constructor() {
        super("mongodb+srv://nicobolcatto:x3Q76fnRi0Ahqyoq@cluster0.lm6pupb.mongodb.net/?retryWrites=true&w=majority")
        this.model = this.createModel()
    }

    createModel() {
        let schemaStructure = {
            email: { type: String, required: true },
            hash: { type: String, required: true }
        }
        let schema = new mongoose.Schema(schemaStructure)
        return mongoose.model("users", schema)
    }
}

export default AuthMongoDao