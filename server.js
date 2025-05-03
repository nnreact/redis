import { PrismaClient } from './generated/prisma/index.js'
import express from 'express';
import cors from 'cors';
import { createClient } from 'redis';

const app = express();
const prisma = new PrismaClient()
const redisClient = createClient({
    url: 'redis://localhost:6379',
    password: 'mypassword'
})

await redisClient.connect();

app.use(cors());
app.use(express.json());

app.get('/', async(req, res) => {

    // check if data is in redis
    const cachedInvoices = await redisClient.get('invoices');

    if (cachedInvoices) {
        return res.json({
            status: 'success',
            count: cachedInvoices.length,
            message: 'Invoices fetched successfully',
            data: cachedInvoices
        });
    }
    const invoices = await prisma.invoice.findMany();
    const invoiceCount = await prisma.invoice.count();

    // save to redis
    await redisClient.set('invoices', JSON.stringify(invoices));

    // create dummy delay
    res.json({
        status: 'success',
        count: invoiceCount,
        message: 'Invoices fetched successfully',
        data: invoices
    });
});

app.get('/get-data', async(req, res) => {

    // if data is in redis
    const cachedData = await redisClient.get('countedNumber');
    if (cachedData) {
        return res.json({
            status: 'success',
            message: 'Data fetched successfully',
            data: cachedData
        });
    }

    let someValue = 0;
    for (let i = 0; i < 10000000000; i++) {
        someValue += i;
    }

    await redisClient.set('countedNumber', someValue);

    res.json({
        status: 'success',
        message: 'Data fetched successfully',
        data: someValue
    });
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});















// async function main() {
//     // Array to hold all create promises
//     const createPromises = [];

//     // Possible status values
//     const statuses = ['pending', 'paid', 'overdue', 'cancelled'];

//     // Create 500 dummy invoices
//     for (let i = 0; i < 50000; i++) {
//         // Generate random amount between 50 and 5000
//         const amount = Math.floor(Math.random() * 4950) + 50;

//         // Generate random date within the last year
//         const date = new Date();
//         date.setDate(date.getDate() - Math.floor(Math.random() * 365));

//         // Pick a random status
//         const status = statuses[Math.floor(Math.random() * statuses.length)];

//         // Add create promise to array
//         createPromises.push(
//             prisma.invoice.create({
//                 data: {
//                     amount,
//                     date,
//                     status,
//                 },
//             })
//         );
//     }

//     // Execute all create operations in parallel
//     const invoices = await Promise.all(createPromises);
//     console.log(`Created ${invoices.length} dummy invoices`);
// }

// main()
//     .catch(console.error)
//     .finally(async() => {
//         await prisma.$disconnect();
//     });