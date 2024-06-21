const express=require("express");
const router=express.Router();

//Posts
//Index
router.get("/",(req,res)=>{
    res.send("GET for post");
});

//Show
router.get("/:id",(req,res)=>{
    res.send("GET for post id");
});

//Post
router.post("/",(req,res)=>{
    res.send("POST for post");
});

//Delete
router.post("/:id",(req,res)=>{
    res.send("DELETE for post id");
});

module.exports=router;
