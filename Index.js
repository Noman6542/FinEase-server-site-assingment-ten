const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
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

    app.post('/finease-data',async(req,res)=>{
      const data =req.body;
      const result = collection.insertOne(data);
      res.send(result);
    })

    
    
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
