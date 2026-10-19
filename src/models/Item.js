import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    category: { type: String, required: true, trim: true },
    unit: { type: String, required: true, trim: true, default: 'pcs' },
    location: { type: String, trim: true, default: '' },
    stock: { type: Number, required: true, default: 0, min: 0 },
    minStock: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

ItemSchema.index({ name: 'text', sku: 'text' });

export default mongoose.models.Item || mongoose.model('Item', ItemSchema);
