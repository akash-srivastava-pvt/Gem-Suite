import fs from 'fs';

const fileName = 'financial_data_1000.csv';
const headers = "Transaction_ID,Date,Account,Category,Sub_Category,Description,Amount,Currency,Status,Merchant,Tax_Tag,Project,Balance\n";

// Configuration for randomization
const categories = [
    { cat: 'Food', sub: 'Groceries', desc: 'Weekly Shop', weight: 15, tax: 'FOOD-01', project: 'Living' },
    { cat: 'Transport', sub: 'Fuel', desc: 'Gas Station', weight: 10, tax: 'TRA-01', project: 'Commute' },
    { cat: 'Business', sub: 'Software', desc: 'SaaS Subscription', weight: 5, tax: 'BIZ-EXP', project: 'Project_Alpha' },
    { cat: 'Dining', sub: 'Restaurant', desc: 'Client Lunch', weight: 8, tax: 'BIZ-MEAL', project: 'Sales' },
    { cat: 'Lifestyle', sub: 'Entertainment', desc: 'Cinema/Streaming', weight: 7, tax: 'ENT-01', project: 'Personal' },
    { cat: 'Healthcare', sub: 'Pharmacy', desc: 'Medical Supplies', weight: 3, tax: 'MED-01', project: 'Wellness' },
    { cat: 'Travel', sub: 'Uber', desc: 'Airport Ride', weight: 4, tax: 'BIZ-TRAV', project: 'Travel_Q1' }
];

let runningBalance = 5000.00; // Starting balance
let csvContent = headers;
let currentDate = new Date('2026-01-01');

for (let i = 1; i <= 2000; i++) {
    let amount, category, subCat, desc, tax, project, type;

    // Logic: Monthly Salary every 30 rows
    if (i % 30 === 0) {
        category = 'Income';
        subCat = 'Salary';
        desc = 'Monthly Payroll';
        amount = 5500.00;
        tax = 'INC-01';
        project = 'Core';
        type = 'Checking';
    } else {
        // Pick a random expense based on weights
        const randomPick = categories[Math.floor(Math.random() * categories.length)];
        category = randomPick.cat;
        subCat = randomPick.sub;
        desc = randomPick.desc;
        amount = -(Math.random() * (150 - 10) + 10).toFixed(2); // Random expense between $10-$150
        tax = randomPick.tax;
        project = randomPick.project;
        type = Math.random() > 0.5 ? 'Credit' : 'Checking';
    }

    runningBalance += parseFloat(amount);
    
    // Increment date every 3 transactions to spread 1000 rows over a year
    if (i % 3 === 0) {
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const row = [
        `TXN-${1000 + i}`,
        currentDate.toISOString().split('T')[0],
        type,
        category,
        subCat,
        desc,
        amount,
        'USD',
        'Cleared',
        'Merchant_' + Math.floor(Math.random() * 50),
        tax,
        project,
        runningBalance.toFixed(2)
    ].join(',');

    csvContent += row + "\n";
}

fs.writeFileSync(fileName, csvContent);
console.log(`Successfully generated 1000 rows in ${fileName}`);