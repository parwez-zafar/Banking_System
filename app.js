const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')


const port = 3000 || process.env.PORT

// cart table settings
mongoose.connect("mongodb://localhost:27017/BankingSystem", {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    console.log("connect")
}).catch(err => {
    console.log(err)
})

const bankingSchema = new mongoose.Schema({
    name: String,
    email: String,
    current_balance: Number

})

const userModel = new mongoose.model("userModel", bankingSchema)


// for cart
const moneySchema = new mongoose.Schema({
    money: Number,
    selectUser: Array
})
const moneyModel = new mongoose.model("moneyModel", moneySchema)

// transfer money
const transferSchema = new mongoose.Schema({
    money: Number,
    name: String,
    email: String,
    current_balance: Number
})
const transferModel = new mongoose.model("transferModel", transferSchema)

// // for buy item
// const buyCartSchema = new mongoose.Schema({
//     text: String,
//     url: String,
//     price: {
//         type: Number,
//         default: 300
//     },
// })
// const buyModel = new mongoose.model("buyModel", buyCartSchema)

// middleware
app.use(express.urlencoded());
app.use(express.json());

// add public or static folder
app.use(express.static(path.join(__dirname, 'assets')))

// server hbs engine
app.set("view engine", "hbs")

// set views path
app.set("views", path.join(__dirname, 'templates/views'))

// set partial path
hbs.registerPartials(path.join(__dirname, 'templates/partials'))
let newUser = [];
// routing here
app.get('/', async (req, res) => {
    try {
        let data = await userModel.find()
        res.status(200).render("home", { data: data })
    } catch (error) {
        res.status(404).render("error")
    }
})
// app.post('/', async (req, res) => {
//     try {
//         // console.log(req.body)
//         let dataSave = new userModel(req.body)
//         let data = await dataSave.save()
//         console.log(data)
//         res.status(200).render("home")
//     } catch (error) {
//         res.status(404).render("error")
//     }
// })
app.get('/customer', async (req, res) => {
    try {
        // let get tranfer money from database
        let transferMoney = await transferModel.find()
        res.status(200).render("customer", { data: transferMoney })

    } catch (error) {
        res.status(404).render("error")
    }
})
app.get('/transfer', async (req, res) => {
    try {
        let transferMoney = await transferModel.find()
        res.status(200).render("transfer",
            { data: transferMoney })
    } catch (error) {
        res.status(404).render("error")
    }
})

// post send money
app.post('/tranferMoney', async (req, res) => {
    try {

        let saveData = new moneyModel(req.body)
        let saveMoney = await saveData.save()
        console.log(saveMoney)


        // update the cBalance of user
        let updateMoney = await moneyModel.find()
        let len = updateMoney.length

        let moneysend = updateMoney[len - 1].money
        console.log(moneysend)

        updateMoney[len - 1].selectUser.forEach(async (_id, index) => {
            let matchUser = await userModel.findById({ _id })
            let newmoney = matchUser.cBal + moneysend;
            let dataUpdate = new transferModel({
                name: matchUser.name,
                email: matchUser.email,
                // cBal: matchUser.cBal,
                cBal: newmoney,
                money: moneysend,
            })
            let saveData = await dataUpdate.save()
            // console.log(saveData)


            // update the banking system
            let updateBank = await moneyModel.findByIdAndUpdate({ _id }, {
                cBal: newmoney
            })
            console.log(updateBank)
        })

        // let get tranfer money from database
        // let transferMoney = await transferModel.find()

        res.redirect("/")
    } catch (error) {
        res.status(404).render("error")
    }
})

app.listen(port, () => console.log('listening on port'))

