document.addEventListener("DOMContentLoaded", () => {
    fetchSyncData();
    setInterval(fetchSyncData, 120000); // Atualiza a cada 120 segundos
});

const apiUrl = 'http://45.7.24.52:1432/v1/logapp';
const authToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJDTU0gU0lTVEVNQVMiLCJzdWIiOiI5OTkiLCJ1c3VhcmlvIjoiY21tc2lzdGVtYXMiLCJpYXQiOjE2ODQxOTgzODl9.Maq9pYVZpPnkPoVAEbBsmweQ76h6v_yT6pKuqqdHpJE';

async function fetchSyncData() {
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
            }
        });

        if (response.ok) {
            const data = await response.json();
            const records = data.data;
            updateTable(records);
        } else {
            console.error('Failed to fetch sync data');
        }
    } catch (error) {
        console.error('Error fetching sync data:', error);
    }
}

function updateTable(records) {
    const tableContainer = document.getElementById('data-table-container');
    tableContainer.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    thead.innerHTML = `
        <tr>
            <th>Cliente</th>
            <th>CNPJ</th>
            <th>Última Sincronização</th>
            <th>Versão Banco</th>
            <th>Data Versão</th>
            <th>Data Backup</th>
            <th>Status</th>
        </tr>
    `;

    records.forEach(record => {
        const recordDateTime = parseDateTime(record['datahora']);
        const now = new Date();
        const differenceInMinutes = Math.floor((now - recordDateTime) / 60000);
        const isSynced = differenceInMinutes <= 5;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record['cliente'] || 'Valor não disponível'}</td>
            <td>${record['cnpj'] || 'Valor não disponível'}</td>
            <td>${formatDateTime(recordDateTime)}</td>
            <td>${record['verbanco']}</td>
            <td>${record['dataversao']}</td>
            <td>${record['databackup']}</td>
            <td>${getSyncStatusIcon(isSynced)}</td>
        `;

        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

function parseDateTime(dateTimeString) {
    const [datePart, timePart] = dateTimeString.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes, seconds] = timePart.split(':');
    return new Date(year, month - 1, day, hours, minutes, seconds);
}

function formatDateTime(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function getSyncStatusIcon(isSynced) {
    return isSynced
        ? '<span class="status-icon" style="color: blue;">✔️</span>'
        : '<span class="status-icon" style="color: red;">❌</span>';
}
