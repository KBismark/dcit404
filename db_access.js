const oracledb = require('oracledb');
const fs = require('fs/promises');
const path = require('path');

const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const CONNECTION_STRING = process.env.CONNECTION_STRING;

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
            result = await connection.execute(`
            BEGIN
            ${sql}
            END;
            `);
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
            result = await connection.execute(`
            BEGIN
            ${sql}
            END;
            `);
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
            result = await connection.execute(`
            BEGIN
            ${sql}
            END;
            `);
            console.log(result);
            connection.commit();
            break;
        case 'retrieve':
            result = [
                await connection.execute(`
                BEGIN
                SELECT * FROM course;
                END;
                `), 
                await connection.execute(`
                BEGIN
                SELECT * FROM delegate;
                END;
                `) 
            ];
            console.log(result);
            break;
        default:
            throw new Error('Error');
            break;
    }
    
    console.log(sql);

  }catch (err){
    console.log(err);
    return await fallBack({command, table, data})
        // throw err;
  } finally {
    if (connection){
        try {
            await connection.close();
        } catch (err) {
            console.log(err);
            // return await fallBack({command, table, data})
            // throw err;
        }
    }
  }
    


}



const sample_db_path = path.join(__dirname, '/sample_table.json');
async function fallBack({command, table, data}){
    console.log('Falling back on file database....');
  try {
    
    let columns = Object.keys(data);
    let values,i;
    let result;
    let table_data, table_column, table_row;
    let found = false;


    switch (command) {
        case 'insert':
            result = await fs.readFile(sample_db_path,'utf8');
            result = JSON.parse(result);
            result[table].push(data);
            await fs.writeFile(sample_db_path, JSON.stringify(result, undefined, 2))
            break;
        case 'delete':
            result = await fs.readFile(sample_db_path,'utf8');
            result = JSON.parse(result);
            table_data = result[table];
            
            for(i=0; i<table_data.length; i++){
                table_row = table_data[i];
                found = true;
                // Delete if only all queries were matched
                for(table_column in data){
                    if(table_row[table_column]!==data[table_column]){
                        found = false;
                        break;
                    }
                }
                
                if(!found){
                    result[table] = table_data = [...table_data.slice(0, i),...table_data.slice(i+1)]
                    break;
                }
            }
            await fs.writeFile(sample_db_path, JSON.stringify(result, undefined, 2));
            break;
        case 'update':
            values = {};
            for(i=0; i<columns.length; i++){
                if(data[columns[i]]){
                    values[columns[i]] = data[columns[i]];
                }
            }

            result = await fs.readFile(sample_db_path,'utf8');
            result = JSON.parse(result);
            table_data = result[table];
            
            for(i=0; i<table_data.length; i++){
                table_row = table_data[i];
                 // Update if at least a query matched
                for(table_column in table_row){
                    if(table_row[table_column]===values[table_column]){
                        found = true;
                        break;
                    }
                }
               
                if(found){
                    result[table] = table_data = [...table_data.slice(0, i), {...table_row, ...values} ,...table_data.slice(i+1)]
                    break;
                }
            }
            await fs.writeFile(sample_db_path, JSON.stringify(result, undefined, 2));
            break;
        case 'retrieve':
            result = await fs.readFile(sample_db_path,'utf8');
            result = JSON.parse(result);
            console.log(result);
            return result;
        default:
            throw new Error('Error');
            break;
    }


  }catch (err){
        throw err;
  } 
    


}



module.exports = {manipulateDB}


