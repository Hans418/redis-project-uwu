import { DatabaseService } from '../src/database/database.service';

const prisma = new DatabaseService();

async function main() {
    console.log('🌱 Seeding database...');

    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    const electronics = await prisma.category.create({
        data: { name: 'Electronics' },
    });

    const books = await prisma.category.create({
        data: { name: 'Books' },
    });

    const clothing = await prisma.category.create({
        data: { name: 'Clothing' },
    });

    await prisma.product.createMany({
        data: [
            {
                name: 'Mechanical Keyboard',
                description: 'RGB mechanical keyboard',
                price: 129.99,
                categoryId: electronics.id,
            },
            {
                name: 'Wireless Mouse',
                price: 49.99,
                categoryId: electronics.id,
            },
            {
                name: 'Clean Code',
                description: 'Book by Robert C. Martin',
                price: 34.99,
                categoryId: books.id,
            },
            {
                name: 'T-Shirt',
                description: 'Black cotton T-shirt',
                price: 19.99,
                categoryId: clothing.id,
            },
        ],
    });

    console.log('✅ Seeding finished');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
