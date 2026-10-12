// ── Configuração ──────────────────────────────────────────────
// ID de medição do Google Analytics 4 (ex.: 'G-XXXXXXXXXX').
// Vazio = nenhuma medição e nenhum aviso de cookies.
const GA_ID = '';
const WA_NUMERO = '5586999995655';

// ── Navbar ao rolar ───────────────────────────────────────────
const nav = document.getElementById('navbar');
if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

// ── Animação de entrada ───────────────────────────────────────
if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.fade-in').forEach(el => io.observe(el));
} else {
    document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
}

// ── Medição (Google Analytics 4, só com consentimento) ────────
function lerConsentimento() {
    try { return localStorage.getItem('consentimento-medicao'); } catch (e) { return null; }
}
function salvarConsentimento(valor) {
    try { localStorage.setItem('consentimento-medicao', valor); } catch (e) {}
}
function carregarAnalytics() {
    if (!GA_ID || window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
}
function registrarEvento(nome, params) {
    if (window.gtag) gtag('event', nome, params || {});
}

if (GA_ID) {
    const escolha = lerConsentimento();
    if (escolha === 'sim') {
        carregarAnalytics();
    } else if (escolha === null) {
        const bar = document.createElement('div');
        bar.className = 'cookie-bar';
        bar.setAttribute('role', 'dialog');
        bar.setAttribute('aria-label', 'Aviso de cookies');
        bar.innerHTML = '<p>Usamos cookies de medição para saber quantas pessoas visitam o site e entram em contato. Nenhum dado do seu caso é coletado. <a href="/privacidade/">Política de privacidade</a>.</p>' +
            '<div class="cookie-actions"><button type="button" class="ok">Aceitar</button><button type="button" class="no">Recusar</button></div>';
        document.body.appendChild(bar);
        bar.querySelector('.ok').addEventListener('click', () => { salvarConsentimento('sim'); bar.remove(); carregarAnalytics(); });
        bar.querySelector('.no').addEventListener('click', () => { salvarConsentimento('nao'); bar.remove(); });
    }
}

// Cliques de contato (WhatsApp, e-mail, Instagram) viram eventos
document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const origem = a.dataset.origem || 'outro';
    if (href.includes('wa.me/')) registrarEvento('generate_lead', { method: 'whatsapp', origem: origem, pagina: location.pathname });
    else if (href.startsWith('mailto:')) registrarEvento('contato_email', { origem: origem });
    else if (href.includes('instagram.com')) registrarEvento('clique_instagram', { origem: origem });
    else if (href.includes('google.com/maps')) registrarEvento('como_chegar', { origem: origem });
});

// ── Formulário → WhatsApp ─────────────────────────────────────
const form = document.getElementById('contactForm');
if (form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('fname').value.trim();
        const phone = document.getElementById('fphone').value.trim();
        const area = document.getElementById('farea').value;
        const msg = document.getElementById('fmsg').value.trim();
        if (!name || !phone || !area || !msg) return;
        const text = `Olá, Dr. Leonidys! Me chamo *${name}*.\n\n📱 WhatsApp: ${phone}\n⚖️ Área: ${area}\n📝 Situação: ${msg}`;
        registrarEvento('generate_lead', { method: 'formulario', area: area, pagina: location.pathname });
        window.open('https://wa.me/' + WA_NUMERO + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
}

// ── Rolagem suave para âncoras da mesma página ────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
        const id = this.getAttribute('href');
        if (id.length < 2) return;
        const t = document.querySelector(id);
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); history.replaceState(null, '', id); }
    });
});
