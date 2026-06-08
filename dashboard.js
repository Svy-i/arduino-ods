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
    // Adicionando /sse no final, o ntfy libera o cabeçalho CORS que o Firefox exige!
    const eventSource = new EventSource("https://ntfy.sh/arduinoods_a3_sensores/sse");
    
    eventSource.onmessage = (event) => {
      if (Date.now() < ignorarTinkercadAte) return;
      
      try {
        const dadosNtfy = JSON.parse(event.data);
        
        // No formato /sse, o texto enviado fica dentro do campo .message
        if (dadosNtfy.message) {
          // Decodifica o JSON interno que o Violentmonkey enviou
          const reading = JSON.parse(dadosNtfy.message);
          
          if (reading._origem === "tinkercad") {
            console.log("📥 Dados recebidos com sucesso!", reading);
            render(reading);
          }
        }
      } catch (e) {
        // Ignora mensagens de controle do ntfy
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      // Tenta reconectar em 4 segundos se a rede cair
      setTimeout(conectarAoFluxoDaNuvem, 4000);
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