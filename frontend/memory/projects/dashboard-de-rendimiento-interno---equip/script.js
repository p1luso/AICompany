document.addEventListener('DOMContentLoaded', () => {
    const dashboardContainer = document.getElementById('dashboard-container');

    // Datos ficticios de los agentes (este objeto JSON vendría de una API real)
    const agentsData = {
        "agents": [
            {
                "name": "Agente 1",
                "metrics": {
                    "tasa_de_acierto": 0.95,
                    "tiempo_medio_resolucion": 30.5,
                    "número_deErrores": 2
                }
            },
            {
                "name": "Agente 2",
                "metrics": {
                    "tasa_de_acierto": 0.92,
                    "tiempo_medio_resolucion": 40.1,
                    "número_deErrores": 3
                }
            },
            {
                "name": "Agente 3",
                "metrics": {
                    "tasa_de_acierto": 0.91,
                    "tiempo_medio_resolucion": 35.7,
                    "número_deErrores": 4
                }
            },
            {
                "name": "Agente 4",
                "metrics": {
                    "tasa_de_acierto": 0.98,
                    "tiempo_medio_resolucion": 25.0,
                    "número_deErrores": 1
                }
            },
            {
                "name": "Agente 5",
                "metrics": {
                    "tasa_de_acierto": 0.88,
                    "tiempo_medio_resolucion": 45.2,
                    "número_deErrores": 5
                }
            }
        ]
    };

    function renderAgentCards(data) {
        dashboardContainer.innerHTML = ''; // Limpiar cualquier contenido existente
        data.agents.forEach(agent => {
            const agentCard = document.createElement('div');
            agentCard.classList.add('agent-card');

            const agentName = document.createElement('h2');
            agentName.textContent = agent.name;
            agentCard.appendChild(agentName);

            const metricsList = document.createElement('div');
            metricsList.classList.add('metrics-list');

            for (const [key, value] of Object.entries(agent.metrics)) {
                const metricItem = document.createElement('div');
                metricItem.classList.add('metric-item');

                const metricName = document.createElement('strong');
                metricName.textContent = formatMetricName(key);
                metricItem.appendChild(metricName);

                const metricValue = document.createElement('span');
                metricValue.textContent = formatMetricValue(key, value);
                metricItem.appendChild(metricValue);

                metricsList.appendChild(metricItem);
            }
            agentCard.appendChild(metricsList);
            dashboardContainer.appendChild(agentCard);
        });
    }

    function formatMetricName(name) {
        // Convierte snake_case a un formato más legible
        return name.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }

    function formatMetricValue(key, value) {
        switch (key) {
            case 'tasa_de_acierto':
                return (value * 100).toFixed(2) + '%';
            case 'tiempo_medio_resolucion':
                return value.toFixed(1) + ' min';
            case 'número_deErrores':
                return value;
            default:
                return value;
        }
    }

    // Renderizar las tarjetas de agentes al cargar la página
    renderAgentCards(agentsData);
});