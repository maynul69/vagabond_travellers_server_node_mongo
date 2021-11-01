const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;


//middleware for cors
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.huhhl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log(uri);


async function run() {
  try {
    await client.connect();
    const database = client.db("vagabond_db");
    const packageCollection = database.collection("tour_packages");
    const internationalPackages = database.collection("international_packages");
    const bookingsCollection = database.collection("bookings");

    //GET  API
    app.get("/packages", async (req, res) => {
      const cursor = packageCollection.find({});
      const packages = await cursor.toArray();

      res.send(packages);
    });

    //GET SINGLE package
    app.get("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const package = await packageCollection.findOne(query);
      res.json(package);
    });

    //GET API
    app.get("/international", async (req, res) => {
      const cursor = internationalPackages.find({});
      const international = await cursor.toArray();
      res.send(international);
    });

    //POST API

    app.post("/packages", async (req, res) => {
      const package = req.body;
      const result = await packageCollection.insertOne(package);
      res.json(result);
    });

    //post api for bookings
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.json(result);
    });

    // GET api for getting orders by USERID
    app.get("/bookings/:uid", async (req, res) => {
      const USERID = req.params.uid;
      console.log(USERID);
      const query = { userId: USERID };
      const eachUserOrderData = await bookingsCollection.find(query).toArray();
      console.log(eachUserOrderData);
      res.json(eachUserOrderData);
    });

    //get all orders
    app.get("/bookings", async (req, res) => {
      const cursor = bookingsCollection.find({});
      const booking = await cursor.toArray();
      res.send(booking);
    });
    // CANCEL BOOKING API
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.json(result);
    });

    // PUT API FOR UPDATE
    app.put("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const updatedOrder = req.body;
      console.log(updatedOrder);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          orderStatus: "Approved",
        },
      };
      const result = await bookingsCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      console.log("Update Hitted ", id);
      res.json(result);
    });
  } finally {
    //await clint.close();
  }
}
run().catch(console.dir);



app.get("/", (req, res) => {
  res.send("Tourism Server is running");
});

app.listen(port, () => {
  console.log("Server is Running at", port);
});