/* Управление PWA: регистрация Service Worker и установка приложения. */
(() =>
{
    'use strict';

    // Регистрация Service Worker
    if ('serviceWorker' in navigator)
    {
        window.addEventListener('load', () =>
        {
            navigator.serviceWorker.register('./sw.js', { scope: './' })
                .then(registration =>
                {
                    registration.addEventListener('updatefound', () =>
                    {
                        const worker = registration.installing;

                        worker?.addEventListener('statechange', () =>
                        {
                            if (worker.state === 'installed' && navigator.serviceWorker.controller)
                            {
                                const status = document.querySelector('#pwa-update');
                                status.hidden = false;
                                status.textContent = 'Доступна новая версия. Закройте вкладки приложения и откройте его снова.';
                            }
                        });
                    });
                })
                .catch(error => console.error('Service Worker:', error));
        });
    }

    // Состояние установки приложения
    let promptEvent;

    const panel = document.querySelector('#install-panel');
    const instruction = document.querySelector('#install-instructions');

    let rememberedInstalled = false;

    try
    {
        rememberedInstalled = localStorage.getItem('stylish-beard:installed') === '1';
    }
    catch
    {
    }

    const installed = () => rememberedInstalled || matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    const hiddenKey = 'stylish-beard:install-dismissed';

    let dismissed = false;

    try
    {
        dismissed = localStorage.getItem(hiddenKey) === '1';
    }
    catch
    {
    }

    // Отображение панели установки на главной странице
    if (document.querySelector('#category-track') && !installed() && !dismissed)
    {
        panel.hidden = false;
    }

    // Сохранение системного запроса на установку
    window.addEventListener('beforeinstallprompt', event =>
    {
        event.preventDefault();
        promptEvent = event;
    });

    // Установка приложения по нажатию кнопки
    document.querySelectorAll('[data-install]').forEach(button =>
    {
        button.addEventListener('click', async () =>
        {
            if (installed()) return;

            if (promptEvent)
            {
                await promptEvent.prompt();

                const result = await promptEvent.userChoice;
                promptEvent = null;

                if (result.outcome === 'accepted')
                {
                    panel.hidden = true;
                }
            }
            else
            {
                instruction.showModal();

                const text = instruction.querySelector('p');

                text.textContent = /iPad|iPhone|iPod/.test(navigator.userAgent)
                    ? 'В Safari откройте «Поделиться», затем «На экран Домой» и подтвердите добавление.'
                    : 'Откройте меню браузера и выберите «Установить приложение» или «Добавить на главный экран», если такой пункт доступен. Для установки используйте браузер, поддерживающий PWA.';
            }
        });
    });

    // Закрытие панели установки
    document.querySelector('[data-install-dismiss]').addEventListener('click', () =>
    {
        panel.hidden = true;

        try
        {
            localStorage.setItem(hiddenKey, '1');
        }
        catch
        {
        }
    });

    // Закрытие инструкции
    instruction.querySelector('button').addEventListener('click', () => instruction.close());

    // Обработка успешной установки
    window.addEventListener('appinstalled', () =>
    {
        rememberedInstalled = true;

        try
        {
            localStorage.setItem('stylish-beard:installed', '1');
        }
        catch
        {
        }

        panel.hidden = true;

        document.querySelectorAll('[data-install]').forEach(element =>
        {
            element.hidden = true;
        });
    });

    // Скрытие кнопок установки для установленного приложения
    if (installed())
    {
        document.querySelectorAll('[data-install]').forEach(element =>
        {
            element.hidden = true;
        });
    }
})();
