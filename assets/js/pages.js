/* Дополнительные страницы используют общий каталог услуг и корзину. */

(() =>
{
    'use strict';

    const data = window.BarbershopData;
    const cart = window.BarbershopCart;
    const money = n => `${n.toLocaleString('ru-RU')} ₽`;

    const root = document.querySelector('[data-page]');
    if (!root) return;

    const message = document.querySelector('#page-status');

    // Карточка услуги в каталоге
    const card = s =>
        `<article class="catalog-card">` +
        `<a href="service.html?id=${s.id}">` +
        `<img src="assets/images/${s.image}" alt="${s.name}" width="700" height="467" loading="lazy">` +
        `<h2>${s.name}</h2>` +
        `</a>` +
        `<p>${s.description}</p>` +
        `<p class="catalog-card__price">${money(s.price)} · ${s.duration} мин</p>` +
        `<div class="catalog-card__actions">` +
        `<a class="text-link" href="service.html?id=${s.id}">Подробнее</a>` +
        `<button class="button" type="button" data-add="${s.id}">Добавить в корзину</button>` +
        `</div>` +
        `</article>`;

    // Сводка выбранных услуг
    function summary(services)
    {
        const t = cart.totals();

        return `<ul class="visit-list">` +
            services.map(s =>
                `<li>${s.name}<span>${money(s.price)} · ${s.duration} мин</span></li>`
            ).join('') +
            `</ul>` +
            `<p class="visit-total">Итого: ${money(t.price)} · ${t.duration} мин</p>`;
    }

    // Каталог и фильтрация по категориям
    if (root.dataset.page === 'catalog')
    {
        const filters = document.querySelector('#category-filters');
        const params = new URLSearchParams(location.search);
        let category = params.get('category') || 'all';

        if (category !== 'all' && !data.categories[category]) category = 'all';

        for (const [id, label] of Object.entries({ all: 'Все услуги', ...data.categories }))
        {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'filter-button';
            button.textContent = label;
            button.dataset.category = id;
            filters.append(button);
        }

        function render()
        {
            root.innerHTML = data.services
                .filter(s => category === 'all' || s.category === category)
                .map(card)
                .join('');

            filters.querySelectorAll('button').forEach(b =>
            {
                b.setAttribute('aria-pressed', String(b.dataset.category === category));
            });
        }

        filters.addEventListener('click', event =>
        {
            const button = event.target.closest('[data-category]');
            if (!button) return;

            category = button.dataset.category;
            const url = new URL(location.href);

            if (category === 'all') url.searchParams.delete('category');
            else url.searchParams.set('category', category);

            history.replaceState(null, '', url);
            render();
        });

        render();
    }

    // Страница отдельной услуги
    if (root.dataset.page === 'service')
    {
        const service = data.services.find(s =>
            s.id === new URLSearchParams(location.search).get('id')
        );

        if (!service)
        {
            root.innerHTML = '<h1>Услуга не найдена</h1><p>Выберите процедуру в каталоге.</p><a class="button" href="catalog.html">Открыть каталог</a>';
        }
        else
        {
            document.title = `${service.name} — Стильный бородач`;

            root.innerHTML =
                `<img class="service-detail__image" src="assets/images/${service.image}" alt="${service.name}" width="1200" height="800">` +
                `<div>` +
                `<p class="eyebrow">${data.categories[service.category]}</p>` +
                `<h1>${service.name}</h1>` +
                `<p>${service.description}</p>` +
                `<p>Перед процедурой мастер уточнит пожелания, подберёт подходящую форму и объяснит домашний уход. В стоимость входят подготовка и завершение процедуры.</p>` +
                `<p class="visit-total">${money(service.price)} · ${service.duration} мин</p>` +
                `<button class="button" type="button" data-add="${service.id}">Добавить в корзину</button>` +
                `<a class="text-link" href="cart.html">Открыть корзину</a>` +
                `</div>`;
        }
    }

    // Отображение корзины
    function renderCart()
    {
        const services = cart.read();

        root.innerHTML = services.length
            ? `<div class="cart-list">` +
              services.map(s =>
                  `<article class="cart-item">` +
                  `<img src="assets/images/${s.image}" alt="${s.name}" width="120" height="100">` +
                  `<div>` +
                  `<a href="service.html?id=${s.id}"><h2>${s.name}</h2></a>` +
                  `<p>${money(s.price)} · ${s.duration} мин</p>` +
                  `</div>` +
                  `<button class="text-button" type="button" data-remove="${s.id}" aria-label="Удалить ${s.name}">Удалить</button>` +
                  `</article>`
              ).join('') +
              `</div>` +
              `<div class="visit-panel">` +
              summary(services) +
              `<a class="button" href="booking.html">Оформить запись</a>` +
              `</div>`
            : '<div class="empty-state"><h2>В корзине пока нет услуг</h2><p>Выберите процедуры для своего визита.</p><a class="button" href="catalog.html">Выбрать услуги</a></div>';
    }

    if (root.dataset.page === 'cart') renderCart();

    // Сводка услуг на странице записи
    if (root.dataset.page === 'booking')
    {
        const services = cart.read();

        if (services.length)
        {
            document.querySelector('#booking-summary').innerHTML = summary(services);
        }
        else
        {
            document.querySelector('#booking-form').hidden = true;
            document.querySelector('#booking-summary').innerHTML =
                '<h2>Выберите услуги для визита</h2><p>После выбора процедур можно указать мастера и время.</p><a class="button" href="catalog.html">Перейти к услугам</a>';
        }
    }

    // Карточки мастеров
    if (root.dataset.page === 'team')
    {
        root.innerHTML = data.masters.map(m =>
            `<article class="master-card">` +
            `<img src="assets/images/${m.image}" alt="Стоковое фото барбера для профиля ${m.name}" width="700" height="900" loading="lazy">` +
            `<div>` +
            `<h2>${m.name}</h2>` +
            `<p class="master-card__specialty">${m.specialty}</p>` +
            `<p>${m.description}</p>` +
            `<a class="button" href="booking.html?master=${m.id}">Выбрать мастера</a>` +
            `</div>` +
            `</article>`
        ).join('');
    }

    // Добавление и удаление услуг
    document.addEventListener('click', event =>
    {
        const add = event.target.closest('[data-add]');

        if (add)
        {
            message.textContent = cart.add(add.dataset.add);
            return;
        }

        const remove = event.target.closest('[data-remove]');

        if (remove)
        {
            cart.remove(remove.dataset.remove);
            renderCart();
            message.textContent = 'Услуга удалена';
        }
    });

    // Обновление корзины при изменениях в другой вкладке
    window.addEventListener('storage', () =>
    {
        if (root.dataset.page === 'cart') renderCart();
        if (root.dataset.page === 'booking') location.reload();
    });
})();
