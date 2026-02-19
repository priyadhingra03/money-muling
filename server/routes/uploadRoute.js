const express = require("express")
const multer = require("multer")
const csv = require("csv-parser")
const fs = require("fs")
const Graph = require("../services/graphBuilder")

const router = express.Router()

// configure multer
const upload = multer({ dest: "uploads/" })

router.post("/upload", upload.single("file"), (req, res) => {
  const filePath = req.file.path

  const graph = new Graph()

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      // convert timestamp to Date object
      row.timestamp = new Date(row.timestamp)
      row.amount = parseFloat(row.amount)

      graph.addTransaction(row)
    })
    .on("end", () => {
      fs.unlinkSync(filePath) // delete file after processing

      res.json({
        total_accounts: graph.nodes.size,
        total_transactions: graph.transactions.length,
      })
    })
})

module.exports = router