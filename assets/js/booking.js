/* Локальная запись. Дата и время остаются локальными, без преобразования в UTC. */
(() =>
{
    'use strict';

    if (!document.querySelector('#booking-form')) return;

    const data = window.BarbershopData;
    const cart = window.BarbershopCart;
    const form = document.querySelector('#booking-form');
    const date = form.elements.date;
    const time = form.elements.time;

    // Текущая дата в локальном часовом поясе
    const today = () =>
    {
        const d = new Date();

        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    date.min = today();

    // Предварительный выбор мастера
    const selected = new URLSearchParams(location.search).get('master');

    try
    {
        if (selected && data.masters.some(m => m.id === selected))
        {
            sessionStorage.setItem('stylish-beard:master', selected);
        }
    }
    catch {}

    let master = selected;

    try
    {
        master ||= sessionStorage.getItem('stylish-beard:master');
    }
    catch {}

    for (const m of data.masters)
    {
        form.elements.master.add(new Option(m.name, m.id));
    }

    if (data.masters.some(m => m.id === master))
    {
        form.elements.master.value = master;
    }

    // Формирование доступного времени записи
    function slots()
    {
        const previous = time.value;
        time.replaceChildren(new Option('Выберите время', ''));

        const duration = cart.totals().duration;

        if (!date.value || date.value < today() || !duration) return;

        for (let minute = data.hours.open * 60;
             minute + duration <= data.hours.close * 60;
             minute += data.hours.step)
        {
            const value = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

            if (new Date(`${date.value}T${value}:00`).getTime() <= Date.now()) continue;

            time.add(new Option(value, value));
        }

        if ([...time.options].some(o => o.value === previous))
        {
            time.value = previous;
        }

        document.querySelector('#booking-time-note').textContent = time.options.length === 1
            ? 'В этот день нет подходящего времени. Выберите другую дату.'
            : `Продолжительность визита — ${duration} мин. Работаем до ${data.hours.close}:00.`;
    }

    date.addEventListener('change', slots);
    date.addEventListener('input', slots);

    // Вывод ошибок заполнения формы
    function error(name, message)
    {
        const field = form.elements[name];

        field.setAttribute('aria-invalid', String(!!message));
        document.querySelector(`#${name}-error`).textContent = message;
    }

    // Проверка данных и сохранение плана визита
    form.addEventListener('submit', event =>
    {
        event.preventDefault();

        const values = Object.fromEntries(new FormData(form));
        const errors =
        {
            name: values.name.trim().length < 2
                ? 'Введите имя: минимум 2 символа.'
                : '',
            phone: /^[78]\d{10}$/.test(values.phone.replace(/\D/g, ''))
                ? ''
                : 'Введите телефон РФ: 11 цифр, начиная с 7 или 8.',
            master: data.masters.some(m => m.id === values.master)
                ? ''
                : 'Выберите мастера.',
            date: values.date >= today()
                ? ''
                : 'Выберите сегодняшнюю или будущую дату.',
            time: ''
        };

        slots();

        if (!values.time || ![...time.options].some(o => o.value === values.time))
        {
            errors.time = 'Выберите доступное время.';
        }

        const start = new Date(`${values.date}T${values.time}:00`);
        const totals = cart.totals();

        if (!Number.isFinite(start.getTime()) || start.getTime() <= Date.now())
        {
            errors.time = 'Это время уже прошло. Выберите другое.';
        }

        const [hours, minutes] = values.time.split(':').map(Number);

        if (values.time && (hours * 60 + minutes + totals.duration > data.hours.close * 60 || hours < data.hours.open))
        {
            errors.time = 'Визит должен завершиться в рабочие часы.';
        }

        for (const [name, message] of Object.entries(errors))
        {
            error(name, message);
        }

        const invalid = Object.keys(errors).find(name => errors[name]);

        if (invalid)
        {
            form.elements[invalid].focus();
            return;
        }

        const services = cart.read();

        if (!services.length)
        {
            document.querySelector('#booking-status').textContent = 'Сначала выберите услуги в каталоге.';
            return;
        }

        const button = form.querySelector('[type=submit]');
        button.disabled = true;

        const record =
        {
            id: `SB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
            name: values.name.trim(),
            phone: values.phone,
            master: values.master,
            date: values.date,
            time: values.time,
            services: services.map(s => ({ id: s.id, name: s.name, price: s.price, duration: s.duration })),
            ...totals
        };

        // Запись данных в localStorage
        try
        {
            let records;

            try
            {
                records = JSON.parse(localStorage.getItem('stylish-beard:bookings:v1') || '[]');
            }
            catch
            {
                records = [];
            }

            if (!Array.isArray(records)) records = [];

            localStorage.setItem('stylish-beard:bookings:v1', JSON.stringify([...records, record]));
        }
        catch
        {
            document.querySelector('#booking-status').textContent = 'Не удалось сохранить запись. Проверьте доступ к хранилищу браузера и повторите.';
            button.disabled = false;
            return;
        }

        // Отображение подтверждения
        cart.clear();
        form.hidden = true;
        document.querySelector('#booking-summary').hidden = true;

        const confirmation = document.querySelector('#booking-confirmation');
        confirmation.hidden = false;

        const end = hours * 60 + minutes + record.duration;
        const lines =
        [
            `Номер: ${record.id}`,
            `Имя: ${record.name}`,
            `Мастер: ${data.masters.find(m => m.id === record.master).name}`,
            `Дата: ${record.date.split('-').reverse().join('.')}`,
            `Время: ${record.time}–${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`,
            `Услуги: ${record.services.map(s => s.name).join(', ')}`,
            `Итого: ${record.price.toLocaleString('ru-RU')} ₽ · ${record.duration} мин`
        ];

        const details = confirmation.querySelector('[data-confirmation-details]');

        for (const line of lines)
        {
            const p = document.createElement('p');
            p.textContent = line;
            details.append(p);
        }

        confirmation.focus();
    });
})();
