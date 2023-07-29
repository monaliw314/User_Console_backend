const express = require('express');
const {MongoClient} = require('mongodb');
const  ObjectID = require('mongodb').ObjectId;
const cors = require('cors')
const app = express();
const url = 'mongodb://0.0.0.0:27017/';
const client = new MongoClient(url);
const database = 'zenkins';
const db = client.db(database);


app.use(cors()); //middleware to handle cors error
app.use(express.json());

app.get('/users',async (req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = 8; 
        const skip = (page - 1) * limit;
        const totalCount = await db.collection('users').countDocuments({});
        let data = await db.collection('users').find({}).skip(skip).limit(limit).toArray();
        res.json({
            data,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalItems: totalCount,
        })
    }catch(e){
        console.error('Error retrieving data:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// api to get user by id
app.get('/users/:id',async (req,res)=>{
    const id = req.params.id; 
    try{
        let data = await db.collection('users').find({_id : new ObjectID(id)}).toArray();
        res.json(data);
    }catch(e){
        console.error('Error retrieving data:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//api to update user in users collection
app.put('/users/:id',async (req,res) =>{
   const id = req.params.id;
   const updateData = req.body;
   try{
        const result = await db.collection('users').updateOne(
            { _id : new ObjectID(id) },
            { $set : updateData },
            { upsert: false }
        );
        console.log(result);
        if(result.matchedCount>0){
            res.status(200).json({ message: 'Data updated successfully.' });
        }else{
            res.status(404).json({ message: 'Data not found.' });
        }
   }catch(e){
    res.status(500).json({message:"Server Error"});
   } 
});

//api to post user in users collection
app.post('/users', async (req,res) =>{
    try{
        const newUser = req.body;
        delete newUser._id;
        const result = await db.collection('users').insertOne(newUser);
        res.status(201).json({message :'Data added successfully'});
    }catch(e){
        console.error('Error adding data:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//api to delete user from users collection
app.delete('/users/:id',async(req,res)=>{
    const id = req.params.id;
    try {
        const result= await db.collection('users').deleteOne( { _id : new ObjectID(id) } );
        console.log(result);
        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Data deleted successfully.' });
          } else {
            res.status(404).json({ message: 'data not found.' });
          }
     } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'An error occurred while processing your request.' });
     }
})
  

// Search users based on first_name
app.get('/search/user', async (req, res) => {
    const first_name  = req.query.first_name;
    try {
        let regex = new RegExp(first_name,'i');
        const users = await db.collection('users').find({ first_name: regex }).toArray();
        console.log(users)
        res.status(200).json({data:users});
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while searching for users.' });
    }
  });
  
app.listen(8000,()=>{
    console.log("Server is running on 8000 port");
})