"""Gera a seção "Onde a gente fica" e o rodapé.

O endereço mora aqui, num lugar só, e alimenta os três usos: o texto na
tela, o mapa incorporado e o link do "Como chegar". Escrever o endereço
três vezes é escrever três chances de ele divergir.
"""

from urllib.parse import quote_plus

from gera_servicos import TRACO
from gera_agendamento import WHATSAPP

# ---------------------------------------------------------------- endereço
RUA = "Avenida Brasil, 322"
BAIRRO = "Centro"
CIDADE = "Itupeva"
UF = "SP"

ENDERECO_BUSCA = f"{RUA} - {BAIRRO}, {CIDADE} - {UF}"

# Mapa incorporado sem chave de API: o output=embed do Google aceita a
# busca crua. O src fica em data-src e só vira src quando a seção chega
# perto da tela — um iframe de mapa carregado no início pesa mais que
# todo o resto da página somado.
MAPA = f"https://www.google.com/maps?q={quote_plus(ENDERECO_BUSCA)}&output=embed"

# Link universal do Google Maps: no celular abre o aplicativo instalado,
# no computador abre no navegador. Não precisa de chave.
COMO_CHEGAR = (
    "https://www.google.com/maps/dir/?api=1&destination="
    + quote_plus(ENDERECO_BUSCA)
)

INSTAGRAM_USUARIO = "_lili_esmalteria"
INSTAGRAM = f"https://www.instagram.com/{INSTAGRAM_USUARIO}/"

ANO = 2026

# ------------------------------------------------------------------ ícones
# Mesmo sistema dos outros: viewBox 24×24, traço 1.5, pontas arredondadas.
ALFINETE = (
    '<path d="M12 21.2c-3.6-4.2-5.5-7.3-5.5-9.7a5.5 5.5 0 0 1 11 0'
    'c0 2.4-1.9 5.5-5.5 9.7Z"/><circle cx="12" cy="11.2" r="2.1"/>'
)

INSTAGRAM_ICONE = (
    '<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4.8"/>'
    '<circle cx="12" cy="12" r="3.9"/>'
    '<path d="M16.9 7.1h.01"/>'
)

SETA_ROTA = (
    '<path d="M20.5 3.5 3.5 10.4l7.2 2.9 2.9 7.2 6.9-17Z"/>'
    '<path d="m10.7 13.3 4.2-4.2"/>'
)

MOLDURA_MAPA = (
    '<rect x="3" y="5" width="18" height="14" rx="2"/>'
    '<path d="M9 5v14"/><path d="M15 7v14"/>'
)


def _icone(classe, corpo, tamanho=24):
    return (f'<svg class="{classe}" viewBox="0 0 {tamanho} {tamanho}" '
            f'aria-hidden="true" focusable="false" {TRACO}>{corpo}</svg>')


def montar_onde():
    L = []
    add = L.append

    add('  <section class="onde" id="onde" aria-labelledby="onde-titulo">')
    add('    <h2 class="onde__titulo" id="onde-titulo">')
    add('      <span class="mascara"><span class="revela-adiada">Onde a gente '
        'fica</span></span>')
    add('    </h2>')
    add('    <p class="onde__apoio">No centro, fácil de chegar.</p>')

    add('    <div class="onde__corpo">')

    # ---------------------------------------------------- lado do endereço
    add('      <div class="endereco entra-adiada">')
    add(f'        <p class="endereco__rua">{RUA}</p>')
    add(f'        <p class="endereco__bairro">{BAIRRO} · {CIDADE}/{UF}</p>')
    add('        <hr class="endereco__filete">')

    add('        <dl class="endereco__dados">')
    add('          <dt class="endereco__rotulo">Horário</dt>')
    add('          <dd class="endereco__valor">')
    add('            <span class="endereco__dias">Segunda a sábado</span>')
    add('            <span class="endereco__horas">8h às 20h</span>')
    add('          </dd>')
    add('          <dt class="endereco__rotulo">Telefone</dt>')
    add('          <dd class="endereco__valor">')
    # TELEFONE: trocar o texto e o href por igual. O href usa só dígitos,
    # com o 55 na frente: tel:+5511XXXXXXXXX.
    add('            <a class="endereco__telefone" href="tel:+5511000000000">'
        '(11) XXXXX-XXXX</a>')
    add('          </dd>')
    add('        </dl>')

    add('        <div class="endereco__botoes">')
    add(f'          <a class="botao botao--linha" href="{COMO_CHEGAR}" '
        'target="_blank" rel="noopener">')
    add('            ' + _icone("botao__icone", SETA_ROTA))
    add('            <span>Como chegar</span>')
    add('          </a>')
    # WHATSAPP: o número entra na constante NUMERO de
    # assets/js/local.js — o mesmo lugar que monta o link do agendamento.
    # Enquanto estiver vazia, o botão não navega.
    add('          <a class="botao whats whats--local" href="#">')
    add('            ' + _icone("whats__icone", WHATSAPP))
    add('            <span>Chamar no WhatsApp</span>')
    add('          </a>')
    add('        </div>')
    add('      </div>')

    # -------------------------------------------------------- lado do mapa
    add('      <div class="mapa entra-adiada">')
    add(f'        <iframe class="mapa__quadro" data-src="{MAPA}" '
        f'title="Mapa com a localização da Lili Esmalteria em {ENDERECO_BUSCA}" '
        'loading="lazy" referrerpolicy="no-referrer-when-downgrade" '
        'allowfullscreen></iframe>')
    add('        <div class="mapa__espera" aria-hidden="true">')
    add('          ' + _icone("mapa__moldura", MOLDURA_MAPA))
    add('        </div>')
    add('      </div>')

    add('    </div>')
    add('  </section>')
    return "\n".join(L)


LINKS = [
    ("Serviços", "#servicos"),
    ("Trabalhos", "#galeria"),
    ("Agendar", "#agendar"),
    ("Onde fica", "#onde"),
]


def montar_rodape():
    L = []
    add = L.append

    add('  <footer class="rodape">')
    add('    <div class="rodape__corpo">')

    # ----------------------------------------------------------- a marca
    add('      <div class="rodape__marca entra-adiada">')
    add('        <img class="rodape__logo" src="assets/img/logo-lili.svg?v=1" '
        'alt="Lili Esmalteria" width="1111" height="752" loading="lazy" '
        'decoding="async">')
    add('        <p class="rodape__lema">Beleza · Estética · Presentes</p>')
    add('      </div>')

    # ------------------------------------------------------------ links
    add('      <nav class="rodape__navegacao entra-adiada" '
        'aria-label="Seções do site">')
    add('        <ul class="rodape__lista">')
    for rotulo, alvo in LINKS:
        add(f'          <li><a class="rodape__link" href="{alvo}">{rotulo}</a></li>')
    add('        </ul>')
    add('      </nav>')

    # ---------------------------------------------------------- contato
    add('      <div class="rodape__contato entra-adiada">')
    add(f'        <a class="rodape__canal" href="{INSTAGRAM}" target="_blank" '
        'rel="noopener">')
    add('          ' + _icone("rodape__icone", INSTAGRAM_ICONE))
    add(f'          <span>@{INSTAGRAM_USUARIO}</span>')
    add('        </a>')
    # WHATSAPP: mesmo número da constante NUMERO em assets/js/local.js.
    add('        <a class="rodape__canal whats-rodape" href="#">')
    add('          ' + _icone("rodape__icone", WHATSAPP))
    add('          <span>WhatsApp</span>')
    add('        </a>')
    add('        <p class="rodape__endereco">')
    add('          ' + _icone("rodape__alfinete", ALFINETE))
    add(f'          <span>{RUA} · {BAIRRO}, {CIDADE}/{UF}</span>')
    add('        </p>')
    add('      </div>')

    add('    </div>')

    add('    <p class="rodape__base">Lili Esmalteria · '
        f'{CIDADE}/{UF} · {ANO}</p>')
    add('  </footer>')
    return "\n".join(L)


def montar():
    return montar_onde() + "\n\n" + montar_rodape()


if __name__ == "__main__":
    print(montar())
