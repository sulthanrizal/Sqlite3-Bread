const express = require('express')
const app = express()
const port = 3000


const path = require('path')
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, 'db', 'data.db'))
var bodyParser = require('body-parser')

app.set('view engine', 'ejs')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(express.static('public'))

app.get('/', (req, res) => {
    db.all('SELECT * FROM data', function (err, rows) {
        res.render('list', { rows })
    })
})

app.get('/add', (req, res) => {
    res.render('add')
})

app.post('/add', (req, res) => {
    db.run('INSERT INTO data(name,height,weight,birthdate,married) VALUES (?,?,?,?,?) ', [req.body.name, req.body.height, req.body.weight, req.body.birthdate, req.body.married], (err) => {
        if (err) return res.send(err)
        res.redirect('/')
    })
})

app.get('/update/:id', (req, res) => {
    const id = req.params.id
    db.get(`SELECT * FROM data WHERE id = ? `, [id], (err, data) => {
        res.render('update', { updateData: data })
    })
})

app.post('/update/:id', (req, res) => {
    const id = req.params.id
    db.run(`UPDATE data SET name = ? , height = ? , weight = ? , birthdate = ? , married = ? WHERE id = ?`, [req.body.name, req.body.height, req.body.weight, req.body.birthdate, req.body.married, id], (err) => {
        if (err) return res.send(err)
        res.redirect('/')
    })
})

app.get('/delete/:id', (req, res) => {
    const id = req.params.id
    db.run(`DELETE FROM data WHERE id = ? `, [id], (err) => {
        if (err) return res.send(err)
        res.redirect('/')
    })
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})