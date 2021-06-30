//jshint esversion:6
const express = require("express");
const app = express();
const mongoose  = require("mongoose");

const bodyParser = require("body-parser");
const _ = require("lodash");
//let workItems = [];
//var items = ["buy food","Cook food","Eat food" ];
mongoose.connect("mongodb+srv://admin-shomaraj:test123@cluster0.8tipg.mongodb.net/itemsDB", {
  useNewUrlParser: true,
   useUnifiedTopology: true,
   useCreateIndex: true,
   useFindAndModify: false
});
const itemsSchema = {
  name : String
};
const Item = new mongoose.model("Item", itemsSchema);


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const item1 = new Item({
  name : " welcome to the to do list"
});
const item2 = new Item({
  name : " hit + to add new items"
});
const item3 = new Item({
  name : " <-- to delete any item"
});

const defaultItems = [item1,item2,item3];
const listSchema = {
  name : String,
items : [itemsSchema]
};

const List = new mongoose.model("List", listSchema);



app.get("/",function (req,res) {
 Item.find({}, function (err, foundItems) {
   if(foundItems.length === 0 ){
     Item.insertMany(defaultItems, function (err) {
       if(err)
       {
         console.log(err);

       } else {
         console.log(" items inserted in to Db");
       }
     });
     res.redirect("/");

   } else {
     console.log(foundItems.length + " items showing");
   res.render("list", {listTitle:"Today", newListItems:foundItems});
         }
 });

});
// express route parameters for making dynamic routes /home  /work etc
app.get("/:customListName", function (req,res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name : customListName}, function (err,foundList) { //checks if list with a particularcustomListName () say /home) is there in list
    if(!err){

    if(!foundList){
      const list = new List({
        name : customListName,
        items : defaultItems
      });
      list.save();
      console.log(list);
      res.redirect("/"+customListName);
    } else{
      res.render("list", { listTitle: foundList.name, newListItems : foundList.items});
    }

  }
  });

});

app.post("/", function (req,res) {
  console.log(req.body);
  const newItem = req.body.newItem;
  const listName= req.body.list;
  console.log(req.body.list);
  const item = new Item ({
    name : newItem
  });
  if (listName === "Today")
  {
    item.save();
  res.redirect("/");
} else {
  List.findOne({name:listName} , function (err,foundList) {
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}
  });

app.post("/delete", function (req,res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(req.body.listName);
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
    if(err){
      console.log(err);
    } else {
      console.log("successfully removed checked item");
    }
    res.redirect("/");
  });
} else {
  List.findOneAndUpdate({ name : listName}, {$pull : {items :{ _id : checkedItemId}}}, function (err, foundList) {
    if(!err) {
      res.redirect ("/" + listName);
  }

});
}
});

app.get("/about", function (req,res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function () {
  console.log("server on port successfully");
});
