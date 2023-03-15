// Google sheet npm package
const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');

// File handling package
const fs = require('fs');
const e = require('express');

const app = express();
app.use(express.json());

// spreadsheet key is the long id in the sheets URL
const RESPONSES_SHEET_ID = '1WZJHrp93wCTwsuGc1Cs5zy3LaQa1ZfwWVVxSZ3IqNDI';

// Create a new document
const doc = new GoogleSpreadsheet(RESPONSES_SHEET_ID);

// Credentials for the service account
const CREDENTIALS = JSON.parse(fs.readFileSync('sample.json'));


app.get("/view", async (req, res) => {

    try {
        
        // console.log("check email ---", req.body)
        // use service account creds
        await doc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });

        // load the documents info
        await doc.loadInfo();

        // Index of the sheet
        let sheet = doc.sheetsByIndex[0];
        console.log("check sheet----", sheet)

        // Get all the rows
        let rows = await sheet.getRows();
        console.log("check rows----", rows)
        var arrData = [];
        for (let index = 0; index < rows.length; index++) {
            // console.log("trigger for loop")
            const row = rows[index];
            console.log("row email", row)
            if (row.email == req.body.email) {
                // console.log("trigger for condition")
                // console.log("check for loop",row.user_name);
                // console.log("check for loop",row.password);
                arrData.push({"name": row.user_name, "password": row.password})
            }
        };
        res.send({"status":true, "message": "listed  successfully", "data": arrData});
    } catch (err) {
        console.log("catch err on view", err)
    }
});

app.post("/add", async (req,res)=>{

    try{
        
        let rows = [];
        var email = req.body.email;
        var user_name = req.body.user_name;
        var password = req.body.password;

        rows.push({"email": email, "user_name": user_name,"password":password})

        
        
        // use service account creds
        await doc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });

        // load the documents info
        await doc.loadInfo();

        // Index of the sheet
        let sheet = doc.sheetsByIndex[0];
        console.log("check sheet----", sheet)

        var arrData = [];
        for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        await sheet.addRow(row);
        arrData.push({row})
    }
    res.send({"status":true, "message": "added  successfully", "data": arrData});

    }catch(err){
        console.log("catch err on add", err)
    }
});

app.put("/update", async (req,res)=>{

    try{

        let newValue = [];
        var email = req.body.email;
        var user_name = req.body.user_name;
        var password = req.body.password;

        newValue.push({"user_name": user_name,"password":password})

        console.log("new value ==", newValue)


    // use service account creds
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    await doc.loadInfo();

    // Index of the sheet
    let sheet = doc.sheetsByIndex[0];

    let rows = await sheet.getRows();
    //console.log("rows -------->", rows)
   
    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
       
        console.log("extract data -------------> ", row.email)

        if(row.email == req.body.email){
            row.user_name = req.body.user_name;
            row.password = req.body.password;
            await row.save();
            break;
        }
      
    };
    res.send({"status":true, "message": "updated successfully"});
    
    }catch(err){
        console.log("catch update err", err)
    }
})

app.delete("/delete", async (req,res)=>{

    try{

        var keyValue = req.body;

            // use service account creds
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    await doc.loadInfo();

    // Index of the sheet
    let sheet = doc.sheetsByIndex[0];

    let rows = await sheet.getRows();

    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (row.email === req.body.email) {
            await rows[index].delete();
            break; 
        }
    };
    res.send({"status":true, "message": "deleted successfully"});

}catch(err){
        console.log("catch err on delete", err)
    }
})

app.listen('4002', () => {
    console.log("server is up on 4002")
})
