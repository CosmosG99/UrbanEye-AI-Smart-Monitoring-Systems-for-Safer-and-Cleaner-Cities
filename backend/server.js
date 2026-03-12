const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

let latestData = {}

app.post("/crowd", (req,res)=>{

    latestData = req.body

    console.log("AI Data:", latestData)

    res.json({status:"ok"})
})

app.get("/crowd",(req,res)=>{
    res.json(latestData)
})

app.listen(5000,()=>{
    console.log("Server running on port 5000")
})