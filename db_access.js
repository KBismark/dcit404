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
            values = Object.values(data).map((v)=>JSON.stringify(`'${v}'`)).join(', ');
            // Insert row
            sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values});`;
            console.log(sql);
            result = await connection.execute(sql);
            console.log(result);
            connection.commit();
            break;
        case 'delete':
            values = [];
            for(i=0; i<columns.length; i++){
                if(data[columns[i]]){
                    values.push(`(${columns[i]}=${JSON.stringify(`'${data[columns[i]]}'`)})`)
                }
            }
            // Delete row
            sql = `DELETE FROM ${table} WHERE ${values.join(' AND ')};`;
            console.log(sql);
            result = await connection.execute(sql);
            console.log(result);
            connection.commit();
            break;
        case 'update':
            values = [];
            for(i=0; i<columns.length; i++){
                if(data[columns[i]]){
                    values.push(`${columns[i]}=${JSON.stringify(`'${data[columns[i]]}'`)}`)
                }
            }
            // Update row
            sql = `UPDATE ${table} SET ${values.join(', ')} WHERE ${values.join(' OR ')};`;
            console.log(sql);
            result = await connection.execute(sql);
            console.log(result);
            connection.commit();
            break;
        case 'retrieve':
            sql = `SELECT * FROM course;`;
            result = [
                await connection.execute(`SELECT * FROM course;`), 
                await connection.execute(`SELECT * FROM delegate;`), 
            ];
            console.log(result);
            break;
        default:
            throw new Error('Error');
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


