(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobileQuery = window.matchMedia('(max-width: 720px)');

  var GLYPH_POOL = '氢氦锂铍硼碳氮氧氟氖钠镁铝硅磷硫氯氩钾钙钪钛钒铬锰铁钴镍铜锌镓锗砷硒溴氪铷锶钇锆铌钼锝钌铑钯银镉铟锡锑碲碘氙铯钡镧铈镨钕钷钐铕钆铽镝钬铒铥镱镥铪钽钨铼锇铱铂金汞铊铅铋钋砹氡钫镭锕钍镤铀镎钚镅锔锫锎锿镄钔锘铹镆';
  var RAIN_HIRAGANA = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
  var RAIN_KATAKANA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  var RAIN_KANJI = '物語始終永遠無常夢幻影霧雨雪風雲霜露光闇夜朝夕刻時空星月花鳥山水海森火炎土石心魂記憶';
  var RAIN_BAND_START = 10;
  var RAIN_BAND_END = 86;
  var GLYPH_SLOT_COUNT = 3;
  var TRAIL_DOT_COUNT = 8;
  var REVEAL_TARGETS = '.text-body';
  var EASE_STANDARD = 'cubic-bezier(.4,0,.2,1)';

  var PANEL_TITLES = {
    intro: { cn: '悖滅', en: 'ELECIDE' },
    text:  { cn: '文章', en: 'TEXT' },
    fate:  { cn: '抽卡', en: 'FATE' },
    game:  { cn: '游戏', en: 'GAMES' },
    tool:  { cn: '工具', en: 'TOOLS' },
    misc:  { cn: '杂项', en: 'MISC' }
  };

  var SECRET_CARDS = [
    {
      word: 'elecode',
      size: '13vw',
      spacing: '20vw',
      bg: '#ff0000',
      fg: '#ffffff',
      chars: [
        { kanji: '元', en: 'gen.', note: '(001)' },
        { kanji: '素', en: 'so.', note: '(118)' },
      ],
      foot: '元素番號　壹至壹佰壹拾捌'
    },
    {
      word: 'elecide',
      size: '9vw',
      spacing: '6vw',
      bg: '#ffffff',
      fg: '#ff0000',
      chars: [
        { kanji: '元', en: 'gen.', note: '(001)' },
        { kanji: '素', en: 'so.', note: '(118)' },
        { kanji: '悖', en: 'hai.', note: '(119)' },
        { kanji: '滅', en: 'metsu.', note: '(000)' }
      ],
      foot: '元素番號　零零零'
    },
    {
      word: 'monogatari',
      size: '5vw',
      spacing: '10vw',
      bg: '#493d2eff',
      fg: '#ffffff',
      chars: [
        { kanji: '阿', en: 'a.', note: '(02)' },
        { kanji: '良', en: 'ra.', note: '(30)' },
        { kanji: '々', en: '', note: '' },
        { kanji: '木', en: 'ki.', note: '(819)' }
      ],
      foot: '〈物語〉シリーズ'
    }
  ];

  var rainEl = document.getElementById('rain');
  var glyphLeftEl = document.getElementById('glyph-left');
  var glyphRightEl = document.getElementById('glyph-right');
  var threadEl = document.querySelector('.thread');
  var threadPathEl = document.getElementById('thread-path');
  var scanlinesEl = document.getElementById('scanlines');
  var trailEl = document.getElementById('trail');
  var sideNavEl = document.getElementById('side-nav');
  var navToggleEl = document.getElementById('nav-toggle');
  var mobileHeaderEl = document.getElementById('mobile-header');
  var backTopEl = document.getElementById('back-top');
  var curtainEl = document.getElementById('curtain');
  var secretEl = document.getElementById('secret');

  var scrollerEl = document.getElementById('stage');
  var headEl = document.getElementById('chapter-head');
  var headTextEl = document.getElementById('chapter-text');
  var headCnEl = document.getElementById('chapter-cn');
  var headEnEl = document.getElementById('chapter-en');

  var panels = Array.from(document.querySelectorAll('.panel'));
  var navItems = Array.from(document.querySelectorAll('.nav-item'));
  var linkRows = Array.from(document.querySelectorAll('.link-row'));

  var currentPanel = 'intro';
  var navBusy = false;

  function pickChar(pool) {
    return pool.charAt(Math.floor(Math.random() * pool.length));
  }

  function randomRainChar() {
    var roll = Math.random() * 9;
    if (roll < 5) return pickChar(RAIN_HIRAGANA);
    if (roll < 6) return pickChar(RAIN_KATAKANA);
    return pickChar(RAIN_KANJI);
  }

  function randomGlyphRun(length) {
    var out = '';
    for (var i = 0; i < length; i++) {
      out += randomRainChar();
    }
    return out;
  }

  function isMobile() {
    return mobileQuery.matches;
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  function buildRainColumns() {
    rainEl.textContent = '';

    var columnCount = isMobile() ? 3 : 5;
    var bandWidth = (RAIN_BAND_END - RAIN_BAND_START) / columnCount;

    for (var c = 0; c < columnCount; c++) {
      var col = document.createElement('div');
      col.className = 'rain-col';

      var left = RAIN_BAND_START + bandWidth * c + Math.random() * bandWidth * 0.85;
      var duration = 26 + Math.random() * 22;
      var fontSize = 13 + Math.random() * 8;

      col.style.left = left + 'vw';
      col.style.opacity = (0.04 + Math.random() * 0.025).toFixed(3);
      col.style.setProperty('--dur', duration.toFixed(2) + 's');
      col.style.setProperty('--delay', (-Math.random() * duration).toFixed(2) + 's');
      col.style.setProperty('--fs', fontSize.toFixed(1) + 'px');

      var track = document.createElement('div');
      track.className = 'rain-col__track';

      var stripText = randomGlyphRun(64);
      for (var k = 0; k < 2; k++) {
        var strip = document.createElement('span');
        strip.className = 'rain-col__strip';
        strip.textContent = stripText;
        track.appendChild(strip);
      }

      col.appendChild(track);
      rainEl.appendChild(col);
    }
  }

  function randomGlyphSize() {
    return isMobile()
      ? 24 + Math.random() * 14
      : 40 + Math.random() * 32;
  }

  function randomGlyphMotion(inwardSign) {
    var distance = isMobile() ? 3 + Math.random() * 9 : 6 + Math.random() * 30;
    return {
      dx: (inwardSign * distance).toFixed(1) + 'px',
      dy: (-(10 + Math.random() * 38)).toFixed(1) + 'px',
      rot: (Math.random() * 18 - 9).toFixed(1) + 'deg',
      rotEnd: (Math.random() * 22 - 11).toFixed(1) + 'deg'
    };
  }

  function placeFloatGlyph(glyph, slotIndex, inwardSign) {
    var slotHeight = 100 / GLYPH_SLOT_COUNT;

    glyph.style.top = (slotIndex * slotHeight + Math.random() * (slotHeight - 16)).toFixed(2) + 'vh';
    glyph.textContent = pickChar(GLYPH_POOL);

    var motion = randomGlyphMotion(inwardSign);
    glyph.style.setProperty('--dx', motion.dx);
    glyph.style.setProperty('--dy', motion.dy);
    glyph.style.setProperty('--rot', motion.rot);
    glyph.style.setProperty('--rot-end', motion.rotEnd);
  }

  function createFloatGlyph(layerEl, slotIndex, inwardSign) {
    var glyph = document.createElement('span');
    glyph.className = 'float-glyph';
    glyph.dataset.slot = slotIndex;
    glyph.dataset.inward = inwardSign;

    glyph.style.fontSize = randomGlyphSize().toFixed(1) + 'px';
    glyph.style.setProperty('--dur', (11 + Math.random() * 9).toFixed(2) + 's');
    glyph.style.setProperty('--peak', (0.07 + Math.random() * 0.07).toFixed(3));
    glyph.style.animationDelay = (-Math.random() * 18).toFixed(2) + 's';
    placeFloatGlyph(glyph, slotIndex, inwardSign);

    glyph.addEventListener('animationiteration', function () {
      placeFloatGlyph(this, Number(this.dataset.slot), Number(this.dataset.inward));
    });

    layerEl.appendChild(glyph);
  }

  function buildFloatGlyphs() {
    glyphLeftEl.innerHTML = '';
    glyphRightEl.innerHTML = '';

    for (var slot = 0; slot < GLYPH_SLOT_COUNT; slot++) {
      createFloatGlyph(glyphLeftEl, slot, 1);
      createFloatGlyph(glyphRightEl, slot, -1);
    }
  }

  function buildThreadPath() {
    var points = [[50, 0]];
    var y = 0;

    while (y < 1000) {
      y += 55 + Math.random() * 110;
      if (y > 1000) y = 1000;
      points.push([10 + Math.random() * 80, y]);
    }

    var pathData = points.map(function (point, index) {
      return (index === 0 ? 'M' : 'L') +
        point[0].toFixed(1) + ' ' + point[1].toFixed(1);
    }).join(' ');

    threadPathEl.setAttribute('d', pathData);
  }

  function updateThreadReveal() {
    var max = scrollerEl.scrollHeight - scrollerEl.clientHeight;
    var progress = max > 0
      ? Math.min(1, Math.max(0, scrollerEl.scrollTop / max))
      : 1;
    var inset = ((1 - progress) * 100).toFixed(2) + '%';
    threadEl.style.clipPath = 'inset(0 0 ' + inset + ' 0)';
  }

  var trailDots = [];
  var pointerX = window.innerWidth / 2;
  var pointerY = window.innerHeight / 2;
  var headX = pointerX;
  var headY = pointerY;
  var trailStarted = false;
  var trailScheduled = false;

  function scheduleTrailTick() {
    if (prefersReducedMotion || trailScheduled) return;
    trailScheduled = true;
    window.requestAnimationFrame(trailTick);
  }

  function trailTick() {
    var isMoving = Math.abs(pointerX - headX) + Math.abs(pointerY - headY) > 0.2;
    var headStepX = (pointerX - headX) * 0.22;
    var headStepY = (pointerY - headY) * 0.22;
    headX += headStepX;
    headY += headStepY;

    var cursorX = headX;
    var cursorY = headY;

    for (var i = 0; i < trailDots.length; i++) {
      var dot = trailDots[i];
      var deltaX = cursorX - dot.x;
      var deltaY = cursorY - dot.y;

      if (Math.abs(deltaX) + Math.abs(deltaY) > 0.2) isMoving = true;

      dot.x += deltaX * 0.42;
      dot.y += deltaY * 0.42;
      dot.el.style.transform =
        'translate3d(' + dot.x.toFixed(1) + 'px,' + dot.y.toFixed(1) + 'px,0) translate(-50%,-50%)';

      cursorX = dot.x;
      cursorY = dot.y;
    }

    if (isMoving) {
      window.requestAnimationFrame(trailTick);
    } else {
      trailScheduled = false;
    }
  }

  function initTrail() {
    if (prefersReducedMotion || !trailEl) return;

    for (var i = 0; i < TRAIL_DOT_COUNT; i++) {
      var dotEl = document.createElement('div');
      dotEl.className = 'trail__dot';
      var size = 9 - i * 0.72;
      dotEl.style.width = size + 'px';
      dotEl.style.height = size + 'px';
      dotEl.style.opacity = (0.85 - i * 0.085).toFixed(3);
      dotEl.style.transform = 'translate3d(-100px,-100px,0) translate(-50%,-50%)';
      trailEl.appendChild(dotEl);
      trailDots.push({ el: dotEl, x: -100, y: -100 });
    }

    window.addEventListener('mousemove', function (event) {
      pointerX = event.clientX;
      pointerY = event.clientY;

      if (!trailStarted) {
        trailStarted = true;
        headX = pointerX;
        headY = pointerY;
        trailDots.forEach(function (dot) {
          dot.x = pointerX;
          dot.y = pointerY;
        });
      }

      scheduleTrailTick();
    }, { passive: true });
  }

  function buildScanlines() {
    if (!scanlinesEl) return;

    var svgHeight = 1100;
    var svgWidth = 4;
    var rects = [];
    var y = 0;

    while (y < svgHeight) {
      var lineHeight = Math.random() < 0.18 ? 2 : 1;
      var opacity = (0.015 + Math.random() * 0.06).toFixed(3);
      rects.push(
        '<rect x="0" y="' + y +
        '" width="' + svgWidth +
        '" height="' + lineHeight +
        '" fill="rgba(255,255,255,' + opacity + ')"/>'
      );
      y += lineHeight + Math.random() * 5.5 +
        (Math.random() < 0.04 ? Math.random() * 14 : 0);
    }

    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + svgWidth +
      '" height="' + svgHeight + '">' + rects.join('') + '</svg>';

    scanlinesEl.style.backgroundImage =
      'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")';
    scanlinesEl.style.backgroundSize = svgWidth + 'px ' + svgHeight + 'px';
    scanlinesEl.style.backgroundPosition =
      '0 ' + Math.floor(Math.random() * svgHeight) + 'px';
    scanlinesEl.style.opacity = (0.55 + Math.random() * 0.25).toFixed(2);
  }

  function updateNavItems(target) {
    navItems.forEach(function (item) {
      item.classList.toggle('is-active', item.dataset.target === target);
    });
  }

  function setSideNavOpen(open) {
    sideNavEl.classList.toggle('is-open', open);
    navToggleEl.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggleEl.textContent = open ? '✕' : '☰';
  }

  function closeSideNav() {
    setSideNavOpen(false);
  }

  function initSideNavToggle() {
    navToggleEl.addEventListener('click', function (event) {
      event.stopPropagation();
      setSideNavOpen(!sideNavEl.classList.contains('is-open'));
    });
  }

  function scrollToTop(smooth) {
    if (smooth) {
      scrollerEl.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      scrollerEl.scrollTop = 0;
    }
  }

  function splitChars(el) {
    if (el.dataset.split === '1') return;

    var source = el.textContent;
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < source.length; i++) {
      var char = source.charAt(i);
      if (/\s/.test(char)) {
        fragment.appendChild(document.createTextNode(char));
        continue;
      }
      var span = document.createElement('span');
      span.className = 'char';
      span.textContent = char;
      fragment.appendChild(span);
    }

    el.textContent = '';
    el.appendChild(fragment);
    el.dataset.split = '1';
  }

  function revealText(target) {
    if (prefersReducedMotion) return;

    var panel = document.getElementById('panel-' + target);
    if (!panel) return;

    panel.querySelectorAll(REVEAL_TARGETS).forEach(function (el) {
      splitChars(el);
      el.classList.remove('is-revealed');

      var chars = el.querySelectorAll('.char');
      var charTops = new Array(chars.length);
      var i;

      for (i = 0; i < chars.length; i++) {
        charTops[i] = Math.round(chars[i].getBoundingClientRect().top);
      }

      var lineTop = null;
      var lineIndex = -1;

      for (i = 0; i < chars.length; i++) {
        if (charTops[i] !== lineTop) {
          lineTop = charTops[i];
          lineIndex += 1;
        }
        chars[i].style.setProperty('--d', (lineIndex * 0.08 + Math.random() * 0.35).toFixed(3) + 's');
      }

      void el.offsetWidth;
      el.classList.add('is-revealed');
    });
  }

  function updateBackTop() {
    if (!backTopEl) return;
    backTopEl.classList.toggle('is-visible', isMobile() && scrollerEl.scrollTop > 240);
  }

  function markLeaving(panelName) {
    var panel = document.getElementById('panel-' + panelName);
    if (panel) panel.classList.add('is-leaving');
  }

  function applyPanel(target) {
    var isHome = target === 'intro';

    panels.forEach(function (panel) {
      panel.classList.remove('is-leaving');
      panel.classList.toggle('is-active', panel.dataset.panel === target);
    });

    sideNavEl.classList.toggle('is-home', isHome);
    mobileHeaderEl.classList.toggle('is-home', isHome);
    navToggleEl.classList.toggle('is-home', isHome);
    headEl.style.display = isHome ? 'none' : 'flex';

    var title = PANEL_TITLES[target] || { cn: target, en: String(target).toUpperCase() };
    headCnEl.textContent = title.cn;
    headEnEl.textContent = title.en;

    updateNavItems(target);
    updateThreadReveal();
    revealText(target);
    updateBackTop();
  }

  function resetHead() {
    headTextEl.style.transition = 'none';
    headTextEl.style.opacity = '1';
    headEl.style.transition = 'none';
    headEl.style.transform = 'translateX(0)';
  }

  async function curtainIn() {
    curtainEl.style.transition = 'none';
    curtainEl.style.transform = 'translateX(100%)';
    void curtainEl.offsetWidth;
    curtainEl.style.transition = 'transform .38s ' + EASE_STANDARD;
    curtainEl.style.transform = 'translateX(0)';
    await wait(400);
  }

  async function curtainOut() {
    curtainEl.style.transition = 'transform .38s ' + EASE_STANDARD;
    curtainEl.style.transform = 'translateX(-100%)';
    await wait(400);
  }

  async function changeTitle(target) {
    headTextEl.style.transition = 'opacity .18s ease';
    headTextEl.style.opacity = '0';
    await wait(180);

    headEl.style.transition = 'transform .42s ' + EASE_STANDARD;
    headEl.style.transform = 'translateX(-105%)';
    await wait(430);

    applyPanel(target);

    headEl.style.transition = 'none';
    headEl.style.transform = 'translateX(105%)';
    void headEl.offsetWidth;

    headEl.style.transition = 'transform .42s ' + EASE_STANDARD;
    headEl.style.transform = 'translateX(0)';
    await wait(430);

    headTextEl.style.transition = 'opacity .28s ease';
    headTextEl.style.opacity = '1';
    await wait(290);
  }

  async function switchPanel(target) {
    if (navBusy || target === currentPanel) {
      if (isMobile()) closeSideNav();
      return;
    }

    navBusy = true;
    try {
      if (isMobile()) closeSideNav();
      markLeaving(currentPanel);
      scrollToTop(!prefersReducedMotion);

      if (prefersReducedMotion) {
        applyPanel(target);
        resetHead();
        currentPanel = target;
        return;
      }

      var fromHome = currentPanel === 'intro';
      var toHome = target === 'intro';

      if (fromHome || toHome) {
        await curtainIn();
        applyPanel(target);
        resetHead();
        await wait(80);
        await curtainOut();
      } else {
        await changeTitle(target);
      }

      currentPanel = target;
    } finally {
      navBusy = false;
    }
  }

  function bindSwitchers() {
    navItems.forEach(function (item) {
      item.addEventListener('click', function (event) {
        event.preventDefault();
        switchPanel(item.dataset.target);
      });
    });

    linkRows.forEach(function (link) {
      link.addEventListener('click', function (event) {
        if (!link.dataset.target) return;
        event.preventDefault();
        switchPanel(link.dataset.target);
      });
    });

    mobileHeaderEl.addEventListener('click', function () {
      switchPanel('intro');
    });

    backTopEl.addEventListener('click', function () {
      scrollToTop(true);
    });

    document.addEventListener('click', function (event) {
      if (!isMobile() || !sideNavEl.classList.contains('is-open')) return;
      if (sideNavEl.contains(event.target) || navToggleEl.contains(event.target)) return;
      closeSideNav();
    });
  }

  var secretBuffer = '';
  var secretBufferMax = SECRET_CARDS.reduce(function (max, card) {
    return Math.max(max, card.word.length);
  }, 1);

  var secretTimer = null;

  function closeSecret() {
    if (secretTimer) {
      clearTimeout(secretTimer);
      secretTimer = null;
    }
    secretEl.classList.remove('is-open');
    secretEl.innerHTML = '';
    secretEl.style.background = '';
  }

  function showSecretCard(card) {
    var columns = '';

    for (var i = 0; i < card.chars.length; i++) {
      columns +=
        '<div class="secret-card__col">' +
          '<div class="secret-card__kanji">' + card.chars[i].kanji + '</div>' +
          '<div class="secret-card__en">' + card.chars[i].en + '</div>' +
          '<div class="secret-card__note">' + card.chars[i].note + '</div>' +
        '</div>';
    }

    secretEl.style.background = card.bg || '';
    secretEl.innerHTML =
      '<div class="secret-card" style="color:' + (card.fg || '#ffffff') +
             '; --kanji-size:' + (card.size || '32vmin') +
             '; --col-gap:' + (card.spacing || '6vw') + '">' +
        '<div class="secret-card__row">' + columns + '</div>' +
        '<div class="secret-card__foot">' + (card.foot || card.word.toUpperCase()) + '</div>' +
      '</div>';
  }

  function playSecret(card) {
    secretEl.classList.add('is-open');
    showSecretCard(card);
    secretTimer = setTimeout(closeSecret, 700); //物语系列彩蛋页面时间0.7s
  }

  function matchSecretCard(key) {
    secretBuffer = (secretBuffer + key).slice(-secretBufferMax);

    for (var i = 0; i < SECRET_CARDS.length; i++) {
      var word = SECRET_CARDS[i].word;
      if (secretBuffer.slice(-word.length) === word) {
        secretBuffer = '';
        return SECRET_CARDS[i];
      }
    }
    return null;
  }

  function initSecret() {
    if (isMobile()) return;

    window.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeSecret();
        return;
      }

      var key = event.key.length === 1 ? event.key.toLowerCase() : '';
      if (!key || secretEl.classList.contains('is-open')) return;

      var card = matchSecretCard(key);
      if (card) playSecret(card);
    });

    secretEl.addEventListener('click', closeSecret);
  }

  function initExternalLinks() {
    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (/^(https?:|\/\/)/i.test(href)) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    });
  }

  var scrollScheduled = false;

  function onScrollTick() {
    updateThreadReveal();
    updateBackTop();
    scrollScheduled = false;
  }

  function initScroll() {
    scrollerEl.addEventListener('scroll', function () {
      if (scrollScheduled) return;
      scrollScheduled = true;
      window.requestAnimationFrame(onScrollTick);
    }, { passive: true });
  }

  var lastMobileState = isMobile();
  var resizeTimer = null;

  function onResize() {
    updateThreadReveal();
    updateBackTop();

    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      var nowMobile = isMobile();
      if (nowMobile !== lastMobileState) {
        lastMobileState = nowMobile;
        buildRainColumns();
        buildFloatGlyphs();
        revealText(currentPanel);
      }
    }, 200);
  }

  document.addEventListener('visibilitychange', function () {
    document.documentElement.classList.toggle('is-paused', document.hidden);
  });

  buildRainColumns();
  buildFloatGlyphs();
  buildThreadPath();
  buildScanlines();
  initTrail();
  initSideNavToggle();
  initSecret();
  initScroll();
  bindSwitchers();
  initExternalLinks();

  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('load', updateThreadReveal);

  window.requestAnimationFrame(function () {
    updateThreadReveal();
    revealText(currentPanel);
  });

})();
