"""Gera o SVG do leque Art Déco da cartela de cores.

Geometria em coordenadas do usuário; o vértice (rebite) fica na base e o
tecido abre num arco de 150 graus. Cada gomo é um caminho próprio,
identificado, para receber cor individual.
"""
import math

# Rebite. O viewBox começa em 0 0 de propósito: com
# transform-box: view-box, o transform-origin do CSS conta a partir
# do canto do viewBox, então qualquer deslocamento aqui tiraria o
# eixo de giro do lugar e os gomos abririam tortos.
PX, PY = 460.0, 465.0
R = 440.0                  # raio externo do tecido
R_IN = 0.50 * R            # borda interna do tecido
R_HASTE = 0.14 * R         # onde as varetas nascem, junto ao rebite
A1, A2 = 15.0, 165.0       # arco de 150 graus, simétrico na vertical
N = 12
PASSO = (A2 - A1) / N
RECUO = 9.0               # quanto a emenda recua no topo (festonado)
BOJO = 4.5                 # quanto o meio do gomo avança no topo

CORES = [
    ("#C8102E", "Vermelho clássico"), ("#6E1423", "Vinho"),
    ("#D4A59A", "Rosé"),              ("#F4C2C2", "Rosa bebê"),
    ("#F5F0E8", "Branco leitoso"),    ("#14100E", "Preto ônix"),
    ("#1B2A4A", "Azul marinho"),      ("#0F5C4A", "Verde esmeralda"),
    ("#9B7EBD", "Lilás"),             ("#FF6F5E", "Coral"),
    ("#FFC06A", "Pêssego"),           ("#D95A21", "Ferrugem"),
]


def p(ang, r):
    """Ponto no ângulo (graus, anti-horário) e raio r. y cresce para baixo."""
    a = math.radians(ang)
    return (PX + r * math.cos(a), PY - r * math.sin(a))


def n(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def xy(pt):
    return f"{n(pt[0])} {n(pt[1])}"


def borda_topo(a_ini, a_fim, r):
    """Borda superior festonada: recua nas emendas e faz bojo no meio.

    Percorrida de a_fim para a_ini (sentido horário na tela), fechando o
    contorno do gomo.
    """
    ini = p(a_fim, r - RECUO)
    c1 = p(a_fim - PASSO * 0.22, r + BOJO)
    c2 = p(a_ini + PASSO * 0.22, r + BOJO)
    fim = p(a_ini, r - RECUO)
    return f"L {xy(ini)} C {xy(c1)} {xy(c2)} {xy(fim)}"


def gomo(i):
    a_ini = A1 + i * PASSO
    a_fim = a_ini + PASSO
    # borda interna, de a_ini para a_fim (anti-horário na tela: sweep 0)
    d = (f"M {xy(p(a_ini, R_IN))} "
         f"A {n(R_IN)} {n(R_IN)} 0 0 0 {xy(p(a_fim, R_IN))} "
         f"{borda_topo(a_ini, a_fim, R)} Z")
    return d


def vareta(ang):
    """Vareta fina sob a emenda, do pé até a ponta do tecido."""
    return (f"M {xy(p(ang, R_HASTE))} L {xy(p(ang, R - RECUO))}")


def guarda(ang, lado):
    """Guarda lateral: mais larga que as varetas e ornamentada."""
    larg_pe, larg_topo = 8.0, 13.0
    perp = ang + 90 * lado
    def desloca(pt, d, a):
        rad = math.radians(a)
        return (pt[0] + d * math.cos(rad), pt[1] - d * math.sin(rad))
    pe_i = desloca(p(ang, R_HASTE * 0.55), larg_pe, perp)
    pe_e = desloca(p(ang, R_HASTE * 0.55), -larg_pe, perp)
    tp_i = desloca(p(ang, R + 10), larg_topo, perp)
    tp_e = desloca(p(ang, R + 10), -larg_topo, perp)
    corpo = f"M {xy(pe_i)} L {xy(tp_i)} L {xy(tp_e)} L {xy(pe_e)} Z"
    # losango ornamental a dois terços da guarda
    c = p(ang, R * 0.72)
    d1 = desloca(c, 9, perp); d2 = desloca(c, -9, perp)
    d3 = p(ang, R * 0.72 + 17); d4 = p(ang, R * 0.72 - 17)
    losango = f"M {xy(d1)} L {xy(d3)} L {xy(d2)} L {xy(d4)} Z"
    # duas ranhuras
    ranhuras = []
    for f in (0.42, 0.52):
        q1 = desloca(p(ang, R * f), 6, perp)
        q2 = desloca(p(ang, R * f), -6, perp)
        ranhuras.append(f"M {xy(q1)} L {xy(q2)}")
    return corpo, losango, ranhuras


def filete(r):
    """Filete dourado acompanhando a curva do arco."""
    return (f"M {xy(p(A1, r))} A {n(r)} {n(r)} 0 0 0 {xy(p(A2, r))}")


def montar():
    L = []
    add = L.append
    add('<svg class="leque" viewBox="0 0 920 512" '
        'xmlns="http://www.w3.org/2000/svg" role="group" '
        'aria-label="Leque com doze cores de esmalte">')

    # verniz: sombra junto à base do tecido e brilho perto da borda
    add('<defs>'
        '<radialGradient id="verniz" gradientUnits="userSpaceOnUse" '
        f'cx="{n(PX)}" cy="{n(PY)}" r="{n(R)}">'
        '<stop offset="0.50" stop-color="#000" stop-opacity="0.42"/>'
        '<stop offset="0.63" stop-color="#000" stop-opacity="0.10"/>'
        '<stop offset="0.74" stop-color="#fff" stop-opacity="0.10"/>'
        '<stop offset="0.88" stop-color="#fff" stop-opacity="0.30"/>'
        '<stop offset="0.97" stop-color="#fff" stop-opacity="0.04"/>'
        '</radialGradient>'
        '</defs>')

    # guarda esquerda fica parada: é sobre ela que os gomos se empilham
    corpo, losango, ranhuras = guarda(A2, +1)
    add(f'<g class="leque__guarda"><path d="{corpo}"/>'
        f'<path class="leque__ornato" d="{losango}"/>'
        + "".join(f'<path class="leque__ranhura" d="{r}"/>' for r in ranhuras)
        + '</g>')

    for i, (cor, nome) in enumerate(CORES):
        a_ini = A1 + i * PASSO
        # posição empilhada: gira até encostar na guarda esquerda
        rot = round(a_ini - (A2 - PASSO), 2)
        add(f'<g class="gomo" data-abre data-ordem="{i}" '
            f'style="--rot:{rot}deg" data-rot="{rot}" '
            f'data-cor="{cor}" data-nome="{nome}" tabindex="0" '
            f'role="button" aria-pressed="false" aria-label="{nome}">')
        add(f'<path class="gomo__tecido" d="{gomo(i)}" fill="{cor}"/>')
        add(f'<path class="gomo__verniz" d="{gomo(i)}" fill="url(#verniz)"/>')
        add(f'<path class="gomo__foco" d="{gomo(i)}"/>')
        add(f'<path class="leque__vareta" d="{vareta(a_ini)}"/>')
        add('</g>')

    # guarda direita acompanha o último gomo a abrir
    corpo, losango, ranhuras = guarda(A1, -1)
    rot = round(A1 - (A2 - PASSO), 2)
    add(f'<g class="leque__guarda" data-abre data-ordem="12" '
        f'style="--rot:{rot}deg" data-rot="{rot}">'
        f'<path d="{corpo}"/><path class="leque__ornato" d="{losango}"/>'
        + "".join(f'<path class="leque__ranhura" d="{r}"/>' for r in ranhuras)
        + '</g>')

    # filetes dourados no arco
    add(f'<path class="leque__filete" d="{filete(R - RECUO - 16)}"/>')
    add(f'<path class="leque__filete leque__filete--fino" d="{filete(R - RECUO - 30)}"/>')
    add(f'<path class="leque__filete" d="{filete(R_IN + 9)}"/>')

    # rebite
    add(f'<g class="leque__rebite">'
        f'<circle cx="{n(PX)}" cy="{n(PY)}" r="26"/>'
        f'<circle class="leque__rebite-miolo" cx="{n(PX)}" cy="{n(PY)}" r="15"/>'
        f'<circle class="leque__rebite-luz" cx="{n(PX - 5)}" cy="{n(PY - 6)}" r="4"/>'
        f'</g>')

    add('</svg>')
    return "\n".join(L)


if __name__ == "__main__":
    print(montar())
