/* Общие элементы и интерактив главной страницы. Без сетевых отправок. */

(() =>
{
    'use strict';

    const data = window.BarbershopData;
    const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';

    document.querySelector('#year').textContent = new Date().getFullYear();

    // Индикатор корзины
    function updateCartCount()
    {
        let count = 0;

        try
        {
            if (window.BarbershopCart)
            {
                count = window.BarbershopCart.read().length;
            }
            else
            {
                const ids = JSON.parse(localStorage.getItem(data.cartKey) || '[]');

                if (Array.isArray(ids))
                {
                    count = new Set(ids.filter(id => data.services.some(service => service.id === id))).size;
                }
            }
        }
        catch
        {
            // Недоступное или повреждённое хранилище: индикатор остаётся пустым.
        }

        document.querySelectorAll('[data-cart-count]').forEach(element =>
        {
            element.textContent = count;
        });
    }

    updateCartCount();

    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart:updated', updateCartCount);

    // Мобильное меню
    const menu = document.querySelector('#menu');

    document.querySelectorAll('[data-menu-open]').forEach(button =>
    {
        button.addEventListener('click', () => menu.showModal());
    });

    document.querySelector('[data-menu-close]').addEventListener('click', () => menu.close());

    // Закрытие диалогов при нажатии за их пределами
    document.querySelectorAll('dialog').forEach(dialog =>
    {
        dialog.addEventListener('click', event =>
        {
            const bounds = dialog.getBoundingClientRect();

            if (event.target === dialog &&
                (event.clientX < bounds.left || event.clientX > bounds.right ||
                 event.clientY < bounds.top || event.clientY > bounds.bottom))
            {
                dialog.close();
            }
        });
    });

    // Остальные компоненты используются только на главной странице
    if (!document.querySelector('#category-track')) return;

    // Слайдер категорий
    const track = document.querySelector('#category-track');
    const categories = [...track.children];
    const previous = document.querySelector('[data-slide="-1"]');
    const next = document.querySelector('[data-slide="1"]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let categoryIndex = 0;

    function syncSlider()
    {
        const max = track.scrollWidth - track.clientWidth;
        const start = categories[0].offsetLeft;

        categoryIndex = categories.reduce((best, item, index) =>
            Math.abs(item.offsetLeft - start - track.scrollLeft) <
            Math.abs(categories[best].offsetLeft - start - track.scrollLeft) ? index : best, 0);

        // В конце выбирается последняя категория, даже если видны несколько карточек
        if (max > 0 && track.scrollLeft >= max - 3)
        {
            categoryIndex = categories.length - 1;
        }

        categories.forEach((item, index) =>
        {
            item.classList.toggle('category--active', index === categoryIndex);
        });

        document.querySelector('[data-category-status]').textContent =
            `${categoryIndex + 1} из ${categories.length}`;

        previous.disabled = track.scrollLeft <= 3;
        next.disabled = track.scrollLeft >= max - 3;
    }

    document.querySelectorAll('[data-slide]').forEach(button =>
    {
        button.addEventListener('click', () =>
        {
            const step = categories[0].getBoundingClientRect().width +
                parseFloat(getComputedStyle(track).gap);

            track.scrollBy({
                left: Number(button.dataset.slide) * step,
                behavior: reducedMotion.matches ? 'instant' : 'smooth'
            });
        });
    });

    track.addEventListener('scroll', syncSlider, { passive: true });
    window.addEventListener('resize', syncSlider);

    track.addEventListener('keydown', event =>
    {
        if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;

        event.preventDefault();
        (event.key === 'ArrowLeft' ? previous : next).click();
    });

    syncSlider();

    // Отзывы клиентов
    const stories = [
        {
            author: 'Алексей',
            title: '«Подстригли как просил»',
            text: 'Попросил убрать длину по бокам и немного оставить сверху. Всё сделали как договорились. Результатом доволен.',
            image: 'review-client-1.jpg',
            alt: 'Стоковое фото: мужчина с зачёсанными волосами и длинной бородой во время стрижки'
        },
        {
            author: 'Михаил',
            title: '«Спокойно и без спешки»',
            text: 'Спокойно обсудили стрижку, мастер уточнил длину. Работал без спешки, в конце показал результат в зеркале.',
            image: 'review-client-2.jpg',
            alt: 'Стоковое фото: мастер показывает клиенту результат в зеркале'
        },
        {
            author: 'Илья',
            title: '«Аккуратные переходы»',
            text: 'Особенно понравилось, как подровняли виски и затылок. Переходы ровные, ничего не торчит. Получилось аккуратно.',
            image: 'review-client-3.jpg',
            alt: 'Стоковое фото: мужчина с короткой текстурной стрижкой, вид сбоку'
        }
    ];

    const storyDialog = document.querySelector('#story-dialog');
    let storyIndex = 0;

    function showStory(index)
    {
        storyIndex = (index + stories.length) % stories.length;

        const story = stories[storyIndex];

        document.querySelector('#story-position').textContent =
            `${storyIndex + 1} из ${stories.length}`;
        document.querySelector('#story-author').textContent = story.author;
        document.querySelector('#story-title').textContent = story.title;
        document.querySelector('#story-text').textContent = story.text;

        const image = document.querySelector('#story-image');
        image.src = 'assets/images/' + story.image;
        image.alt = story.alt;

        storyDialog.scrollTop = 0;
    }

    document.querySelectorAll('[data-story]').forEach(button =>
    {
        button.addEventListener('click', () =>
        {
            showStory(Number(button.dataset.story));
            storyDialog.showModal();
            document.querySelector('#story-close').focus();
        });
    });

    document.querySelector('#story-close').addEventListener('click', () => storyDialog.close());
    document.querySelector('#story-prev').addEventListener('click', () => showStory(storyIndex - 1));
    document.querySelector('#story-next').addEventListener('click', () => showStory(storyIndex + 1));

    storyDialog.addEventListener('keydown', event =>
    {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
        {
            event.preventDefault();
            showStory(storyIndex + (event.key === 'ArrowRight' ? 1 : -1));
        }
    });

    // Популярные услуги
    const serviceList = document.querySelector('#popular-services');

    data.services.filter(service => service.popular).forEach(service =>
    {
        const link = document.createElement('a');
        link.className = 'service-list__item';
        link.href = `service.html?id=${encodeURIComponent(service.id)}`;

        const parts = [
            ['name', service.name],
            ['description', service.description],
            ['price', money(service.price)]
        ];

        parts.forEach(([part, text]) =>
        {
            const span = document.createElement('span');
            span.className = `service-list__${part}`;
            span.textContent = text;

            if (part === 'price')
            {
                const time = document.createElement('small');
                time.textContent = `${service.duration} мин`;
                span.append(time);
            }

            link.append(span);
        });

        serviceList.append(link);
    });

    // Таймер специального предложения
    const deadline = Date.parse(data.promotion.endsAt);
    let timer;

    function tick()
    {
        const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

        const values = {
            days: Math.floor(remaining / 86400),
            hours: Math.floor(remaining / 3600) % 24,
            minutes: Math.floor(remaining / 60) % 60,
            seconds: remaining % 60
        };

        Object.entries(values).forEach(([part, value]) =>
        {
            document.querySelector(`[data-time="${part}"]`).textContent =
                String(value).padStart(2, '0');
        });

        if (remaining === 0)
        {
            document.querySelector('#timer-status').textContent =
                'Акция завершена. Актуальные условия смотрите в каталоге.';
            document.querySelector('#timer-label').textContent = 'Предложение завершено';
            clearInterval(timer);
        }
    }

    timer = setInterval(tick, 1000);
    tick();

    document.addEventListener('visibilitychange', () =>
    {
        if (!document.hidden) tick();
    });

    // Форма обратной связи
    const form = document.querySelector('#feedback-form');
    const status = document.querySelector('#form-status');

    function validate(field)
    {
        const value = field.value.trim();

        if (!value) return 'Заполните это поле.';
        if (field.name === 'name' && value.length < 2) return 'Укажите имя: минимум 2 символа.';

        if (field.name === 'contact')
        {
            const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(value);
            const phone = /^\+?[\d\s()\-]+$/.test(value) &&
                /^[78]\d{10}$/.test(value.replace(/\D/g, ''));

            if (!email && !phone)
            {
                return 'Введите email или телефон РФ: 11 цифр, начиная с 7 или 8.';
            }
        }

        if (field.name === 'message' && value.length < 5)
        {
            return 'Напишите хотя бы 5 символов.';
        }

        return '';
    }

    function showError(field, error)
    {
        field.setAttribute('aria-invalid', String(Boolean(error)));
        document.querySelector(`#${field.name}-error`).textContent = error;
    }

    form.addEventListener('submit', event =>
    {
        event.preventDefault();
        status.textContent = '';

        let firstInvalid;

        [...form.querySelectorAll('input, textarea')].forEach(field =>
        {
            const error = validate(field);
            showError(field, error);

            if (error && !firstInvalid) firstInvalid = field;
        });

        if (firstInvalid)
        {
            firstInvalid.focus();
            return;
        }

        form.reset();
        status.textContent = 'Все поля заполнены корректно';
    });

    form.addEventListener('input', event =>
    {
        status.textContent = '';

        if (event.target.matches('input, textarea') &&
            event.target.getAttribute('aria-invalid') === 'true')
        {
            showError(event.target, validate(event.target));
        }
    });
})();
