require("dotenv").config();
const { reject } = require("bcrypt/promises");
//const { reject } = require("bcrypt/promises");
const mysql = require("mysql");
let instance = null;
const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DATABASE,
  multipleStatements: true,
});

connection.connect((err) => {
  if (err) {
    console.log(err.message);
  }
  console.log("database is " + connection.state);
});

class DbServices {
  static getDbServiceInstance() {
    return instance ? instance : new DbServices();
  }
  async getAllHouses() {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = "SELECT * FROM houses";

        connection.query(query, (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      //  console.log(response);
      return response;
    } catch (error) {
      console.log(error);
    }
  }
  async ownersHouse(u_id) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `SELECT * FROM houses WHERE o_id = (SELECT id FROM house_owners WHERE u_id = '${u_id}')`;
        connection.query(query, (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }
  async oneHouse(id) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `SELECT * FROM houses WHERE id= ${id}`;
        connection.query(query, (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }
  async checkHouse(u_id, h_id) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `SELECT * FROM request_table WHERE renter_id = (SELECT id from renters WHERE u_id = '${u_id}' AND house_id = '${h_id}')`;
        connection.query(query, (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }
  async registerRenter(data) {
    console.log(data);
    const {
      user_name,
      pass_word,
      f_name,
      l_name,
      phone_num,
      email,
      num_of_family,
      job_type,
      address,
      marital_status,
      gender,
    } = data;
    try {
      const response = await new Promise((resolve, reject) => {
        const query = ` INSERT INTO users(user_name, pass_word, user_role) VALUES('${user_name}', '${pass_word}', 'renter'); INSERT INTO renters(f_name, l_name, phone_num, email, telegram, num_of_family, job_type, address, marital_status, gender, age, u_id) VALUES('${f_name}','${l_name}','${phone_num}','${email}','dachbi', '${num_of_family}', '${job_type}', '${address}','${marital_status}', '${gender}', '1', LAST_INSERT_ID())`;
        connection.query(query, (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }
  async registerOwner(data) {
    console.log(data);
    const { user_name, pass_word, f_name, l_name, phone_num, email, telegram } =
      data;
    try {
      const response = await new Promise((resolve, reject) => {
        const query = ` INSERT INTO users(user_name, pass_word, user_role) VALUES('${user_name}', '${pass_word}', 'owner'); INSERT INTO house_owners(f_name, l_name, phone_num, email, telegram, u_id) VALUES('${f_name}','${l_name}','${phone_num}','${email}','${telegram}', LAST_INSERT_ID())`;
        connection.query(query, (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }
  async postHouseToDB(house_detail) {
    const {
      house_type: h_type,
      kebele,
      city,
      rent_fee,
      number_of_rooms,
      image_src,
      o_id,
      area,
      catagory,
      sub_city,
      area_name,
    } = house_detail;
    try {
      //I can say response but i am expecting insert ID
      const response = await new Promise((resolve, reject) => {
        const query = `INSERT INTO houses(h_type, kebele, city, sub_city, area_name, catagory, area, rent_fee, number_of_rooms, image_src, h_status, o_id)VALUES('${h_type}','${kebele}','${city}','${sub_city}','${area_name}' ,'${catagory}','${area}','${rent_fee}','${number_of_rooms}','${image_src}', 'unrented', (SELECT id FROM house_owners WHERE u_id = '${o_id}'))`;
        connection.query(query, (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result);
        });
      });
      //  console.log(insertId);
      return response;
    } catch (err) {
      console.log(err);
    }
  }
  async searchHouse(parameter, value) {
    //console.log(parameter, value);

    try {
      const response = await new Promise((resolve, reject) => {
        const query =
          parameter == "rent_fee"
            ? `SELECT * FROM houses WHERE ${parameter} <= '${value}'`
            : `SELECT * FROM houses WHERE ${parameter} = '${value}'`;
        connection.query(query, (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result);
        });
      });
      //  console.log(insertId);
      return response;
    } catch (err) {
      console.log(err);
    }
  }
  async changePassword(id, newPassword) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `UPDATE users SET pass_word = '${newPassword}' WHERE id = '${id}' `;
        connection.query(query, (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result);
        });
      });
      //  console.log(insertId);
      return response;
    } catch (err) {
      console.log(err);
    }
  }
  async sendRequest(data) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `INSERT INTO request_table (renter_id, owner_id, house_id, req_date, req_status) VALUES(?,?,?,?,?)`;
        connection.query(
          query,
          [data.r_id, data.o_id, data.h_id, data.req_date, data.req_status],
          (err, result) => {
            if (err) reject(new Error(err.message));
            resolve(result);
          }
        );
      });

      return response;
    } catch (err) {
      console.log(err);
    }
  }
  async deleteRequest(house_id) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `DELETE FROM request_table WHERE house_id = (?)`;
        connection.query(query, [house_id], (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result);
        });
      });

      return response;
    } catch (err) {
      console.log(err);
    }
  }
  async insertNewName(name) {
    try {
      const dateAdded = new Date();

      //I can say response but i am expecting insert ID
      const insertId = await new Promise((resolve, reject) => {
        const query = "INSERT INTO names (name, date_added) VALUES (?, ?)";
        connection.query(query, [name, dateAdded], (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result.insertId);
        });
      });
      //  console.log(insertId);
      return insertId;
    } catch (err) {
      console.log(err);
    }
  }
  async findUser(user_name) {
    //WHERE 'test2.user_name' = '${user_name}'
    try {
      const response = new Promise((resolve, reject) => {
        const query = `SELECT * FROM users WHERE user_name = '${user_name}'`;
        connection.query(query, (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result);
        });
      });

      return response;
    } catch (error) {
      console.log(error);
    }
  }
  async delete(id) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = "DELETE FROM names WHERE id = ?";
        connection.query(query, [id], (err, result) => {
          if (err) {
            reject(new Error(err.message));
          }
          resolve(result.affectedRows);
        });
      });
      // console.log(response);
      console.log("1 row deleted");
      return response === 1 ? true : false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  //update handler
  async edit({ id, name }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `UPDATE names SET name = ? WHERE id = ?`;
        connection.query(query, [name, id], (err, result) => {
          if (err) {
            reject(new Error(err.message));
          }
          resolve(result.affectedRows);
        });
      });
      // console.log(result);
      console.log("1 row updated");
      return response === 1 ? true : false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

module.exports = DbServices;
