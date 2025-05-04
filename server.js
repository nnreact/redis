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

// app.get('/', async(req, res) => {

//     // check if data is in redis
//     const cachedInvoices = await redisClient.get('invoices');

//     if (cachedInvoices) {
//         return res.json({
//             status: 'success',
//             count: cachedInvoices.length,
//             message: 'Invoices fetched successfully',
//             data: cachedInvoices
//         });
//     }
//     const invoices = await prisma.invoice.findMany();
//     const invoiceCount = await prisma.invoice.count();

//     // save to redis
//     await redisClient.set('invoices', JSON.stringify(invoices));

//     // create dummy delay
//     res.json({
//         status: 'success',
//         count: invoiceCount,
//         message: 'Invoices fetched successfully',
//         data: invoices
//     });
// });

// app.get('/invoice/:id', async(req, res) => {
//     const { id } = req.params;


//     const cachedInvoice = await redisClient.get(`invoice:${id}`);

//     if (cachedInvoice) {
//         return res.json({
//             status: 'success',
//             message: 'Invoice fetched successfully',
//             data: JSON.parse(cachedInvoice)
//         })
//     }

//     const invoice = await prisma.invoice.findUnique({
//         where: {
//             id: id
//         }
//     })

//     if (!invoice) {
//         return res.status(404).json({
//             status: 'error',
//             message: 'Invoice not found'
//         })
//     }

//     await redisClient.set(`invoice:${id}`, JSON.stringify(invoice), {
//         EX: 60,
//         NX: true
//     });
//     res.json({
//         status: 'success',
//         message: 'Invoice fetched successfully',
//         data: invoice
//     })

// })

// app.get('/get-data', async(req, res) => {

//     //     // if data is in redis
//     //     const cachedData = await redisClient.get('countedNumber');
//     //     if (cachedData) {
//     //         return res.json({
//     //             status: 'success',
//     //             message: 'Data fetched successfully',
//     //             data: cachedData
//     //         });
//     //     }

//     let someValue = 0;
//     for (let i = 0; i < 10000000000; i++) {
//         someValue += i;
//     }

//     //     await redisClient.set('countedNumber', someValue);

//     res.json({
//         status: 'success',
//         message: 'Data fetched successfully',
//         data: someValue
//     });
// });

app.put("/invoice/:id", async(req, res) => {
    const { id } = req.params;
    const { amount } = req.body;

    const invoice = await prisma.invoice.update({
        where: { id: id },
        data: { amount: amount }
    })

    const cachedInvoice = await redisClient.get(`invoice:${id}`);

    if (cachedInvoice) {
        // await redisClient.set(`invoice:${id}`, JSON.stringify(invoice), {
        //     EX: 60,
        //     NX: true
        // });
        // delete the key
        await redisClient.del(`invoice:${id}`);
    }

    res.json({
        status: 'success',
        message: 'Invoice updated successfully',
        data: invoice
    })
})

app.get("/profile/:id", async(req, res) => {
    const { id } = req.params;

    const cachedProfile = await redisClient.get(`profile:${id}:age`);
    return res.json({
        status: 'success',
        message: 'Profile fetched successfully',
        data: JSON.parse(cachedProfile)
    })
}

const profile = await prisma.profile.findUnique({
    where: {
        id: id
    }
})

await redisClient.set(`profile:${id}`, JSON.stringify(profile), {
    EX: 60,
    NX: true
});

res.json({
    status: 'success',
    message: 'Profile fetched successfully',
    data: profile
})
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