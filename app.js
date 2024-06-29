if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}
// console.log(process.env.SECRET);

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

// const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl="ATLASDB_URL=mongodb+srv://Priya-Chauhan:v5jozXhvbccir4H0@cluster0.l0qnjn4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
// const dbUrl=process.env.ATLASDB_URL;




main()
.then(()=>{
    console.log("connection to DB");
})
.catch(err=>{
    console.log(err);
});

async function main(){
    // await mongoose.connect(MONGO_URL);
    await mongoose.connect(dbUrl);
}

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE",err);
})

const sessionOptions={
    store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true, //security purpose
    },
};

// app.get("/",(req,res)=>{
//     res.send("Hii, i am root");
// });



app.use(session(sessionOptions));
app.use(flash()); //use before routes

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //authen-login or sign karne ke liye

passport.serializeUser(User.serializeUser()); //serialize user info ko store karna
passport.deserializeUser(User.deserializeUser()); //to remove user related information

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"delta-student",
//     });
//     let registeredUser=await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.all("*",(req,res,next)=>{
    next(new ExpressError(404, "Page not found!"));
});

app.use((err,req,res,next)=>{
    let{statusCode=500, message="Something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
    // res.send("Something went wrong!");
})

app.listen(8080,()=>{
    console.log("Server is listening to port 8080")
});