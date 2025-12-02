// ====================================================
// VARIÁVEIS GLOBAIS DE SERVIÇO E MAPA
// ====================================================
// Variáveis controladas pela função initMap no index.html:
// let map;
let userMarker;
let userPosition = { lat: 0, lng: 0 }; 
let directionsService;
let directionsRenderer;

// ====================================================
// ELEMENTOS DA INTERFACE (DOM)
// ====================================================
const searchOverlay = document.getElementById('search-overlay');
const confirmationOverlay = document.getElementById('confirmation-overlay');
const inputDestino = document.getElementById('input-destino');
const btnChamar = document.getElementById('btn-chamar');
const btnConfirmar = document.getElementById('btn-confirmar');
const btnCancelar = document.getElementById('btn-cancelar');

// ====================================================
// FUNÇÕES DE INICIALIZAÇÃO
// ====================================================

// Inicializa a API do Google Maps Services (DirectionsService e Renderer)
function initializeMapsServices() {
    // Verifica se a classe google.maps está disponível antes de tentar usar
    if (typeof google === 'object' && typeof google.maps === 'object') {
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
            map: map, 
            suppressMarkers: true, // Não queremos os marcadores padrão A e B
            polylineOptions: {
                strokeColor: '#FF5722', // Cor da rota (Laranja Contigo na Via)
                strokeOpacity: 0.8,
                strokeWeight: 6
            }
        });
    } else {
        console.error("Erro: A biblioteca do Google Maps não foi carregada corretamente.");
    }
}

// ----------------------------------------------------
// OBTENÇÃO DE LOCALIZAÇÃO E ENDEREÇO
// ----------------------------------------------------
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                map.setCenter(userPosition);
                map.setZoom(16);
                
                // Adiciona ou atualiza o marcador do usuário
                if (!userMarker) {
                     userMarker = new google.maps.Marker({
                        position: userPosition,
                        map: map,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: 'blue',
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: 'white'
                        },
                        title: 'Você está aqui'
                    });
                } else {
                    userMarker.setPosition(userPosition);
                }

                reverseGeocode(userPosition);
                initializeMapsServices(); 
            },
            () => {
                // Caso a permissão seja negada ou haja erro
                console.warn('Permissão de localização negada ou erro. Usando localização padrão.');
                initializeMapsServices();
            }
        );
    } else {
        console.error('Seu dispositivo não suporta geolocalização.');
        initializeMapsServices();
    }
}

// Obtém o endereço a partir da Latitude/Longitude
function reverseGeocode(latLng) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results[0]) {
            document.getElementById('input-origem').value = results[0].formatted_address;
        } else {
            document.getElementById('input-origem').value = 'Endereço não encontrado';
        }
    });
}

// ====================================================
// CÁLCULO DE TARIFA E ROTA
// ====================================================
function calculateFare(distanceMeters, timeSeconds) {
    // LÓGICA DE PRECIFICAÇÃO: AJUSTE ESTES VALORES!
    const TARIFA_BASE = 6.00; 
    const CUSTO_POR_KM = 2.80; 
    const CUSTO_POR_MINUTO = 0.60; 

    const distanceKm = distanceMeters / 1000;
    const timeMinutes = timeSeconds / 60;

    const fare = TARIFA_BASE + 
                 (distanceKm * CUSTO_POR_KM) + 
                 (timeMinutes * CUSTO_POR_MINUTO);
                 
    return fare.toFixed(2);
}

// ----------------------------------------------------
// INICIALIZAÇÃO DA LÓGICA DO APLICATIVO (Event Listeners)
// ----------------------------------------------------
function initAppLogic() {
    // Listener do Botão Chamar (Calcula Rota e Preço)
    btnChamar.addEventListener('click', () => {
        const destino = inputDestino.value.trim();
        
        if (userPosition.lat === 0 || destino === "") {
            alert("Aguarde a localização ou informe o destino.");
            return;
        }

        const request = {
            origin: userPosition,
            destination: destino,
            travelMode: google.maps.TravelMode.TWO_WHEELER, // Modo moto!
            unitSystem: google.maps.UnitSystem.METRIC
        };

        btnChamar.textContent = "Calculando...";
        btnChamar.disabled = true;

        directionsService.route(request, (response, status) => {
            btnChamar.textContent = "Ver Preço & Chamar";
            btnChamar.disabled = false;
            
            if (status === 'OK') {
                const route = response.routes[0].legs[0];
                const precoEstimado = calculateFare(route.distance.value, route.duration.value);
                
                directionsRenderer.setDirections(response);

                // Atualiza a interface
                document.getElementById('detalhe-origem').textContent = route.start_address;
                document.getElementById('detalhe-destino').textContent = route.end_address;
                document.querySelector('.price-estimate').textContent = `R$ ${precoEstimado}`;
                
                // Remove detalhe antigo e insere novo
                document.querySelector('.route-details')?.remove();
                document.querySelector('.price-estimate').insertAdjacentHTML('afterend', 
                    `<p class="route-details">${route.distance.text} (${route.duration.text})</p>`);

                // Transição para a tela de confirmação
                searchOverlay.classList.remove('active');
                searchOverlay.classList.add('hidden');
                confirmationOverlay.classList.remove('hidden');
                confirmationOverlay.classList.add('active');

            } else {
                window.alert('Não foi possível calcular a rota. Erro: ' + status);
            }
        });
    });

    // Listener do Botão Cancelar (Volta para a tela de busca)
    btnCancelar.addEventListener('click', () => {
        directionsRenderer.setDirections({ routes: [] }); // Limpa a rota do mapa

        confirmationOverlay.classList.remove('active');
        confirmationOverlay.classList.add('hidden');
        searchOverlay.classList.remove('hidden');
        searchOverlay.classList.add('active');
    });

    // Listener do Botão Confirmar (Simula a chamada do motorista)
    btnConfirmar.addEventListener('click', () => {
        alert('Motorista Contigo na Via chamado! (A próxima etapa seria a tela de status)');
        
        // Simular a conclusão da corrida e retornar ao estado inicial
        setTimeout(() => {
            directionsRenderer.setDirections({ routes: [] }); 
            confirmationOverlay.classList.remove('active');
            confirmationOverlay.classList.add('hidden');
            searchOverlay.classList.remove('hidden');
            searchOverlay.classList.add('active');
        }, 4000);
    });
}