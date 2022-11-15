const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const md5 = require('md5');
const axios = require('axios');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'ai2949',
    database: 'smd',
    port: '5432'
}); 
const mqtt = require('mqtt');

const MQTT_SERVER = "localhost";
const MQTT_PORT = "1883";
const MQTT_USER = "guest"; 
const MQTT_PASSWORD = "guest";
const client = mqtt.connect({
    host: MQTT_SERVER,
    port: MQTT_PORT,
    username: MQTT_USER,
    password: MQTT_PASSWORD
});




client.on('connect', function () {
    // Subscribe any topic
    console.log("MQTT Connect");
    client.subscribe('test', function (err) {
        if (err) {
            console.log(err);
        }
    });
});



const port = process.env.PORT || 3030;
const app = express();
app.use(cors({origin: '*'}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const server = app.listen(port,() => {
    console.log('Serve Start in 3030');
});

const fn_push_kkh = async (req , res ) =>{
    const {host,state0,state1,state2,state3,state4,state5,state6,state7,state8,state9} = req.body;
    const today = new Date();
    const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' '+today.getHours()+':'+today.getMinutes()+':'+today.getSeconds(); 
   let sql = "UPDATE tb_transaction_state_smd SET state0 =$1,state1 =$2,state2 =$3,state3 =$4,state4 =$5,state5 =$6,state6 =$7,state7 =$8,state8 =$9,state9 =$10 WHERE host_location =$11";
    await pool.query(sql, [state0,state1,state2,state3,state4,state5,state6,state7,state8,state9,host],(err, result)=> {
      if (err){
        console.log('Error ! 👎');
        res.json({
          message:'Error',
          status:500
            })
      }else{
      console.log("update tb_transaction_state_smd 👍"+date);
      res.json({
      message: 'Success',
      status:200,
        body: {
         host_location:host,
         state0:state0,
         state1:state1,
         state2:state2,
         state3:state3,
         state4:state4,
         state5:state5,
         state6:state6,
         state7:state7,
         state8:state8,
         state9:state9,
      }
        })
      }
    });

  
  }
  const signup =async (req,res) =>{
    const  {username,password,host_location,email,phone} = req.body;
    const md5encap_password = md5(password);
    let sql = "INSERT INTO tb_user_acc (username,password,host_location,email,phone)VALUES($1,$2,$3,$4,$5)";
    await pool.query(sql, [username,md5encap_password,host_location,email,phone],(err, result)=> {
      if (err){
        console.log('Error ! 👎');
        res.json({
          message:'Error',
          status:500
            })
      }else{
      console.log("insert tb_user_acc ");
      res.json({
      message: 'Success',
      status:200
        })
      }
    });

  }

  const signin =async (req,res) =>{
    const  {username,password} = req.body;
    const md5encap_password = md5(password);
    let sql = "SELECT * FROM tb_user_acc WHERE username = $1 AND password = $2 ORDER BY u_id DESC LIMIT 1";
    await pool.query(sql, [username,md5encap_password],(err, result)=> {
      if (result.rows && result.rows.length > 0){
         console.log("select tb_user_acc ");
      res.json({
      message: 'Success',
      status:200,
      body:result.rows
        })
      }else{
    

 console.log('Error ! 👎');
        res.json({
          message:'Error',
          status:500
            })

      }
    });

  }

  const add_host_location =async (req,res) =>{
    const  {host_location,host_description} = req.body;
    let sql = "INSERT INTO tb_host_location (host_location,host_description)VALUES($1,$2)";
    await pool.query(sql, [host_location,host_description],(err, result)=> {
      if (err){
        console.log('Error ! 👎');
        res.json({
          message:'Error',
          status:500
            })
      }else{
      console.log("insert tb_host_location 👍");
      res.json({
      message: 'Success',
      status:200
        })
      }
    });

  }

  const host_location =async (req,res) =>{
 
    let sql = "SELECT * FROM tb_host_location ";
    await pool.query(sql,(err, result)=> {
      if (err){
        console.log('Error ! 👎');
        res.json({
          message:'Error',
          status:500
            })
      }else{
      console.log("select tb_host_location 👍");
      res.json({
      message: 'Success',
      status:200,
      body:result.rows
        })
      }
    });

  }

  const cmd_command =async (req,res) =>{
    const {topic,node_id}=req.body;
        console.log(topic);
        console.log(node_id);
        let sql = "UPDATE tb_nodesmd_kkh SET top = $1 WHERE node_id =$2";
        await pool.query(sql, [topic,node_id], (err, result) => {
            if (err) {
                console.log('Error ! 👎');
                res.json({
                    message: 'Error',
                    status: 500
                })
            } else {
                console.log("UPDATE cmd tb_nodesmd_kkh 👍");
                res.json({
                    message: 'Success',
                    status: 200
                })
            }
        });
  }

  const cmd_msg_command =async (req,res) =>{
    const {topic,cmd,msg,node_id}=req.body;

        let sql = "UPDATE tb_nodesmd_kkh SET cmd =$1, msg = $2, top = $3, state = '1' WHERE node_id =$4";
        await pool.query(sql, [cmd,msg,topic,node_id], (err, result) => {
            if (err) {
                console.log('Error ! 👎');
                res.json({
                    message: 'Error',
                    status: 500
                })
            } else {
                console.log("UPDATE cmd tb_nodesmd_kkh 👍");
                res.json({
                    message: 'Success',
                    status: 200
                })
            }
        });
  }


    const add_nodesmd = async (req, res) => {
      const { node_id, address,datetime } = req.body;
      let sql = "INSERT INTO tb_nodesmd_kkh (node_id,address,datetime)VALUES($1,$2,$3)";
      await pool.query(sql, [node_id, address, datetime], (err, result) => {
          if (err) {
              console.log('Error ! 👎');
              res.json({
                  message: 'Error',
                  status: 500
              })
          } else {
              console.log("insert tb_nodesmd_kkh 👍");
              res.json({
                  message: 'Success',
                  status: 200
              })
          }
      });
  
  }
  const nodesmd = async (req, res) => {

    let sql = "SELECT * FROM tb_nodesmd_kkh ";
    await pool.query(sql, (err, result) => {
        if (err) {
            console.log('Error ! 👎');
            res.json({
                message: 'Error',
                status: 500
            })
        } else {
            console.log("select tb_nodesmd_kkh 👍");
            res.json({
                message: 'Success',
                status: 200,
                body: result.rows
            })
        }
    });

}
const fn_push_kkh_nodesmd = async (req, res) => {
  const { F9, F6,F1, F2,F17,F16,F15,F14,F13,F12,F11,F10,E5,E4,E3,E2,E1,E0,D6,D5,D4,D3,D2,D1,D0,C5,C4,C3,C2,C1,C0,B6,B5,B4,B3,B2,B1,B0,A5,A4,A3,A2,A1,A0 } = req.body;
  console.log(F9);
  console.log(F6);
  let sqlF9 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'F9'";
  let sqlF6 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'F6'";
  let sqlF1 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'F1'";
  let sqlF2 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'F2'";
  let sqlF17 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'F17'";
  let sqlF16 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'F16'";
  let sqlF15 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'F15'";
  let sqlF14 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'F14'";
  let sqlF13 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'F13'";
  let sqlF12 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'F12'";
  let sqlF11 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'F11'";
  let sqlF10 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'F10'";
  let sqlE5 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'E5'";
  let sqlE4 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'E4'";
  let sqlE3 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'E3'";
  let sqlE2 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'E2'";
  let sqlE1 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'E1'";
  let sqlE0 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'E0'";
  let sqlD6 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'D6'";
  let sqlD5 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'D5'";
  let sqlD4 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'D4'";
  let sqlD3 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'D3'";
  let sqlD2 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'D2'";
  let sqlD1 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'D1'";
  let sqlD0 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'D0'";
  let sqlC5 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'C5'";
  let sqlC4 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'C4'";
  let sqlC3 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'C3'";
  let sqlC2 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'C2'";
  let sqlC1 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'C1'";
  let sqlC0 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'C0'";
  let sqlB6 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'B6'";
  let sqlB5 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'B5'";
  let sqlB4 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'B4'";
  let sqlB3 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'B3'";
  let sqlB2 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'B2'";
  let sqlB1 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'B1'";
  let sqlB0 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'B0'";
  let sqlA5 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'A5'";
  let sqlA4 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'A4'";
  let sqlA3 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'A3'";
  let sqlA2 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'A2'";
  let sqlA1 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'A1'";
  let sqlA0 = "UPDATE tb_nodesmd_kkh SET datetime =$1 WHERE node_id = 'A0'";


  await pool.query(sqlF9, [F9]);
  await pool.query(sqlF6, [F6]);
    await pool.query(sqlF1, [F1]);
  await pool.query(sqlF2, [F2]);
  await pool.query(sqlF17, [F17]);
  await pool.query(sqlF16, [F16]);
  await pool.query(sqlF15, [F15]);
  await pool.query(sqlF14, [F14]);
  await pool.query(sqlF13, [F13]);
  await pool.query(sqlF12, [F12]);
  await pool.query(sqlF11, [F11]);
  await pool.query(sqlF10, [F10]);
  await pool.query(sqlE5, [E5]);
  await pool.query(sqlE4, [E4]);
  await pool.query(sqlE3, [E3]);
  await pool.query(sqlE2, [E2]);
  await pool.query(sqlE1, [E1]);
  await pool.query(sqlE0, [E0]);
  await pool.query(sqlD6, [D6]);
  await pool.query(sqlD5, [D5]);
  await pool.query(sqlD4, [D4]);
  await pool.query(sqlD3, [D3]);
  await pool.query(sqlD2, [D2]);
  await pool.query(sqlD1, [D1]);
  await pool.query(sqlD0, [D0]);
  await pool.query(sqlC5, [C5]);
  await pool.query(sqlC4, [C4]);
  await pool.query(sqlC3, [C3]);
  await pool.query(sqlC2, [C2]);
  await pool.query(sqlC1, [C1]);
  await pool.query(sqlC0, [C0]);
  await pool.query(sqlB6, [B6]);
  await pool.query(sqlB5, [B5]);
  await pool.query(sqlB4, [B4]);
  await pool.query(sqlB3, [B3]);
  await pool.query(sqlB2, [B2]);
  await pool.query(sqlB1, [B1]);
  await pool.query(sqlB0, [B0]);
  await pool.query(sqlA5, [A5]);
  await pool.query(sqlA4, [A4]);
  await pool.query(sqlA3, [A3]);
  await pool.query(sqlA2, [A2]);
  await pool.query(sqlA1, [A1]);
  await pool.query(sqlA0, [A0]);

          res.json({
              message: 'update smd_node',
              status: 200
          })
}

const cmd = async (req, res) => {
  let sql = "SELECT * FROM tb_nodesmd_kkh WHERE top IS NOT NULL ORDER BY node_id DESC LIMIT 1";
  await pool.query(sql, (err, result) => {
      if (result.rows ||result.rows.length > 0) {
          console.log("select cmd tb_nodesmd_kkh  👍");
          res.json({
              message: 'Success',
              status: 200,
              body: result.rows
          })
      } else {
           console.log('Error select cmd tb_nodesmd_kkh ! 👎');
              res.json({
              message: 'Error',
              status: 500
          })

      }
  });
}


const cmd_command_reset = async (req, res) => {
  const { topic } = req.body;
  console.log(topic);
  let sql = "UPDATE tb_nodesmd_kkh SET cmd = null, msg = null, top = null,state = null WHERE node_id =$1";
  await pool.query(sql, [topic], (err, result) => {
      if (err) {
          console.log('Error ! 👎');
          res.json({
              message: 'Error',
              status: 500
          })
      } else {
          console.log("UPDATE tb_nodesmd_kkh reset 👍");
          res.json({
              message: 'Success',
              status: 200
          })
      }
  });
}

app.post('/cmd_command_reset', cmd_command_reset);


  app.get('/cmd',cmd);
  app.post('/cmd_command',cmd_command);
  app.post('/cmd_msg_command',cmd_msg_command);


  app.post('/api/add_nodesmd', add_nodesmd);


  app.post('/api/signup',signup);
  app.post('/api/signin',signin);
  app.post('/api/add_host_location',add_host_location);
  app.get('/api/host_location',host_location);
  app.get('/api/nodesmd', nodesmd);

  app.post('/fn_push_kkh',fn_push_kkh);
  app.post('/fn_push_kkh_nodesmd', fn_push_kkh_nodesmd);
