// models\brands.js
import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
    user_email: {
        type: String,
        required: true
    },
    brand_url: {
        type: String,
        required: true
    },
    brand_name: {
        type: String,
        required: true
    },
    name_variants: [{
        type: String
    }],
    description: {
        type: String,
        required: true
    },
    prompts: [{
        type: String
    }],
    brand_count: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

export default mongoose.models.Brand || mongoose.model('Brand', brandSchema);