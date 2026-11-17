document.addEventListener('DOMContentLoaded', () => {
    const btnStart = document.getElementById('btnStart');
    const btnStop = document.getElementById('btnStop');
    const statusDiv = document.getElementById('status');

    async function getTab() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab;
    }

    btnStart.addEventListener('click', async () => {
        const tab = await getTab();
        if (tab && tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: 'START' }, () => {
                statusDiv.textContent = 'Status: Executando';
            });
        }
    });

    btnStop.addEventListener('click', async () => {
        const tab = await getTab();
        if (tab && tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: 'STOP' }, () => {
                statusDiv.textContent = 'Status: Parado';
            });
        }
    });
});