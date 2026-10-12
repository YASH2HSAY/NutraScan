require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/',(req,res)=> {
    res.json({message: 'Scanwise API is running'});
});

app.get('/api/product/:barcode', async (req,res)=> {
    const {barcode} = req.params;

    if(!/^\d{8,14}$/.test(barcode)) {
        return res.status(400).json({error: 'Invalid barcode. Use 8 to 14 digits.'});
    }
    try {
        const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Scanwise/1.0 (Nutrascan)' }
        });
        const data = await response.json();
        if(data.status !==1) {
            return res.status(404).json({error: 'Product not found'});
        }
        res.json(data.product);
    } catch (error) {
        console.error('Open Food Facts error:', error.message, '| cause:', error.cause);
        res.status(502).json({error: 'Could not reach Open Food Facts'});
    }
});
app.listen(PORT, ()=> {
    console.log(`Server is running on http://localhost:${PORT}`);
});