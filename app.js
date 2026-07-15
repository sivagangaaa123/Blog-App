const Express = require("express")
const Mongoose = require("mongoose")
const Bcrypt = require("bcrypt")
const Cors = require("cors")
const jwt = require("jsonwebtoken")
const userModel = require("./models/users")
const postModel = require("./models/posts")

let app = Express()

app.use(Express.json())
app.use(Cors())

Mongoose.connect("mongodb://aswathy:ashexhere22@ac-d01d9ty-shard-00-00.36nhatr.mongodb.net:27017,ac-d01d9ty-shard-00-01.36nhatr.mongodb.net:27017,ac-d01d9ty-shard-00-02.36nhatr.mongodb.net:27017/blogdb?ssl=true&replicaSet=atlas-sg5pws-shard-0&authSource=admin&appName=Cluster0")


// CREATE A POST API - AFTER LOGIN
app.post("/create-post", async (req,res)=>{
    let input =req.body
    //token validation by passing it through body or header
    //standard format - input : through body, token : through header

    let token = req.headers.token
    jwt.verify(token, "blogApp", async (error, decoded)=>{
        if (decoded && decoded.email) {
            
            let result = new postModel(input)
            await result.save()
            res.json({"status":"success"})

        } else {
            res.json({"status":"Invalid Authentication"}) //if token is not correct 
        }

    }) // verify token
})
//api + input != data insertion
//api + correct input + token = data insertion & storing , token is only give to the user after login - for authentication & security of data



// VIEW ALL POST API - no input, token is the only input
app.post("/view-all-post", (req,res)=>{
    let token = req.headers.token //token inside headers - token is the only input here - only authenticated users can access all posts
    jwt.verify(token, "blogApp", (error,decoded)=>{
        if (decoded && decoded.email) {

            postModel.find().then(
                (items)=>{
                    res.json(items)
                }
            ).catch(
                (eeror)=>{
                    res.json({"status":"error"})
                }
            )
            
        } else {
            res.json({"status":"Invalid Authentication"})
        }
    })
    
})



//VIEW MY POST API - input : userId + token
app.post("/view-my-post", (req,res)=>{
    let input = req.body
    let token = req.headers.token 
    jwt.verify(token, "blogApp", (error,decoded)=>{
        if (decoded && decoded.email) {

            postModel.find(input).then(
                (items)=>{
                    res.json(items)
                }
            ).catch(
                (error)=>{
                    res.json({"status":error})
                }
            )
            
        } else {
            res.json({"status":"Invalid Authentication"})
        }
    })
    
})




// USER SIGN IN API
app.post("/sign-in" ,async (req,res)=>{ //read 2 inputs - email and password , if signin get true then generate tokens as well

    let input =req.body
    //read email and pas
    let result = userModel.find({email:req.body.email}).then(
        (items)=>{
            if (items.length>0) {

                const passwordValidator = Bcrypt.compareSync(req.body.password, items[0].password)  //password comparison : req.body.password - inputed password  & items[0].password - password stored in the db, true - correct pass & false - invalid pass

                //token generation - to secure 1 API from other API's
                if (passwordValidator) {
                    jwt.sign({email:req.body.email}, "blogApp", {expiresIn: "1d"}, 
                    (error, token)=>{
                        if (error) {
                            res.json({"status":"error", "errorMessage":error})
                        } else {
                            res.json({"status":"success", "token":token, "userId":items[0]._id})
                        }
                    })
                    
                } else {
                    res.json({"status":"Incorrect Password"})
                }
                
            } else {
                res.json({"status":"Invalid Email Id"}) 
            }
        }
    ).catch()

})




// USER SIGN UP API
app.post("/sign-up", async (req,res)=>{
    // input
    let input = req.body
    //password encryption
    let hashedPassword = Bcrypt.hashSync(req.body.password,10)
    console.log(hashedPassword)
    req.body.password = hashedPassword
    userModel.find({email:req.body.email}).then(
        (items)=>{
            //to check whether the entered email is alredy in the db or not - search result comes inside the "items" which return an array

            // console.log(items)
            if (items.length>0) { //if "check" s length>0 ? then mail id already exists
                res.json({"status":"emailId already exists"})
            } else {
                let result = new userModel(input) //passed the data to userModel if the email id didnt exists
                result.save() //store data - async-await() - mongodb colud or any n/w application storing issues will be done in the bg -safety method -asynchronous fn
                res.json({"status":"success"}) //1 api - 1 res
            }
        }
    ).catch(
        (error)=>{

        }
    )

    })

app.listen(3001, ()=>{
    console.log("Server Started")
})
