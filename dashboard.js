// Dashboard - Atualização Automática via Nuvem (Versão Nuvem Sem Servidor)
(function () {
  const form = document.getElementById("manual-form");
  const empty = document.getElementById("empty-state");
  const grid = document.getElementById("stat-grid");
  const lastBox = document.getElementById("last-update");
  const lastTime = document.getElementById("last-update-time");

  let ignorarTinkercadAte = 0;

  const els = {
    lumValue: document.getElementById("lum-value"),
    lumHint:  document.getElementById("lum-hint"),
    lumIcon:  document.getElementById("lum-icon"),
    umiValue: document.getElementById("umi-value"),
    umiHint:  document.getElementById("umi-hint"),
    umiIcon:  document.getElementById("umi-icon"),
    tempValue: document.getElementById("temp-value"),
    tempHint:  document.getElementById("temp-hint"),
    tempIcon:  document.getElementById("temp-icon"),
    regaValue: document.getElementById("rega-value"),
    regaHint:  document.getElementById("rega-hint"),
    regaIcon:  document.getElementById("rega-icon"),
  };

  function setIconTone(el, tone) {
    el.classList.remove("warning", "success", "muted");
    if (tone) el.classList.add(tone);
  }

  function render(reading) {
    empty.classList.add("hidden");
    grid.classList.remove("hidden");
    lastBox.classList.remove("hidden");

    els.lumValue.textContent = reading.luminosidade;
    const lumLow = reading.luminosidade < 30;
    els.lumHint.textContent = lumLow ? "Baixa" : "OK";
    setIconTone(els.lumIcon, lumLow ? "warning" : null);

    els.umiValue.textContent = reading.umidade;
    const umiLow = reading.umidade < 30;
    els.umiHint.textContent = umiLow ? "Seco" : "Adequada";
    setIconTone(els.umiIcon, umiLow ? "warning" : "success");

    els.tempValue.textContent = reading.temperatura;
    const tempBad = reading.temperatura > 32 || reading.temperatura < 10;
    els.tempHint.textContent = tempBad ? "Atenção" : "Estável";
    setIconTone(els.tempIcon, tempBad ? "warning" : null);

    els.regaValue.textContent = reading.rega_ativa ? "Ativada" : "Desativada";
    els.regaHint.textContent  = reading.rega_ativa ? "Em funcionamento" : "Em espera";
    setIconTone(els.regaIcon, reading.rega_ativa ? "success" : "muted");

    lastTime.textContent = new Date().toLocaleString("pt-BR");
    try { localStorage.setItem("last-reading", JSON.stringify(reading)); } catch (e) {}
  }

  // 🔥 ESCUTA EM TEMPO REAL VINDA DA NUVEM (Versão Corrigida para CORS)
  function conectarAoFluxoDaNuvem() {
    // Adicionamos /json no final para o servidor mandar dados puros fáceis de ler
    const eventSource = new EventSource("https://ntfy.sh/arduinoods_a3_sensores/json");
    
    eventSource.onmessage = (event) => {
      if (Date.now() < ignorarTinkercadAte) return;
      
      try {
        const dadosNtfy = JSON.parse(event.data);
        
        // O ntfy envelopa nossa mensagem dentro do campo .event e coloca o texto em .message
        if (dadosNtfy.event === "message" && dadosNtfy.message) {
          // Decodifica a string JSON que o Tinkercad mandou
          const reading = JSON.parse(dadosNtfy.message);
          
          if (reading._origem === "tinkercad") {
            console.log("📥 Dados recebidos da nuvem com sucesso!", reading);
            render(reading);
          }
        }
      } catch (e) {
        // Ignora mensagens vazias ou de conexão que o servidor envia para manter o canal aberto
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      // Se a conexão piscar, ele tenta reabrir em 3 segundos
      setTimeout(conectarAoFluxoDaNuvem, 3000);
    };
  }

    eventSource.onerror = () => {
      eventSource.close();
      // Tenta reconectar se a rede cair
      setTimeout(conectarAoFluxoDaNuvem, 5000);
    };
  }

  // Inicializa a escuta online
  conectarAoFluxoDaNuvem();

  // Carrega leitura anterior se existir
  try {
    const saved = localStorage.getItem("last-reading");
    if (saved) render(JSON.parse(saved));
  } catch (e) {}

  // Envio manual
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    ignorarTinkercadAte = Date.now() + 15000;

    const reading = {
      luminosidade: Number(document.getElementById("in-lum").value),
      umidade:      Number(document.getElementById("in-umi").value),
      temperatura:  Number(document.getElementById("in-temp").value),
      rega_ativa:   document.getElementById("in-rega").value === "true",
      _origem:      "manual"
    };
    render(reading);
  });
})();