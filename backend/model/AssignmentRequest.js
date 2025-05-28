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
    type: {
      type: String,
      enum: [
        "optional",
        "educational",
        "health",
        "family",
        "life safety",
        "other",
      ],
      default: "optional",
      // optional: İsteğe bağlı
      // educational: Eğitim
      // health: Sağlık
      // family: Aile
      // life safety: Hayati tehlike
      // other: Diğer
    },
    status: {
      type: String,
      enum: ["preparing", "pending", "approved", "rejected"],
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

    // belge ekleme, talep tipi eklenebilir.
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AssignmentRequest", AssignmentRequestSchema);
