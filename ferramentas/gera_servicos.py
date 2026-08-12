"""Gera a marcação da seção de serviços e preços.

Os seis ícones são desenhados aqui, no mesmo sistema: viewBox 24×24,
traço 1.5, pontas e junções arredondadas, sem preenchimento. Manter esse
sistema é o que faz os seis parecerem da mesma mão.
"""

TRACO = 'fill="none" stroke="currentColor" stroke-width="1.5" ' \
        'stroke-linecap="round" stroke-linejoin="round"'

ICONES = {
    # unha alongada, com um brilho de quatro pontas ao lado
    "gel": '<path d="M9.7 20.6c-.5-3.6-.8-7.2-.3-10.8.3-2.3 1.2-3.6 2.6-3.6s2.3 1.3 2.6 3.6c.5 3.6.2 7.2-.3 10.8-1.5.4-3.1.4-4.6 0Z"/>'
           '<path d="M18.6 4.2l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6Z"/>',
    # vidro de esmalte com o pincel saindo da tampa
    "tradicional": '<path d="M8.6 11.4h6.8v7.1a2 2 0 0 1-2 2h-2.8a2 2 0 0 1-2-2v-7.1Z"/>'
                   '<path d="M10.6 8.8h2.8v2.6h-2.8V8.8Z"/>'
                   '<path d="M12 8.8V6.2"/>'
                   '<path d="M10.9 3.4h2.2l-.6 2.8h-1l-.6-2.8Z"/>',
    # olho com os cílios em curva
    "cilios": '<path d="M3.4 13.6c3-3.9 5.9-5.8 8.6-5.8s5.6 1.9 8.6 5.8"/>'
              '<path d="M3.4 13.6c3 2.6 5.9 3.9 8.6 3.9s5.6-1.3 8.6-3.9"/>'
              '<path d="M6.2 8.6 4.7 6.2"/><path d="M9.4 6.9 8.6 4.3"/>'
              '<path d="M12 6.4V3.7"/><path d="M14.6 6.9l.8-2.6"/>'
              '<path d="M17.8 8.6l1.5-2.4"/>',
    # arco de sobrancelha, afinando na ponta
    "sobrancelha": '<path d="M3.6 15.2c4.3-4.6 9.1-7 14.4-7.2 1.5 0 2.4.6 2.4 1.5 0 1-1 1.7-2.9 2.1-4.8 1-9.5 2.2-13.9 3.6Z"/>',
    # mecha ondulada, duas linhas paralelas
    "cabelo": '<path d="M8.4 3.2c-2.6 3.4 2.4 5.2 0 8.8-2.4 3.6 2 5.2.6 8.8"/>'
              '<path d="M14.6 3.2c-2.6 3.4 2.4 5.2 0 8.8-2.4 3.6 2 5.2.6 8.8"/>',
    # tesoura em linha fina
    "tesoura": '<circle cx="7.3" cy="18.2" r="2.3"/><circle cx="16.7" cy="18.2" r="2.3"/>'
               '<path d="M8.9 16.5 17.4 4.2"/><path d="M15.1 16.5 6.6 4.2"/>',
}

ABAS = [
    ("gel", "Unhas em Gel", [
        ("Alongamento molde F1", "130"),
        ("Blindagem + esmaltação em gel (mão)", "85"),
        ("Blindagem + esmaltação em gel (pé)", "85"),
        ("Pé + mão em gel", "155"),
        ("Manutenção até 30 dias", "90"),
        ("Manutenção após 30 dias", "100"),
        ("Remoção", "50"),
    ]),
    ("tradicional", "Unhas Tradicionais", [
        ("Mão", "45"), ("Pé", "45"), ("Mão + pé", "80"),
        ("Remoção + tratamento", "80"), ("Tratamento", "65"),
    ]),
    ("cilios", "Cílios", [
        ("Volume brasileiro", "150"), ("Volume egípcio", "140"),
        ("Volume híbrido", "150"), ("Fox eyes", "150"),
        ("Boneca", "140"), ("Manutenção", "100"),
    ]),
    ("sobrancelha", "Sobrancelha", [
        ("Design simples", "45"), ("Design com henna", "55"),
    ]),
    ("cabelo", "Cabelo", [
        ("Escova", "60"), ("Escova + hidratação", "65"),
        ("Escova + hidratação + acidificação", "80"),
        ("Escova + hidratação + prancha", "80"),
        ("Definição de cachos", "60"),
    ]),
    ("tesoura", "Coloração e Tratamento", [
        ("Retoque de raiz", "60"), ("Coloração profissional", "80"),
        ("Botox", "130"), ("Corte", "60"),
    ]),
]


def montar():
    L = []
    add = L.append
    add('  <section class="servicos" id="servicos" aria-labelledby="servicos-titulo">')
    add('    <h2 class="servicos__titulo" id="servicos-titulo">')
    add('      <span class="mascara"><span class="revela-adiada">Nossos serviços</span></span>')
    add('    </h2>')

    # Grade de escolha: as seis categorias visíveis de uma vez, sem
    # preço nenhum na tela e nada selecionado. Classe própria de reveal,
    # e não a .revela da abertura — aquela é liberada pela trava de 5s
    # daquela timeline, o que mostraria este bloco antes do scroll.
    add('    <div class="mascara">')
    add('      <div class="cartoes revela-adiada">')
    for chave, rotulo, _ in ABAS:
        add(f'        <button class="cartao" type="button" id="cartao-{chave}" '
            f'aria-expanded="false" aria-controls="painel-{chave}">')
        add(f'          <svg class="cartao__icone" viewBox="0 0 24 24" aria-hidden="true" '
            f'focusable="false" {TRACO}>{ICONES[chave]}</svg>')
        add(f'          <span class="cartao__nome">{rotulo}</span>')
        add('        </button>')
    add('      </div>')
    add('    </div>')

    # painéis
    add('    <div class="servicos__paineis">')
    # todos começam fechados: o primeiro momento é o de escolher
    for chave, rotulo, itens in ABAS:
        add(f'      <div class="painel" id="painel-{chave}" role="region" '
            f'aria-labelledby="cartao-{chave}" hidden>')
        add('        <ul class="preco">')
        for nome, valor in itens:
            # a observação entre parênteses sai do nome e vira um span
            # próprio, para receber corpo menor e cor mais discreta
            nota = ""
            if "(" in nome:
                nome, resto = nome.split("(", 1)
                nome = nome.rstrip()
                nota = f' <span class="preco__nota">({resto.rstrip(")")})</span>'
            add('          <li class="preco__linha">'
                f'<span class="preco__nome">{nome}{nota}</span>'
                '<span class="preco__filete" aria-hidden="true"></span>'
                '<span class="preco__valor">'
                '<span class="preco__moeda">R$</span>'
                f'<span class="preco__numero">{valor}</span></span></li>')
        add('        </ul>')
        add('      </div>')
    add('    </div>')
    add('  </section>')
    return "\n".join(L)


if __name__ == "__main__":
    print(montar())
