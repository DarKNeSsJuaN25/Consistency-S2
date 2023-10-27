const express = require('express');
const {Client} = require('pg');
const app = express();
const PORT = 8000;

const dbdata = {
    user : "postgres",
    password : "Softjuandius_25",
    port : 5432,
    database : "postgres",
    host : "127.0.0.1"
}

const client = new Client(dbdata);

client.connect();
async function buy(req, res) {
    try {
        await client.query('BEGIN');

        const item = req.query.id;
        const cantidad = req.query.cantidad;

        const { rows } = await client.query('SELECT cantidad FROM buyers WHERE id = $1 FOR UPDATE', [item]);
        const currentQuantity = rows[0].cantidad;

        if (currentQuantity >= cantidad && currentQuantity > 0) {
            const newcantidad = currentQuantity - cantidad;
            await client.query('UPDATE buyers SET cantidad = $1 WHERE id = $2', [newcantidad, item]);
            console.log("Comprado!", new Date().toLocaleString());
        } else if (currentQuantity === 0) {
            console.log(`No hay suficientes artículos disponibles para comprar`, new Date().toLocaleString());
            res.status(400).send("No hay suficientes artículos disponibles para comprar");
        } else {
            console.log(`No hay suficientes artículos disponibles para comprar la cantidad solicitada`, new Date().toLocaleString());
            res.status(400).send("No hay suficientes artículos disponibles para comprar la cantidad solicitada");
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.log(err.message);
        res.status(500).send("Ha ocurrido un error en la compra");
    } finally {
        res.end();
    }
}



async function search(req, res) {   
    try {
        const item = req.query.id;
        const response = await client.query('SELECT * FROM buyers WHERE id = $1', [item]);
        console.log(response.rows);
    } catch (err) {
        console.log(err.message);
    } finally {
        res.end();
    }
}

app.get('/buy',buy);
app.get('/search',search);
app.get('/',(req,res)=>{
    res.send("Hola");
})


app.listen(PORT,(req,res)=>{
    console.log(`Escuchando ${PORT}`)
})