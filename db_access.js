const oracledb = require('oracledb');

const USER = 'dcit404';
const PASSWORD = '1234';
const CONNECTION_STRING = 'localhost/xepdb1';

const connectionConfig = { user: USER, password: PASSWORD, connectionString: CONNECTION_STRING };


async function manipulateDB({command, table, data}){
    let connection;
  try {
    connection = await oracledb.getConnection(connectionConfig);
    console.log("Successfully connected to Oracle Database");

    let columns = Object.keys(data);
    let values,i;
    let sql, result;


    switch (command) {
        case 'insert':
            values = Object.values(data).join(', ');
            // Insert data
            sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values});`;
            result = await connection.execute(sql);
            console.log(result);
            connection.commit();
            break;
        case 'delete':
            values = [];
            for(i=0; i<columns.length; i++){
                if(data[columns[i]]){
                    values.push(`(${columns[i]}=${data[columns[i]]})`)
                }
            }
            // Insert data
            sql = `DELETE FROM ${table} WHERE ${values.join(' AND ')};`;
            result = await connection.execute(sql);
            console.log(result);
            connection.commit();
            break;
        case 'update':
            values = [];
            for(i=0; i<columns.length; i++){
                if(data[columns[i]]){
                    values.push(`${columns[i]}=${data[columns[i]]}`)
                }
            }
            // Insert data
            sql = `UPDATE ${table} SET ${values.join(', ')} WHERE ${values.join(' OR ')};`;
            result = await connection.execute(sql);
            console.log(result);
            connection.commit();
            break;
        default:
            break;
    }
    
    console.log(sql);

  }catch (err){
        throw err;
  } finally {
    if (connection){
        try {
            await connection.close();
        } catch (err) {
            throw err;
        }
    }else{
        throw new Error('Error!')
    }
  }
    


}







module.exports = {manipulateDB}


