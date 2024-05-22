const express = require("express");
const { connectToMongoDb } = require('./connect');
const URL = require('./models/url')
const app = express();
const PORT = 8001;
const path = require('path');

const cookieParser = require('cookie-parser')
const {restrictTologgedinUserOnly} = require('./middlewares/auth');
//ROUTES IMPORT
const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter');
const userRoute = require('./routes/user');


connectToMongoDb('mongodb://localhost:27017/short-url').then(
    () => console.log("MongoDB Connected")
);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

//middleware
app.use(express.json());
//for form data
app.use(express.urlencoded({extended : false}));
app.use(cookieParser());

app.use('/url',restrictTologgedinUserOnly,urlRoute);
app.use('/user',userRoute);
app.use("/",staticRoute);


app.get('/url/:shortId',async (req,res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
        {
            shortId
        }, 
        {
            $push:{
                visitHistory : {
                    timestamp  : Date.now()
                }
            }
        }
    );
    res.redirect(entry.redirectURL)
});

app.listen(PORT, () => console.log(`Server Started at PORT : ${PORT}`));