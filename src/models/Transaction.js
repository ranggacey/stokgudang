import mongoose from 'mongoose';

// Jejak audit setiap pergerakan stok. Immutable: tidak boleh diedit/dihapus
// lewat aplikasi agar perhitungan stok selalu bisa dilacak.
const TransactionSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    itemName: { type: String, required: true },
    itemSku: { type: String, required: true },
    type: { type: String, enum: ['in', 'out', 'adjust'], required: true },
    qty: { type: Number, required: true, min: 1 },
    stockBefore: { type: Number, required: true, min: 0 },
    stockAfter: { type: Number, required: true, min: 0 },
    note: { type: String, trim: true, default: '' },
    createdBy: { type: String, default: 'admin' },
  },
  { timestamps: true }
);

TransactionSchema.index({ item: 1, createdAt: -1 });
TransactionSchema.index({ createdAt: -1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
