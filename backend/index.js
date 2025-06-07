const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const app = express();

const {clerkClient} = require('@clerk/express');

app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    const {data, totalCount} = await clerkClient.users.getUserList();
    
    res.json({data, total: totalCount});
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running`);
});
