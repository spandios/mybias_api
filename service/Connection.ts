import {createConnection} from "typeorm";

const conn = async function () {
  const connection = await createConnection();
  return connection;
};

export default conn;
