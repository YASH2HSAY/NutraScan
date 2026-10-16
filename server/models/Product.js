const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    barcode: { type: String, required: true, unique: true },
    name: { type: String, default: 'Unknown Product' },
    brand: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    ingredientsText: { type: String, default: '' },

    nutrition: {
    energyKcal:   { type: Number, default: null },
    sugars:       { type: Number, default: null },
    saturatedFat: { type: Number, default: null },
    salt:         { type: Number, default: null },
    fiber:        { type: Number, default: null },
    proteins:     { type: Number, default: null },
  },

    allergens: [String],   
    additives: [String],   
    labels:    [String], 

    nutriScore: { type: String, default: null },   
    nova:       { type: Number, default: null },

    source: { type: String, default: 'openfoodfacts' }, 
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);