import express from "express";
import route from "./routes/index.route";
import cors from "cors"
const app = express();
const port = 5000;

app.use(express.json());
app.use("/public", express.static("public"));
app.use(cors())

app.use("/api", route);

app.use('/', (req, res) => {
    res.send("Hello world!")
});


app.listen(port, () => console.log(`Server running on port: ${port}`));