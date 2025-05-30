const mongoose = require("mongoose");

const AssignmentRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // başvuru tarihi
    applicationDate: {
      type: Date,
      default: Date.now,
    },

    // başvuru yapılan mahkeme
    currentCourthouse: {
      type: Number,
      required: true,
    },

    // başvuru yapılan mahkeme
    requestedCourthouse: {
      type: Number,
      required: true,
    },

    // başvuru sebebi
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

    

    // başvuru onaylandığında
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    

    // başvuru reddedildiğinde
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },

    // belgeler için referans
    documents: [
      {
        type: String, // belgeleri bir model ile referans olarak tutabilirdim ancak bu proje için kapsamı fazla olacağından dolayı tercih etmedim
        // String olarak tutmak her ne kadar meta bilgisi ve daha bir çok sorunu beraberinde getirse de, bu proje için yeterli ve hızlı olacaktır
      },
    ],


    // başvuru numarası
    // başvuru numarası, başvuru yapıldığında otomatik olarak oluşturulacak
    applicationNumber: {
      type: String,
      unique: true,
      required: true,
      default: function () {
        return `AB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      },
    },

  },
  {
    timestamps: true,
  }
);

// başvuru numarasını oluştururken, başvuru tarihi ve rastgele bir sayı ekleyerek benzersiz hale getiriyoruz
AssignmentRequestSchema.pre("save", function (next) {
  if (!this.applicationNumber) {
    this.applicationNumber = `AB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

// Başvuru numarasını güncellerken de aynı şekilde benzersiz hale getiriyoruz
AssignmentRequestSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.applicationNumber) {
    update.applicationNumber = `AB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

module.exports = mongoose.model("AssignmentRequest", AssignmentRequestSchema);
