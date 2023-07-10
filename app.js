const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const dataFilePath = './data.json';

fs.readFile(dataFilePath, (err, data) => {
    if (err || data.length == 0) {
        fs.writeFile(dataFilePath, JSON.stringify([]), () => {
            console.log('Data file initialized.');
        });
    }
});

app.post('/expenses', (req, res) => {
  fs.readFile(dataFilePath, (err, data) => {
      let expenses;
      try {
          expenses = JSON.parse(data);
      } catch {
          expenses = [];
      }

      const newExpense = {
          ...req.body,
          expenseId: uuidv4(),
      };

      expenses.push(newExpense);

      fs.writeFile(dataFilePath, JSON.stringify(expenses), (err) => {
          if (err) {
              res.status(500).json({ message: 'An error occurred writing the data.' });
              return;
          }

          res.status(200).json({ message: 'New expense added successfully.' });
      });
  });
});


app.get('/expenses', (req, res) => {
    fs.readFile(dataFilePath, (err, data) => {
        if (err || data.length == 0) {
            res.status(200).json([]);
            return;
        }

        let expenses;
        try {
            expenses = JSON.parse(data);
        } catch {
            expenses = [];
        }

        res.status(200).json(expenses);
    });
});

app.get('/expenses/:id', (req, res) => {
    const expenseId = req.params.id;

    fs.readFile(dataFilePath, (err, data) => {
        if (err || data.length == 0) {
            res.status(404).json({ message: 'Expense not found.' });
            return;
        }

        let expenses;
        try {
            expenses = JSON.parse(data);
        } catch {
            expenses = [];
        }

        const expense = expenses.find(expense => expense.expenseId === expenseId);

        if (!expense) {
            res.status(404).json({ message: 'Expense not found.' });
            return;
        }

        res.status(200).json(expense);
    });
});

app.delete('/expenses/:id', (req, res) => {
    const expenseId = req.params.id;

    fs.readFile(dataFilePath, (err, data) => {
        if (err || data.length == 0) {
            res.status(404).json({ message: 'Expense not found.' });
            return;
        }

        let expenses;
        try {
            expenses = JSON.parse(data);
        } catch {
            expenses = [];
        }

        const initialLength = expenses.length;
        expenses = expenses.filter(expense => expense.expenseId !== expenseId);

        if (initialLength === expenses.length) {
            res.status(404).json({ message: 'Expense not found.' });
            return;
        }

        fs.writeFile(dataFilePath, JSON.stringify(expenses), (err) => {
            if (err) {
                res.status(500).json({ message: 'An error occurred writing the data.' });
                return;
            }

            res.status(200).json({ message: 'Expense deleted successfully.' });
        });
    });
});

app.put('/expenses/:id', (req, res) => {
    const expenseId = req.params.id;
    const updatedExpense = req.body;

    fs.readFile(dataFilePath, (err, data) => {
        if (err || data.length == 0) {
            res.status(404).json({ message: 'Expense not found.' });
            return;
        }

        let expenses;
        try {
            expenses = JSON.parse(data);
        } catch {
            expenses = [];
        }

        const index = expenses.findIndex(expense => expense.expenseId === expenseId);

        if (index === -1) {
            res.status(404).json({ message: 'Expense not found.' });
            return;
        }

        expenses[index] = updatedExpense;

        fs.writeFile(dataFilePath, JSON.stringify(expenses), (err) => {
            if (err) {
                res.status(500).json({ message: 'An error occurred writing the data.' });
                return;
            }

            res.status(200).json({ message: 'Expense updated successfully.' });
        });
    });
});

const port = 3000;
app.listen(port, () => console.log(`App listening on port ${port}!`));
