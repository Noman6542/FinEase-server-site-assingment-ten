const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const cors = require('cors')
const app = express()
const port = 3000

app.use(cors())
app.use(express.json())



const uri = "mongodb+srv://finease:cAsXK%25*ZMg3dmPf@cluster0.4ckhtis.mongodb.net/?appName=Cluster0";


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
    await client.connect();

    const db= client.db('finease')
    const collection =db.collection('finease-data')
    // post 
    app.post('/finease-data',async(req,res)=>{
       try {
    const data = req.body;
    const result = await collection.insertOne(data);  
    res.status(201).send(result); 
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).send({ message: "Failed to insert data", error: error.message });
  }
    });

    // home overview 
    app.get("/overview", async (req, res) => {
  try {
    const transactions = await collection.find().toArray();

    const income = transactions
      .filter(i => i.type === "Income")
      .reduce((sum, i) => sum + i.amount, 0);

    const expense = transactions
      .filter(e => e.type === "Expense")
      .reduce((sum, e) => sum + e.amount, 0);

    const balance = income - expense;

    res.send({ income, expense, balance });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to load overview" });
  }
});


  // email 

app.get('/finease-data', async (req, res) => {
  try {
    const userEmail = req.query.userEmail;

    if (!userEmail) {
      return res.status(400).send({ message: "Missing userEmail!" });
    }

    const transactions = await collection.find({ userEmail }).toArray();         

    res.status(200).send(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).send({ message: "Server error", error: error.message });
  }
});

// details 
app.get("/transactions/:id", async (req, res) => {
  try {
    const {id} = req.params;
    console.log(id);
    
    const transaction = await collection.findOne({ _id: new ObjectId(id) });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found!" });
    }

    res.json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ message: "Failed to fetch transaction", error });
  }
});

app.get("/transactions", async (req, res) => {
  try {
    const { category, userEmail } = req.query;
    let query = {};

    if (category) query.category = category;
    if (userEmail) query.userEmail = userEmail;

    const transactions = await collection.find(query).toArray();
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// update api

 app.put("/transactions/:id", async (req, res) => {
      const id = req.params.id;
      const updated = req.body;
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updated }
      );
      res.send(result);
    });




  // delete 
app.delete('/delete/:id', async (req, res) => {
  try {
    const {id}= req.params.id;

    if (!id) return res.status(400).send({ message: "Missing id!" });

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0)
      return res.status(404).send({ message: "Transaction not found!" });

    res.status(200).send({ message: "Transaction deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error", error: error.message });
  }
});



    
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
