import mongoose from "mongoose";
mongoose.set('strictQuery', false)

class ContainerMongoDB {

    constructor(URL) {
        this.URL = URL
    }

    async connect() {
        await mongoose.connect(this.URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
    }

    //insertItems
    async insertItems(object) {
        this.connect()
            //let count = await this.model.count()
            //object.id = count + 1
        await this.model.create(object)
    }

    //getById
    async getById(id) {
        this.connect()
        return await this.model.find({ id: id })
    }

    //getAll
    async getAll() {
        this.connect()
        return await this.model.find({})
    }

    //updateItem
    async updateItemById(id, data) {
        this.connect()
        let filter = { id: id }
        return await this.model.findOneAndUpdate(filter, data)

    }

    //deleteById
    async deleteById(id) {
        this.connect()
        return await this.model.deleteOne({ id: id })
    }

    //deleteAll
    async deleteAll() {
        this.connect()
        return await this.model.deleteMany({})
    }

    disconnect() {
        mongoose.disconnect()
    }


}

export default ContainerMongoDB