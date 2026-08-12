"""Gera a marcação da galeria elástica.

Seis painéis, um por categoria. As fotos ainda não existem: cada painel
já traz o <img> pronto, com loading, alt e proporção — falta só o src.
"""

TRACO = ('fill="none" stroke="currentColor" stroke-width="1.5" '
         'stroke-linecap="round" stroke-linejoin="round"')

# seta e moldura no mesmo sistema dos ícones das abas
SETA = f'<svg class="galeria__seta" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {TRACO}><path d="M7 17 17 7"/><path d="M8.5 7H17v8.5"/></svg>'
MOLDURA = f'<svg class="galeria__moldura" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {TRACO}><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.6"/><path d="m4.5 17.5 4.7-4.2a1.6 1.6 0 0 1 2.2.05L15 17"/><path d="m13.8 14.6 1.9-1.7a1.6 1.6 0 0 1 2.2.05l1.6 1.6"/></svg>'

PAINEIS = [
    ("01", "Unhas em Gel", "Alongamento e blindagem",
     "Alongamento em gel feito na Lili Esmalteria"),
    ("02", "Unhas Tradicionais", "Mão e pé",
     "Esmaltação tradicional feita na Lili Esmalteria"),
    ("03", "Cílios", "Volume e fox eyes",
     "Extensão de cílios feita na Lili Esmalteria"),
    ("04", "Sobrancelha", "Design e henna",
     "Design de sobrancelha feito na Lili Esmalteria"),
    ("05", "Cabelo", "Escova e cachos",
     "Escova e definição de cachos feitas na Lili Esmalteria"),
    ("06", "Coloração", "Cor e tratamento",
     "Coloração e tratamento capilar feitos na Lili Esmalteria"),
]

ATIVO = "03"   # o terceiro começa ativo, como no original


def montar():
    L = []
    add = L.append
    add('  <section class="galeria" id="galeria" aria-labelledby="galeria-titulo">')
    add('    <h2 class="galeria__titulo" id="galeria-titulo">')
    add('      <span class="mascara"><span class="revela-adiada">Nossos trabalhos</span></span>')
    add('    </h2>')
    add('    <div class="galeria__trilho">')

    for num, titulo, categoria, alt in PAINEIS:
        ativo = "true" if num == ATIVO else "false"
        add(f'      <article class="painel-foto" data-painel="{num}" '
            f'tabindex="0" role="button" aria-pressed="{ativo}" '
            f'aria-label="{titulo}">')
        add('        <div class="painel-foto__midia">')
        add('          <!-- FOTO: inserir o src aqui, ex.: src="assets/img/galeria-'
            + num + '.jpg". Enquanto não houver, o espaço reservado abaixo aparece. -->')
        add(f'          <img class="painel-foto__img" alt="{alt}" '
            f'loading="lazy" decoding="async" width="1200" height="1600">')
        add('          <div class="painel-foto__vazio" aria-hidden="true">'
            + MOLDURA + '</div>')
        add('          <div class="painel-foto__veu" aria-hidden="true"></div>')
        add('        </div>')

        add('        <div class="painel-foto__corpo">')
        add('          <div class="painel-foto__texto">')
        add(f'            <span class="painel-foto__pilula">{categoria}</span>')
        add(f'            <h3 class="painel-foto__nome">{titulo}</h3>')
        add(f'            <span class="painel-foto__chamada">Ver trabalhos {SETA}</span>')
        add('          </div>')
        add(f'          <div class="painel-foto__rotulo" aria-hidden="true">')
        add(f'            <span class="painel-foto__vertical">{titulo}</span>')
        add(f'            <span class="painel-foto__numero">{num}</span>')
        add('          </div>')
        add('        </div>')
        add('      </article>')

    add('    </div>')
    add('  </section>')
    return "\n".join(L)


if __name__ == "__main__":
    print(montar())
