import express from "express";
import fs from "fs";
import { MongoClient, Collection } from "mongodb";
import { User, Device } from "./interfaces";

const app = express();

app.use("/css", express.static("css"));
app.use("/images", express.static("images"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(mongoUrl);

let usersCollection: Collection<User>;
let devicesCollection: Collection<Device>;

//Vult database indien dat nog niet is gebeurt
async function seedDatabaseIfEmpty() {
  await client.connect();

  const db = client.db("stepapp");
  usersCollection = db.collection<User>("users");
  devicesCollection = db.collection<Device>("devices");

  const usersCount = await usersCollection.countDocuments();

  if (usersCount === 0) {
    const users: User[] = JSON.parse(fs.readFileSync("./users.json", "utf-8"));
    const devices: Device[] = JSON.parse(fs.readFileSync("./devices.json", "utf-8"));

    await usersCollection.insertMany(users);
    await devicesCollection.insertMany(devices);

    console.log("Data uit JSON toegevoegd aan MongoDB");
  } else {
    console.log("Data bestaat al in MongoDB");
  }
}

app.get("/", async (req, res) => {
  let users = await usersCollection.find({}).toArray();

  const search = (req.query.search as string) || "";
  const sort = (req.query.sort as string) || "name";
  const order = (req.query.order as string) || "asc";

  if (search) {
    users = users.filter(user =>
      user.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  users.sort((a: any, b: any) => {
    if (a[sort] < b[sort]) return order === "asc" ? -1 : 1;
    if (a[sort] > b[sort]) return order === "asc" ? 1 : -1;
    return 0;
  });

  res.render("index", {
    users,
    search,
    sort,
    order
  });
});

app.get("/user/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const user = await usersCollection.findOne({ id });

  if (!user) return res.send("User not found");

  res.render("detail", { user });
});

app.get("/user/:id/edit", async (req, res) => {
  const id = parseInt(req.params.id);
  const user = await usersCollection.findOne({ id });

  if (!user) return res.send("User not found");

  res.render("detail", { user, showModal: true });
});

app.post("/user/:id/edit", async (req, res) => {
  const id = parseInt(req.params.id);

  await usersCollection.updateOne(
    { id },
    {
      $set: {
        name: req.body.name,
        description: req.body.description,
        dailyGoalSteps: parseInt(req.body.dailyGoalSteps),
        isActive: req.body.isActive === "true",
        plan: req.body.plan
      }
    }
  );

  res.redirect(`/user/${id}`);
});

app.get("/device/:id/:userId", async (req, res) => {
  const deviceId = parseInt(req.params.id);
  const userId = parseInt(req.params.userId);

  const device = await devicesCollection.findOne({ id: deviceId });
  const user = await usersCollection.findOne({ id: userId });

  if (!device || !user) {
    return res.send("Device or user not found");
  }

  res.render("device-detail", { device, user });
});

app.get("/device/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const device = await devicesCollection.findOne({ id });

  if (!device) return res.send("Device not found");

  res.render("device-detail", { device, user: null });
});

app.get("/devices", async (req, res) => {
  let devices = await devicesCollection.find({}).toArray();

  const search = (req.query.search as string) || "";
  const sort = (req.query.sort as string) || "brand";
  const order = (req.query.order as string) || "asc";

  if (search) {
    devices = devices.filter(device =>
      device.brand.toLowerCase().includes(search.toLowerCase()) ||
      device.model.toLowerCase().includes(search.toLowerCase())
    );
  }

  devices.sort((a: any, b: any) => {
    if (a[sort] < b[sort]) return order === "asc" ? -1 : 1;
    if (a[sort] > b[sort]) return order === "asc" ? 1 : -1;
    return 0;
  });

  res.render("devices", {
    devices,
    search,
    sort,
    order
  });
});

seedDatabaseIfEmpty().then(() => {
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
});