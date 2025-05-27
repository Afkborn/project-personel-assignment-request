const getTimeForLog = require("../common/time");
const User = require("../model/User");
const toSHA256 = require("../common/hashing");
require("dotenv").config();

const createAdminUser = () => {
  const adminUser = {
    registrationNumber: process.env.DEFAULT_ADMIN_REGISTRATION_NUMBER,
    name: "Yönetici",
    surname: "Kullanıcı",
    password: toSHA256(process.env.DEFAULT_ADMIN_PASSWORD), 
    roles: [
      "admin", 
    ],
  };

  // eğer veritabanı boşsa admin kullanıcısını oluştur
  User.countDocuments({})
    .then((count) => {
      if (count === 0) {
        // Eğer veritabanında hiç kullanıcı yoksa admin kullanıcısını oluştur
        User.create(adminUser)
          .then(() => {
            console.log(getTimeForLog() + "Admin user created successfully.");
          })
          .catch((error) => {
            console.error(
              getTimeForLog() + "Error creating admin user:",
              error
            );
          });
      } else {
        console.log(getTimeForLog() + "Admin user already exists.");
      }
    })
    .catch((error) => {
      console.error(getTimeForLog() + "Error checking user count:", error);
    });
};

module.exports = {
  createAdminUser
};
