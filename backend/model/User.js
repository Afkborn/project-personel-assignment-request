const mongoose = require("mongoose");
const Messages = require("../constants/Messages");

const UserSchema = mongoose.Schema(
  {
    
    registrationNumber: {
      type: Number,
      required: [true, Messages.REGISTRATION_NUMBER_REQUIRED],
      unique: [true, Messages.REGISTRATION_NUMBER_EXIST],
    },
    name: {
      type: String,
      required: [true, Messages.NAME_REQUIRED],
    },
    surname: {
      type: String,
      required: [true, Messages.SURNAME_REQUIRED],
    },
    password: {
      type: String,
      required: [true, Messages.PASSWORD_REQUIRED],
    },
    roles: {
      type: [String],
      required: [true, Messages.ROLE_REQUIRED],
      default: ["user"],
      validate: {
        validator: function (roles) {
          return roles.length > 0;
        },
        message: "En az bir rol gereklidir",
      },
      // enum kullanımına gerek duymadım, çünkü roller bir constant dosyasında tanımlı.
      
    },

    email: {
      type: String,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: (props) => `${props.value} geçerli bir e-posta adresi değil!`,
      },
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: (props) =>
          `${props.value} geçerli bir telefon numarası değil!`,
      },
    },
    tckn: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\d{11}$/.test(v);
        },
        message: (props) => Messages.VALID_TCKN(props.value),
      },
    },
    isMartyrRelative: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    birthDate: {
      type: Date,
    },
    birthPlace: {
      type: String,
    },
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-", ""],
      default: "",
    },
    keyboardType: {
      type: String,
      enum: ["F", "Q", ""],
      default: "",
    },

    careerStartDate: {
      type: Date,
    },
    courtId: {
      type: Number,
      default: 0,
    },
    unitName: {
      type: String,
      default: "Bilinmiyor",
    },
    unitStartDate: {
      type: Date,
    },

    avatar: {
      type: String,
      // default: "https://i.pravatar.cc/300",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
