const messageSchema = new mongoose.Schema({
    orderId: mongoose.Schema.Types.ObjectId,
    from: mongoose.Schema.Types.ObjectId,
    to: mongoose.Schema.Types.ObjectId,
    type: { type: String, enum: ['text', 'image'] },
    content: String,
    timestamp: { type: Date, default: Date.now }
  });
  