/* Единый учебный каталог. Цены — демонстрационные, время — в минутах. */
window.BarbershopData = Object.freeze({

    // Услуги барбершопа
    services: [
        {
            id: 'haircut',
            category: 'hair',
            name: 'Мужская стрижка',
            description: 'Стрижка с мытьём головы и укладкой. Подбираем форму под тип волос.',
            price: 1800,
            duration: 60,
            image: 'haircut.jpg',
            components: ['haircut'],
            popular: true
        },
        {
            id: 'beard',
            category: 'beard',
            name: 'Оформление бороды',
            description: 'Чёткий контур, правильная длина и уход за кожей.',
            price: 1100,
            duration: 30,
            image: 'beard.jpg',
            components: ['beard'],
            popular: true
        },
        {
            id: 'combo',
            category: 'complex',
            name: 'Стрижка + борода',
            description: 'Мужская стрижка и оформление бороды, мытьё головы и укладка.',
            price: 2500,
            duration: 90,
            image: 'hero.jpg',
            components: ['haircut', 'beard'],
            popular: true
        },
        {
            id: 'shave',
            category: 'shave',
            name: 'Классическое бритьё',
            description: 'Горячее полотенце, гладкое бритьё и успокаивающий уход.',
            price: 1400,
            duration: 45,
            image: 'tools.jpg',
            components: ['shave']
        },
        {
            id: 'care',
            category: 'care',
            name: 'Уход за волосами',
            description: 'Очищение, кондиционирование и подбор укладки.',
            price: 700,
            duration: 30,
            image: 'care.jpg',
            components: ['care']
        }
    ],

    // Специальное предложение
    promotion: {
        endsAt: '2026-12-01T00:00:00+03:00',
        serviceId: 'combo'
    },

    // Категории услуг
    categories: {
        hair: 'Стрижки',
        beard: 'Борода',
        shave: 'Бритьё',
        care: 'Уход',
        complex: 'Комплексы'
    },

    // Рабочие часы и шаг записи в минутах
    hours: {
        open: 10,
        close: 21,
        step: 30
    },

    // Мастера
    masters: [
        {
            id: 'alexey',
            name: 'Дмитрий',
            specialty: 'Мужские стрижки',
            description: 'Классические формы, фейд и повседневная укладка. Поможет выбрать длину с учётом структуры волос.',
            image: 'master-alexey.jpg'
        },
        {
            id: 'mikhail',
            name: 'Александр',
            specialty: 'Классическое бритьё',
            description: 'Работает с классическими стрижками и бритьём. Уделяет внимание контурам и подготовке кожи.',
            image: 'master-mikhail.jpg'
        },
        {
            id: 'ilya',
            name: 'Эдуард',
            specialty: 'Борода и комплексный уход',
            description: 'Оформление бороды, подбор формы и комплекс «Стрижка + борода». Подскажет, как поддерживать результат дома.',
            image: 'master-ilya.jpg'
        }
    ],

    // Контактные данные
    contacts: {
        address: 'Бородачёв, улица Мастерская, 12',
        phone: '+7 (000) 100-20-20',
        email: 'hello@stylish-beard.example'
    },

    // Ключ хранения корзины в браузере
    cartKey: 'stylish-beard:cart:v1'
});
