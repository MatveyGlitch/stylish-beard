/* Общая корзина: ID услуг, уникальность и пересечения состава процедур. */
(() =>
{
    'use strict';

    const data = window.BarbershopData;
    let memory = [];

    // Чтение и проверка сохранённых услуг
    function read()
    {
        try
        {
            const raw = JSON.parse(localStorage.getItem(data.cartKey) || '[]');
            const accepted = [];

            if (Array.isArray(raw))
            {
                for (const id of new Set(raw))
                {
                    const service = data.services.find(s => s.id === id);

                    if (service && !accepted.some(s =>
                        s.components.some(c => service.components.includes(c))))
                    {
                        accepted.push(service);
                    }
                }
            }

            memory = accepted.map(s => s.id);
        }
        catch
        {
            // При недоступном хранилище сохраняем состояние в памяти.
        }

        return memory.map(id => data.services.find(s => s.id === id)).filter(Boolean);
    }

    // Сохранение корзины и обновление счётчика
    function save(ids)
    {
        memory = ids;
        let persisted = true;

        try
        {
            localStorage.setItem(data.cartKey, JSON.stringify(ids));
        }
        catch
        {
            persisted = false;
        }

        document.querySelectorAll('[data-cart-count]').forEach(e =>
        {
            e.textContent = ids.length;
        });

        window.dispatchEvent(new Event('cart:updated'));
        return persisted;
    }

    // Операции с корзиной
    window.BarbershopCart =
    {
        read,

        totals()
        {
            return read().reduce(
                (t, s) => ({
                    price: t.price + s.price,
                    duration: t.duration + s.duration
                }),
                { price: 0, duration: 0 }
            );
        },

        add(id)
        {
            const service = data.services.find(s => s.id === id);
            if (!service) return 'Услуга не найдена';

            const current = read();
            if (current.some(s => s.id === id)) return 'Эта услуга уже в корзине';

            const conflicts = current.filter(s =>
                s.components.some(c => service.components.includes(c)));

            if (conflicts.some(s => service.components.every(c => s.components.includes(c))))
            {
                return 'Эта процедура уже включена в выбранный комплекс';
            }

            if (conflicts.length && !window.confirm(
                `«${service.name}» включает выбранные процедуры: ${conflicts.map(s => s.name).join(', ')}. Заменить их комплексом?`))
            {
                return 'Корзина не изменена';
            }

            const persisted = save([
                ...current.filter(s => !conflicts.includes(s)).map(s => s.id),
                id
            ]);

            return persisted
                ? 'Услуга добавлена в корзину'
                : 'Услуга добавлена. Для сохранения между посещениями разрешите хранение данных в браузере';
        },

        remove(id)
        {
            save(read().filter(s => s.id !== id).map(s => s.id));
        },

        clear()
        {
            save([]);
        }
    };
})();
