const mongoose = require("mongoose");

const AssignmentRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentCourthouse: {
      type: Number,
      required: true,
    },
    requestedCourthouse: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["preparing","pending", "approved", "rejected"],
      default: "preparing",
      // preparing: Başvuru hazırlanıyor
      // pending: Başvuru beklemede
      // approved: Başvuru onaylandı
      // rejected: Başvuru reddedildi
    },

    rejectionReason: {
      type: String,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },


  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AssignmentRequest", AssignmentRequestSchema);
