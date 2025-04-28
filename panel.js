const input  = document.getElementById('selector');
const btn    = document.getElementById('copy');
const status = document.getElementById('status');

btn.addEventListener('click', () => {
    const sel = input.value.trim();
    status.textContent = '';
    if (!sel) {
        status.style.color = 'red';
        status.textContent = 'Нужно ввести селектор';
        return;
    }

    // 1) Получаем разметку элемента из страницы
    const expr = `
    (() => {
      const el = document.querySelector("${sel.replace(/"/g,'\\"')}");
      if (!el) {
        throw new Error("Элемент ${sel.replace(/"/g,'\\"')} не найден");
      }
      return el.outerHTML;
    })()
  `;
    chrome.devtools.inspectedWindow.eval(expr, (html, exceptionInfo) => {
        if (exceptionInfo && exceptionInfo.isException) {
            status.style.color = 'red';
            status.textContent = exceptionInfo.value || exceptionInfo.description;
        } else {
            // 2) Копируем уже в панели расширения
            copyInPanel(`Привет! я прохожу тест, мне нужно, чтобы ты проанадизоровал html который я тебе отправлю, в нем будет вопрос, если в этом html будут варианты ответа ты должен будешь выбрать правильные, если ответов не будет дать свой собственный ответ
            Вот код html:
            ${html}
            `);
        }
    });
});

function copyInPanel(text) {
    // Сначала пробуем Clipboard API (в контексте панели он должен работать)
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            status.style.color = 'green';
            status.textContent = 'Скопировано!';
        }).catch(err => {
            console.warn('Clipboard API failed, fallback to execCommand', err);
            fallbackExec(text);
        });
    } else {
        // если нет API, сразу в fallback
        fallbackExec(text);
    }
}

function fallbackExec(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    // незаметно добавляем на страницу панели
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
        ok = document.execCommand('copy');
    } catch (e) {
        console.error('execCommand copy error', e);
    }
    document.body.removeChild(ta);

    if (ok) {
        status.style.color = 'green';
        status.textContent = 'Скопировано!';
    } else {
        status.style.color = 'red';
        status.textContent = "Не удалось скопировать в буфер";
    }
}
