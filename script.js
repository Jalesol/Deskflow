
// ==========================================
// DESKFLOW - SISTEMA DE GERENCIAMENTO DE TI
// ==========================================

// ELEMENTOS DO HTML

const newTicketBtn = document.getElementById("newTicketBtn");
const ticketModal = document.getElementById("ticketModal");
const closeModalBtn = document.getElementById("closeModal");
const cancelModalBtn = document.getElementById("cancelModal");
const ticketForm = document.getElementById("ticketForm");
const ticketsList = document.getElementById("ticketsList");

const searchTicket = document.getElementById("searchTicket");
const statusFilter = document.getElementById("statusFilter");

const ticketTitle = document.getElementById("ticketTitle");
const ticketUser = document.getElementById("ticketUser");
const ticketDescription = document.getElementById("ticketDescription");
const ticketCategory = document.getElementById("ticketCategory");
const ticketPriority = document.getElementById("ticketPriority");

// INDICADORES DO DASHBOARD

const totalTickets = document.getElementById("totalTickets");
const pendingTickets = document.getElementById("pendingTickets");
const progressTickets = document.getElementById("progressTickets");
const resolvedTickets = document.getElementById("resolvedTickets");

// ELEMENTOS DOS GRÁFICOS

const statusCanvas = document.getElementById("statusChart");
const priorityCanvas = document.getElementById("priorityChart");

let statusChart = null;
let priorityChart = null;

// ==========================================
// ARMAZENAMENTO DOS CHAMADOS
// ==========================================

function loadTickets() {
    try {
        const savedTickets = localStorage.getItem("deskflow_tickets");

        if (!savedTickets) {
            return [];
        }

        const parsedTickets = JSON.parse(savedTickets);

        return Array.isArray(parsedTickets) ? parsedTickets : [];

    } catch (error) {
        console.error("Erro ao carregar chamados:", error);
        return [];
    }
}

let tickets = loadTickets();

// SALVAR CHAMADOS

function saveTickets() {
    try {
        localStorage.setItem(
            "deskflow_tickets",
            JSON.stringify(tickets)
        );

        return true;

    } catch (error) {
        console.error("Erro ao salvar chamados:", error);

        alert("Não foi possível salvar os chamados no navegador.");

        return false;
    }
}

// ==========================================
// MODAL
// ==========================================

function openTicketModal() {
    ticketModal.classList.add("show");
    ticketTitle.focus();
}

function closeTicketModal() {
    ticketModal.classList.remove("show");
    ticketForm.reset();
}

// ==========================================
// CRIAR CHAMADO
// ==========================================

function createTicket(event) {
    event.preventDefault();

    const title = ticketTitle.value.trim();
    const user = ticketUser.value.trim();
    const description = ticketDescription.value.trim();
    const category = ticketCategory.value;
    const priority = ticketPriority.value;

    if (!title || !user || !description || !category || !priority) {
        alert("Preencha todos os campos antes de continuar.");
        return;
    }

    const newTicket = {
        id: Date.now(),
        title,
        user,
        description,
        category,
        priority,
        status: "Pendente",
        createdAt: new Date().toLocaleString("pt-BR")
    };

    tickets.unshift(newTicket);

    if (!saveTickets()) {
        tickets.shift();
        return;
    }

    renderTickets();
    closeTicketModal();

    alert("Chamado criado com sucesso!");
}

// ==========================================
// ATUALIZAR DASHBOARD
// ==========================================

function updateDashboard() {
    const pending = tickets.filter(
        ticket => ticket.status === "Pendente"
    ).length;

    const inProgress = tickets.filter(
        ticket => ticket.status === "Em andamento"
    ).length;

    const resolved = tickets.filter(
        ticket => ticket.status === "Resolvido"
    ).length;

    totalTickets.textContent = tickets.length;
    pendingTickets.textContent = pending;
    progressTickets.textContent = inProgress;
    resolvedTickets.textContent = resolved;
}

// ==========================================
// PROTEGER CONTEÚDO HTML
// ==========================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];
    });
}

// ==========================================
// PESQUISA E FILTROS
// ==========================================

function filterTickets() {
    const searchValue = searchTicket.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;

    return tickets.filter(ticket => {
        const title = String(ticket.title || "").toLowerCase();
        const user = String(ticket.user || "").toLowerCase();
        const description = String(ticket.description || "").toLowerCase();

        const matchesSearch =
            title.includes(searchValue) ||
            user.includes(searchValue) ||
            description.includes(searchValue);

        const matchesStatus =
            selectedStatus === "Todos" ||
            ticket.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });
}

// ==========================================
// GRÁFICO DE CHAMADOS POR STATUS
// ==========================================

function initializeStatusChart() {
    if (typeof Chart === "undefined" || !statusCanvas) {
        console.error("Chart.js ou elemento do gráfico de status não encontrado.");
        return;
    }

    statusChart = new Chart(statusCanvas, {
        type: "doughnut",

        data: {
            labels: [
                "Pendentes",
                "Em andamento",
                "Resolvidos"
            ],

            datasets: [{
                data: [0, 0, 0],

                backgroundColor: [
                    "#ffb020",
                    "#1677ff",
                    "#00e5ff"
                ],

                borderColor: "#111d30",
                borderWidth: 4,
                hoverOffset: 8
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom",

                    labels: {
                        color: "#f1f5f9",
                        padding: 20,
                        usePointStyle: true
                    }
                },

                tooltip: {
                    enabled: true
                }
            },

            cutout: "65%"
        }
    });
}

// ==========================================
// GRÁFICO DE CHAMADOS POR PRIORIDADE
// ==========================================

function initializePriorityChart() {
    if (typeof Chart === "undefined" || !priorityCanvas) {
        console.error("Chart.js ou elemento do gráfico de prioridade não encontrado.");
        return;
    }

    priorityChart = new Chart(priorityCanvas, {
        type: "bar",

        data: {
            labels: [
                "Baixa",
                "Média",
                "Alta"
            ],

            datasets: [{
                label: "Quantidade de chamados",

                data: [0, 0, 0],

                backgroundColor: [
                    "#00e5ff",
                    "#1677ff",
                    "#ff4d67"
                ],

                borderRadius: 8,
                borderSkipped: false,
                maxBarThickness: 55
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    enabled: true
                }
            },

            scales: {
                x: {
                    ticks: {
                        color: "#8493a8"
                    },

                    grid: {
                        display: false
                    }
                },

                y: {
                    beginAtZero: true,

                    ticks: {
                        color: "#8493a8",
                        precision: 0,
                        stepSize: 1
                    },

                    grid: {
                        color: "rgba(255, 255, 255, 0.07)"
                    }
                }
            }
        }
    });
}

// ==========================================
// ATUALIZAR DADOS DOS GRÁFICOS
// ==========================================

function updateCharts() {
    const statusCounts = {
        pending: tickets.filter(
            ticket => ticket.status === "Pendente"
        ).length,

        progress: tickets.filter(
            ticket => ticket.status === "Em andamento"
        ).length,

        resolved: tickets.filter(
            ticket => ticket.status === "Resolvido"
        ).length
    };

    const priorityCounts = {
        low: tickets.filter(
            ticket => ticket.priority === "Baixa"
        ).length,

        medium: tickets.filter(
            ticket => ticket.priority === "Média"
        ).length,

        high: tickets.filter(
            ticket => ticket.priority === "Alta"
        ).length
    };

    // Atualizar gráfico de status

    if (statusChart) {
        statusChart.data.datasets[0].data = [
            statusCounts.pending,
            statusCounts.progress,
            statusCounts.resolved
        ];

        statusChart.update();
    }

    // Atualizar gráfico de prioridade

    if (priorityChart) {
        priorityChart.data.datasets[0].data = [
            priorityCounts.low,
            priorityCounts.medium,
            priorityCounts.high
        ];

        priorityChart.update();
    }
}

// ==========================================
// EXIBIR CHAMADOS
// ==========================================

function renderTickets() {
    updateDashboard();
    updateCharts();

    const filteredTickets = filterTickets();

    if (filteredTickets.length === 0) {
        if (tickets.length === 0) {
            ticketsList.innerHTML = `
                <div class="empty-state">
                    <h3>Nenhum chamado cadastrado</h3>
                    <p>Comece criando seu primeiro chamado de TI.</p>
                </div>
            `;
        } else {
            ticketsList.innerHTML = `
                <div class="empty-state">
                    <h3>Nenhum resultado encontrado</h3>
                    <p>Tente alterar a pesquisa ou o filtro de status.</p>
                </div>
            `;
        }

        return;
    }

    ticketsList.innerHTML = filteredTickets.map(ticket => `
        <div class="ticket-card">

            <h3>${escapeHTML(ticket.title)}</h3>

            <p>
                <strong>Solicitante:</strong>
                ${escapeHTML(ticket.user)}
            </p>

            <p>
                <strong>Categoria:</strong>
                ${escapeHTML(ticket.category)}
            </p>

            <p>
                <strong>Prioridade:</strong>
                ${escapeHTML(ticket.priority)}
            </p>

            <p>
                <strong>Descrição:</strong>
                ${escapeHTML(ticket.description)}
            </p>

            <p>
                <strong>Data:</strong>
                ${escapeHTML(ticket.createdAt)}
            </p>

            <p>
                <strong>Status:</strong>
            </p>

            <select
                class="ticket-status"
                data-id="${ticket.id}"
                aria-label="Alterar status do chamado"
            >
                <option value="Pendente"
                    ${ticket.status === "Pendente" ? "selected" : ""}>
                    Pendente
                </option>

                <option value="Em andamento"
                    ${ticket.status === "Em andamento" ? "selected" : ""}>
                    Em andamento
                </option>

                <option value="Resolvido"
                    ${ticket.status === "Resolvido" ? "selected" : ""}>
                    Resolvido
                </option>
            </select>

            <button
                type="button"
                class="delete-ticket"
                data-id="${ticket.id}"
            >
                Excluir
            </button>

        </div>
    `).join("");
}

// ==========================================
// ALTERAR STATUS
// ==========================================

function changeStatus(id, newStatus) {
    const validStatuses = [
        "Pendente",
        "Em andamento",
        "Resolvido"
    ];

    if (!validStatuses.includes(newStatus)) {
        return;
    }

    const ticket = tickets.find(
        item => item.id === id
    );

    if (!ticket) {
        return;
    }

    const previousStatus = ticket.status;

    ticket.status = newStatus;

    if (!saveTickets()) {
        ticket.status = previousStatus;
        renderTickets();
        return;
    }

    renderTickets();
}

// ==========================================
// EXCLUIR CHAMADO
// ==========================================

function deleteTicket(id) {
    const confirmed = confirm(
        "Tem certeza que deseja excluir este chamado?"
    );

    if (!confirmed) {
        return;
    }

    const previousTickets = [...tickets];

    tickets = tickets.filter(
        ticket => ticket.id !== id
    );

    if (!saveTickets()) {
        tickets = previousTickets;
        renderTickets();
        return;
    }

    renderTickets();
}

// ==========================================
// EVENTOS DOS CHAMADOS
// ==========================================

ticketsList.addEventListener("change", event => {
    if (event.target.classList.contains("ticket-status")) {
        const id = Number(event.target.dataset.id);
        const newStatus = event.target.value;

        changeStatus(id, newStatus);
    }
});

ticketsList.addEventListener("click", event => {
    if (event.target.classList.contains("delete-ticket")) {
        const id = Number(event.target.dataset.id);

        deleteTicket(id);
    }
});

// ==========================================
// EVENTOS DE PESQUISA E FILTRO
// ==========================================

searchTicket.addEventListener("input", renderTickets);

statusFilter.addEventListener("change", renderTickets);

// ==========================================
// EVENTOS DO MODAL
// ==========================================

newTicketBtn.addEventListener("click", openTicketModal);

closeModalBtn.addEventListener("click", closeTicketModal);

cancelModalBtn.addEventListener("click", closeTicketModal);

ticketModal.addEventListener("click", event => {
    if (event.target === ticketModal) {
        closeTicketModal();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeTicketModal();
    }
});

// ==========================================
// ENVIO DO FORMULÁRIO
// ==========================================

ticketForm.addEventListener("submit", createTicket);

// ==========================================
// INICIALIZAÇÃO DO SISTEMA
// ==========================================

initializeStatusChart();
initializePriorityChart();

renderTickets();

console.log("DeskFlow iniciado com sucesso!");
console.log("Gráficos e relatórios inicializados!");
