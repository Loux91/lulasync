(function () {
  var WA =
    'https://wa.me/27837195064?text=' +
    encodeURIComponent("Hi LulaSync! I'd like to chat.");

  function botReply(text) {
    var t = (text || '').toLowerCase().trim();
    if (!t) {
      return "Hi — I'm the LulaSync assistant. Ask about websites, WhatsApp ordering, pricing in ZAR, or tap “WhatsApp” for a human.";
    }
    if (/price|cost|how much|zar|r\d|rand/i.test(t)) {
      return 'Pricing is in ZAR and depends on what you need — e.g. websites from around R1,500 setup. Want a tailored quote? Continue on WhatsApp.';
    }
    if (/whatsapp|order|menu|bot|chatbot/i.test(t)) {
      return 'We build WhatsApp ordering flows and AI chatbots for South African businesses. I can route you to WhatsApp for a quick scoping call.';
    }
    if (/grant|ssf|funding|government|govt/i.test(t)) {
      return 'For funding help (e.g. SSF), see our SSF page from the site menu or ask on WhatsApp — we’ll point you in the right direction.';
    }
    if (/hello|hi|hey|howdy|^hii?$/.test(t)) {
      return 'Hello! What are you looking to build — a website, WhatsApp ordering, voice agent, or something custom?';
    }
    if (/contact|email|call|phone|location|johannesburg|braam/i.test(t)) {
      return 'Visit the Contact page for our address, email, and phone — or message us on WhatsApp for the fastest reply.';
    }
    return 'Thanks! For project specifics, WhatsApp is best — a human replies quickly. You can also use the Contact form.';
  }

  function ensureStyles() {
    if (document.getElementById('lula-chat-widget-styles')) return;
    var s = document.createElement('style');
    s.id = 'lula-chat-widget-styles';
    s.textContent =
      '.lula-chat-backdrop{position:fixed;inset:0;background:rgba(10,7,5,.45);z-index:499;display:none}' +
      '.lula-chat-backdrop.open{display:block}' +
      '.lula-chat-panel{position:fixed;bottom:96px;right:24px;width:min(360px,calc(100vw - 32px));max-height:min(440px,70vh);background:#101010;border:1px solid #2a2a2a;border-radius:14px;box-shadow:0 24px 64px rgba(0,0,0,.55);z-index:501;display:none;flex-direction:column;overflow:hidden;font-family:Inter,system-ui,sans-serif}' +
      '.lula-chat-panel.open{display:flex}' +
      '.lula-chat-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:#141414;border-bottom:1px solid #222}' +
      '.lula-chat-head strong{font-size:.85rem;color:#F5EDD8;font-weight:700}' +
      '.lula-chat-head button{background:none;border:none;color:#888;cursor:pointer;font-size:1.1rem;line-height:1;padding:4px}' +
      '.lula-chat-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;font-size:.82rem;line-height:1.45;color:rgba(245,237,216,.88)}' +
      '.lula-chat-msgs .msg-bot,.lula-chat-msgs .msg-user{padding:10px 12px;border-radius:10px;max-width:92%}' +
      '.lula-chat-msgs .msg-bot{background:#1a1a1a;border:1px solid #2a2a2a;align-self:flex-start}' +
      '.lula-chat-msgs .msg-user{background:rgba(240,165,0,.12);border:1px solid rgba(240,165,0,.25);align-self:flex-end;color:#F5EDD8}' +
      '.lula-chat-input-row{display:flex;gap:8px;padding:10px;border-top:1px solid #222;background:#0c0c0c}' +
      '.lula-chat-input-row input{flex:1;background:#161616;border:1px solid #2a2a2a;border-radius:8px;padding:10px 12px;color:#F5EDD8;font-size:.85rem;outline:none}' +
      '.lula-chat-input-row input::placeholder{color:#666}' +
      '.lula-chat-wa{display:block;text-align:center;padding:8px 10px 12px;font-size:.72rem;color:#888}' +
      '.lula-chat-wa a{color:#25D366;font-weight:700;text-decoration:none}' +
      '.chat-float{position:fixed;bottom:24px;right:24px;z-index:500;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 35% 30%,#ffe082,#f0a500 45%,#c67f00);box-shadow:0 0 0 3px rgba(240,165,0,.22),0 10px 36px rgba(0,0,0,.5);transition:transform .2s,box-shadow .2s}' +
      '.chat-float:hover{transform:scale(1.06);box-shadow:0 0 0 4px rgba(240,165,0,.28),0 14px 40px rgba(0,0,0,.55)}' +
      '.chat-float .star{width:20px;height:20px;fill:#0A0705}';
    document.head.appendChild(s);
  }

  function build() {
    ensureStyles();
    var existing = document.querySelector('.chat-float[data-lula-chat]');
    if (existing) return;

    var backdrop = document.createElement('div');
    backdrop.className = 'lula-chat-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');

    var panel = document.createElement('div');
    panel.className = 'lula-chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'LulaSync chat');
    panel.innerHTML =
      '<div class="lula-chat-head"><strong>LulaSync</strong><button type="button" aria-label="Close chat">✕</button></div>' +
      '<div class="lula-chat-msgs" id="lulaChatMsgs"></div>' +
      '<div class="lula-chat-input-row">' +
      '<input type="text" id="lulaChatInput" placeholder="Ask anything…" autocomplete="off" />' +
      '<button type="button" id="lulaChatSend" style="background:#F0A500;color:#0A0705;border:none;font-weight:800;font-size:.75rem;padding:10px 14px;border-radius:8px;cursor:pointer">Send</button></div>' +
      '<div class="lula-chat-wa">Prefer a human? <a href="' +
      WA +
      '" target="_blank" rel="noopener noreferrer">Open WhatsApp →</a></div>';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chat-float';
    btn.setAttribute('data-lula-chat', '1');
    btn.setAttribute('aria-label', 'Open chat');
    btn.innerHTML =
      '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.2 6.8H21l-5.5 4 2.1 6.5L12 15.8 6.4 19.3l2.1-6.5L3 8.8h6.8L12 2z"/></svg>';

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);
    document.body.appendChild(btn);

    var msgs = panel.querySelector('#lulaChatMsgs');
    var input = panel.querySelector('#lulaChatInput');
    var sendBtn = panel.querySelector('#lulaChatSend');
    var closeHead = panel.querySelector('.lula-chat-head button');

    function addMsg(text, who) {
      var d = document.createElement('div');
      d.className = who === 'user' ? 'msg-user' : 'msg-bot';
      d.textContent = text;
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function open() {
      panel.classList.add('open');
      backdrop.classList.add('open');
      if (!msgs.dataset.greeted) {
        addMsg(botReply(''), 'bot');
        msgs.dataset.greeted = '1';
      }
      setTimeout(function () {
        input.focus();
      }, 100);
    }

    function close() {
      panel.classList.remove('open');
      backdrop.classList.remove('open');
    }

    function send() {
      var v = (input.value || '').trim();
      if (!v) return;
      addMsg(v, 'user');
      input.value = '';
      setTimeout(function () {
        addMsg(botReply(v), 'bot');
      }, 350);
    }

    btn.addEventListener('click', function () {
      if (panel.classList.contains('open')) {
        close();
      } else {
        open();
      }
    });
    closeHead.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') send();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
