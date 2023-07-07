const mongoose = require('mongoose');

// 1. 토큰
// 2. id
const refreshSchema = new mongoose.Schema(
  {
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model('Refresh', refreshSchema);
