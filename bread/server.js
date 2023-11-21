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
    const { page = 1, name, height, weight, startdate, enddate, married, mode } = req.query
    const qeuris = []
    const params = []
    const paramscount = []
    if (name) {
        qeuris.push(`name like '%' || ? || '%'`)
        params.push(name)
        paramscount.push(name)
    }
    if (height) {
        qeuris.push(`height = ?`)
        params.push(height)
        paramscount.push(height)
    }
    if (weight) {
        qeuris.push(`weight = ?`)
        params.push(weight)
        paramscount.push(weight)
    }

    if (startdate && enddate) {
        qeuris.push(` birthdate BETWEEN ? and ?`)
        params.push(startdate, enddate)
        paramscount.push(startdate, enddate)
    } else if (startdate) {
        qeuris.push(` birthdate >= ?`)
        params.push(startdate)
        paramscount.push(startdate)
    } else if (enddate) {
        qeuris.push(` birthdate <= ? `)
        params.push(enddate)
        paramscount.push(enddate)
    }

    if (married) {
        qeuris.push(` married = ?`)
        params.push(married)
        paramscount.push(married)
    }


    let sql = 'SELECT * FROM data'
    let sqlcount = 'SELECT COUNT(*) AS TOTAL FROM data'

    if (qeuris.length > 0) {
        sql += ` WHERE ${qeuris.join(`${mode}`)}`
        sqlcount += ` WHERE ${qeuris.join(`${mode}`)}`
    }

    db.all(sql, params, function (err, rows) {
        res.render('list', { rows, query: req.query })
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