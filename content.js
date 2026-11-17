(function () {
    console.log("%c[Alura Auto-Flow] Modo Relâmpago Ativo!", "color: #38bdf8; font-weight: bold;");

    let isRunning = false;
    let intervalId = null;
    let isAdvancing = false;

    // Lembra que a automação está ligada entre as aulas
    chrome.storage.local.get(['isRunning'], (res) => {
        if (res && res.isRunning) {
            startBot();
        }
    });

    // Função para avançar para a próxima aula
    function advance() {
        if (isAdvancing) return;
        isAdvancing = true;

        console.log("[Alura Auto-Flow] Concluindo e pulando para a próxima...");

        const nextBtn = document.querySelector(
            '.task-actions-button-next, a.task-actions-button-next, .task-actions-button--next, a[data-qa="next-task-button"], .bootcamp-next-button'
        );

        if (nextBtn) {
            nextBtn.click();
        } else {
            const buttons = Array.from(document.querySelectorAll('a, button'));
            const btn = buttons.find(b => {
                const text = (b.textContent || '').trim().toLowerCase();
                return text.includes('próxima') || text.includes('avançar') || text.includes('continuar');
            });
            if (btn) btn.click();
        }

        // Libera após 2 segundos para a próxima página carregar
        setTimeout(() => {
            isAdvancing = false;
        }, 2500);
    }

    // Loop que executa a cada 1 segundo
    function loop() {
        if (!isRunning || isAdvancing) return;

        const video = document.querySelector('video');

        // 1. SE FOR VÍDEO: Inicia e encerra no mesmo instante!
        if (video) {
            video.muted = true;

            // Dá play para registrar o início no sistema da Alura
            video.play().catch(() => { });
            video.click();

            // No mesmo segundo, joga para o final do vídeo
            if (video.duration) {
                video.currentTime = video.duration;
            }

            // Aguarda menos de 1 segundo para o servidor registrar e avança
            setTimeout(advance, 800);
            return;
        }

        // 2. SE FOR EXERCÍCIO / PERGUNTA: Marca e confirma na hora
        const option = document.querySelector('input[type="radio"], input[type="checkbox"]');
        if (option) {
            if (!option.checked) option.click();
            const confirmBtn = document.querySelector('button.task-actions-button-confirm, button[type="submit"]');
            if (confirmBtn) confirmBtn.click();
            setTimeout(advance, 1000);
            return;
        }

        // 3. SE FOR TEXTO OU PROJETO: Avança quase instantâneo
        setTimeout(advance, 800);
    }

    function startBot() {
        isRunning = true;
        chrome.storage.local.set({ isRunning: true });
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(loop, 1000);
        loop();
    }

    function stopBot() {
        isRunning = false;
        chrome.storage.local.set({ isRunning: false });
        if (intervalId) clearInterval(intervalId);
    }

    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
        if (req.action === 'START') {
            startBot();
            sendResponse({ status: 'started' });
        } else if (req.action === 'STOP') {
            stopBot();
            sendResponse({ status: 'stopped' });
        }
    });
})(); ''