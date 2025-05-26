let synth = window.speechSynthesis;
let voices = [];
let utterance;
let isDarkMode = false;

function carregarVozes() {
  voices = synth.getVoices();
  const select = document.getElementById("voz");
  select.innerHTML = "";
  voices.forEach((voz, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${voz.name} (${voz.lang})`;
    if (voz.lang.startsWith("pt")) option.selected = true;
    select.appendChild(option);
  });
}

synth.onvoiceschanged = carregarVozes;

function calcularTempo() {
  const texto = document.getElementById("texto").value.trim();
  const velocidade = parseInt(document.getElementById("velocidade").value);
  const palavras = texto.split(/\s+/).filter(Boolean).length;
  
  if (palavras === 0) {
    document.getElementById("resultado").textContent = "Digite um texto para calcular o tempo";
    document.getElementById("progressFill").style.width = "0%";
    return;
  }
  
  const minutos = palavras / velocidade;
  const minutosInt = Math.floor(minutos);
  const segundos = Math.round((minutos - minutosInt) * 60);
  
  document.getElementById("resultado").textContent = 
    `Tempo estimado: ${minutosInt} min ${segundos} seg (${palavras} palavras)`;
  atualizarBarra(minutos);
}

function atualizarContagem() {
  const texto = document.getElementById("texto").value.trim();
  const palavras = texto.split(/\s+/).filter(Boolean).length;
  document.getElementById("palavrasContadas").textContent = `Palavras: ${palavras}`;
  
  if (palavras > 0) {
    calcularTempo();
  }
}

function lerTexto() {
  const texto = document.getElementById("texto").value.trim();
  if (!texto) {
    alert("Por favor, insira um texto para ler.");
    return;
  }
  
  pararLeitura();
  utterance = new SpeechSynthesisUtterance(texto);
  utterance.voice = voices[document.getElementById("voz").value];
  utterance.rate = parseFloat(document.getElementById("falaVelocidade").value);
  
  utterance.onboundary = function(event) {
    const progresso = (event.charIndex / texto.length) * 100;
    document.getElementById("progressFill").style.width = `${progresso}%`;
  };
  
  utterance.onend = function() {
    document.getElementById("progressFill").style.width = "100%";
  };
  
  synth.speak(utterance);
}

function pausarLeitura() {
  if (synth.speaking) {
    if (!synth.paused) {
      synth.pause();
    } else {
      synth.resume();
    }
  }
}

function pararLeitura() {
  synth.cancel();
  document.getElementById("progressFill").style.width = "0%";
}

function exportarTexto() {
  const texto = document.getElementById("texto").value;
  if (!texto.trim()) {
    alert("Não há texto para exportar.");
    return;
  }
  
  const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "locucao.txt";
  a.click();
}

function alternarTema() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle("escuro");
  const temaToggle = document.getElementById("temaToggle");
  temaToggle.textContent = isDarkMode ? "☀️ Modo Claro" : "🌙 Modo Escuro";
  localStorage.setItem("temaEscuro", isDarkMode);
}

function atualizarBarra(minutos) {
  let percent = Math.min((minutos / 5) * 100, 100);
  document.getElementById("progressFill").style.width = percent + "%";
}

window.onload = function() {
  carregarVozes();
  atualizarContagem();
  
  // Verificar tema salvo
  isDarkMode = localStorage.getItem("temaEscuro") === "true";
  if (isDarkMode) {
    document.body.classList.add("escuro");
    document.getElementById("temaToggle").textContent = "☀️ Modo Claro";
  }
};

function limparCampos() {
  document.getElementById("texto").value = "";
  document.getElementById("velocidade").value = 150;
  document.getElementById("falaVelocidade").value = 1;
  document.getElementById("velocidadeValue").textContent = "1";
  document.getElementById("resultado").textContent = "";
  document.getElementById("palavrasContadas").textContent = "Palavras: 0";
  document.getElementById("progressFill").style.width = "0%";
  pararLeitura();
}