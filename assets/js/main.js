// Atualiza ano do rodapé
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Menu mobile Animado
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuToggle && nav) {
  nav.style.display = '';

  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('nav--open');
    menuToggle.innerHTML = nav.classList.contains('nav--open') ? '✕' : '☰';
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        nav.classList.remove('nav--open');
        menuToggle.innerHTML = '☰';
      }
    });
  });
}

// Scroll suave
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (id && id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

/* ===== Funcionalidade: Copiar Mira CS2 e Valorant ===== */
function setupCopyButton(btnId, codeId, feedbackId) {
  const btn = document.getElementById(btnId);
  const code = document.getElementById(codeId);
  const feedback = document.getElementById(feedbackId);

  if (btn && code && feedback) {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent.trim());
        feedback.textContent = "✓ Código da mira copiado!";
        feedback.style.color = "#10b981"; // Verde
        feedback.classList.add('show');
        
        setTimeout(() => feedback.classList.remove('show'), 2500);
      } catch (err) {
        feedback.textContent = "Erro ao copiar.";
        feedback.style.color = "#ef4444"; // Vermelho
        feedback.classList.add('show');
      }
    });
  }
}

setupCopyButton('btn-copy-crosshair', 'cs2wb-crosshair', 'cs2wb-feedback');
setupCopyButton('btn-copy-val', 'val-crosshair', 'val-feedback');

/* ===== Integração com Lanyard (Discord Status) ===== */
const DISCORD_ID = '310952599757127681';

async function fetchDiscordStatus() {
  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
    const { data } = await response.json();
    
    if (!data) return;

    const pfp = document.getElementById('ds-pfp');
    const decorationEl = document.getElementById('ds-decoration'); // Pega o novo elemento
    const indicator = document.getElementById('ds-indicator');
    const nameEl = document.getElementById('ds-name');
    const activityEl = document.getElementById('ds-activity');

    // 1. Atualiza o Avatar
    if (data.discord_user.avatar) {
      const isAnimated = data.discord_user.avatar.startsWith('a_');
      const extension = isAnimated ? 'gif' : 'png';
      
      pfp.src = `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${data.discord_user.avatar}.${extension}?size=128`;
      pfp.style.display = 'block';
    }

    // 2. Atualiza a Decoração (Moldura)
    if (data.discord_user.avatar_decoration_data) {
      const asset = data.discord_user.avatar_decoration_data.asset;
      // O Discord usa um endpoint específico para decorações
      decorationEl.src = `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=128`;
      decorationEl.style.display = 'block';
    } else {
      // Esconde a moldura caso você tire no Discord
      decorationEl.style.display = 'none';
    }

    nameEl.textContent = data.discord_user.display_name || data.discord_user.username;
    indicator.className = `ds-indicator ${data.discord_status}`;

    let activityText = 'Apenas cochilando'; 
    
    if (data.listening_to_spotify && data.spotify) {
      activityText = `Ouvindo: ${data.spotify.artist} - ${data.spotify.song}`;
    } else if (data.activities && data.activities.length > 0) {
      const mainActivity = data.activities.find(a => a.type !== 4);
      
      if (mainActivity) {
        if (mainActivity.name.toLowerCase().includes("code") || mainActivity.name.toLowerCase().includes("visual studio")) {
          activityText = `Codando em: ${mainActivity.name}`;
        } else {
          activityText = `Jogando: ${mainActivity.name}`;
        }
      } else {
        const customStatus = data.activities.find(a => a.type === 4);
        if (customStatus && customStatus.state) {
          activityText = customStatus.state;
        }
      }
    } else if (data.discord_status === 'offline') {
      activityText = 'Offline no momento';
    }

    activityEl.textContent = activityText;

  } catch (error) {
    console.error('Erro ao buscar o status do Discord:', error);
  }
}

fetchDiscordStatus();
setInterval(fetchDiscordStatus, 10000);


/* ====================================================================== */
/* ===== ENGINE DE NEVE AVANÇADA (Física Interativa + Parallax 3D) ====== */
/* ====================================================================== */
(function advancedSnowEffect() {
  const canvas = document.getElementById('snow');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let flakes = [];
  let isPlaying = true;
  let animationId;
  
  // Variáveis para interação do mouse
  let mouse = { x: -1000, y: -1000, radius: 150 };

  // Rastrear posição do mouse na tela
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Tira o "campo de força" quando o mouse sai da tela
  window.addEventListener('mouseout', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  class Snowflake {
    constructor() {
      this.init();
      // Espalha a neve por toda a tela no carregamento inicial
      this.y = Math.random() * height; 
    }

    init() {
      // Eixo Z determina a profundidade (Parallax). 1 é perto, 3 é fundo.
      this.z = Math.random() * 2 + 0.5; 
      
      this.x = Math.random() * width;
      this.y = -(Math.random() * 50) - 10; // Começa um pouco acima do canvas
      
      // Velocidade base (vetores)
      this.vx = (Math.random() - 0.5) * 0.5; // Vento lateral natural
      this.vy = (Math.random() * 1.5 + 0.5) / this.z; // Velocidade de queda baseada no Z
      
      // Tamanho baseado na profundidade (flocos mais próximos são maiores)
      this.radius = (Math.random() * 2.5 + 1.5) / this.z;
      
      // Oscilação orgânica (como uma folha caindo)
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.05 + 0.01;
    }

    update() {
      // Movimento natural de balanço lateral
      this.wobble += this.wobbleSpeed;
      const sway = Math.sin(this.wobble) * (0.5 / this.z);

      // --- Interação Magnética com o Mouse ---
      let dx = this.x - mouse.x;
      let dy = this.y - mouse.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      // Se o floco estiver dentro do raio de interação do mouse
      if (distance < mouse.radius) {
        // Força diminui quanto mais longe do centro do mouse
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let force = (mouse.radius - distance) / mouse.radius;
        
        // Aplica a força na velocidade (vetores)
        this.vx += forceDirectionX * force * 0.8;
        this.vy += forceDirectionY * force * 0.8;
      }

      // Atrito do ar (Friction) para fazer a neve suavizar após ser empurrada
      this.vx *= 0.95; 
      
      // Limite de velocidade de queda para voltar ao normal depois da repulsão
      const maxVy = (3 / this.z);
      if (this.vy < maxVy) {
        this.vy += 0.03; // Gravidade puxando de volta
      } else if (this.vy > maxVy) {
        this.vy *= 0.95; // Resistência do ar freando a queda livre
      }

      // Atualiza as posições reais do floco
      this.x += this.vx + sway;
      this.y += this.vy;

      // Se saiu da tela, recicla o floco
      if (this.y > height + this.radius || this.x < -50 || this.x > width + 50) {
        this.init();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      
      // Opacidade dinâmica: flocos ao fundo são mais transparentes
      const opacity = Math.max(0.2, 1 - (this.z / 3.5));
      
      // Cor com base no tema (pode ajustar para ficar mais azulado se quiser)
      ctx.fillStyle = `rgba(200, 220, 255, ${opacity})`;
      ctx.fill();
    }
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    
    // Otimização Mobile vs Desktop
    const isMobile = window.innerWidth < 768;
    const flakeCount = isMobile ? 60 : 250; // Quantidade de flocos
    
    // Ajusta o array sem ter que recriar tudo se a tela for apenas redimensionada
    if (flakes.length !== flakeCount) {
      flakes = Array.from({ length: flakeCount }, () => new Snowflake());
    }
  }

  function update() {
    if (!isPlaying) return; 

    // Efeito de rastro leve em vez de limpar tudo instantaneamente (traz sensação de fluidez)
    ctx.clearRect(0, 0, width, height);
    
    for (const flake of flakes) {
      flake.update();
      flake.draw();
    }
    
    animationId = requestAnimationFrame(update);
  }

  window.addEventListener('resize', resize);
  resize();
  update();

  // Performance: Pausa a animação se o usuário rolar para longe do topo 
  // (Pode ajustar caso queira a neve rolando na página inteira)
  const heroSection = document.getElementById('inicio');
  if (heroSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!isPlaying) {
            isPlaying = true;
            update(); 
          }
        } else {
          isPlaying = false;
          cancelAnimationFrame(animationId);
        }
      });
    }, { threshold: 0 }); 
    observer.observe(heroSection);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isPlaying = false;
      cancelAnimationFrame(animationId);
    } else {
      if(heroSection) {
        const rect = heroSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
          isPlaying = true;
          update();
        }
      } else {
          isPlaying = true;
          update();
      }
    }
  });
})();

/* ===== Otimização de Vídeos (Play/Pause no Scroll) ===== */
const optimizeVideos = () => {
  const allVideos = document.querySelectorAll('video');

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.play();
      } else {
        entry.target.pause();
      }
    });
  }, { threshold: 0.1 });

  allVideos.forEach(video => videoObserver.observe(video));
};

document.addEventListener('DOMContentLoaded', optimizeVideos);

/* ===== Alternador de Tema (Dark/Light) ===== */
const themeToggleBtn = document.getElementById('theme-toggle');

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    let targetTheme = theme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('theme', targetTheme);
  });
}