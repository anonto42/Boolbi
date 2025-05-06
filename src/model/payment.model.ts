const paymentSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    orderId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    commission: Number,
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['success', 'pending', 'failed'], default: 'pending' }
  });
  