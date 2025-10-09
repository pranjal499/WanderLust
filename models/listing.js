// Rquire essentials:
const { required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Definint schema:
const listignSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        url: {
            type: String,
            default: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            
            set: (v) => v === "" ? "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v
        }
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        require: true
    },
    country: {
        type: String,
        required: true
    },
    review: {
        type: Schema.Types.ObjectId,
        ref: "Review"
    }
});

const Listing = mongoose.model('Listing', listignSchema);
module.exports = Listing;