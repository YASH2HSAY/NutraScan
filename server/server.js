require('dotenv').config();
const connectDB = require('./config/db');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const Product = require('./models/Product');
const normalizeProduct = require('./services/normalizeProduct');

app.get('/',(req,res)=> {
    res.json({message: 'Scanwise API is running'});
});

app.get('/api/product/:barcode', async (req,res)=> {
    const {barcode} = req.params;

    if(!/^\d{8,14}$/.test(barcode)) {
        return res.status(400).json({error: 'Invalid barcode. Use 8 to 14 digits.'});
    }
    try {
        const cached = await Product.findOne({barcode});
        if (cached) {
            return res.json({source: 'cache', product: cached});
        }
        const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Scanwise/1.0 (Nutrascan)' },
            Signal: AbortSignal.timeout(8000),
        });
        const data = await response.json();
        if(data.status !==1) {
            return res.status(404).json({error: 'Product not found'});
        }
        const product =await Product.create(normalizeProduct(data.product, barcode));
        res.json({source: 'openfoodfacts', product});
    } catch (error) {
        console.error('Open Food Facts error:', error.message, '| cause:', error.cause);
        res.status(502).json({error: 'Could not reach Open Food Facts'});
    }
});
connectDB();
app.listen(PORT, ()=> {
    console.log(`Server is running on http://localhost:${PORT}`);
});