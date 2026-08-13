"""Gera a marcação da seção de agendamento.

Os seis cartões de categoria e a lista de serviços de cada uma saem da
mesma fonte da seção de preços — ABAS e ICONES de gera_servicos. Assim
não existe uma segunda cópia da tabela para envelhecer sozinha: mudou o
preço ou o nome lá, muda aqui.
"""

from gera_servicos import ABAS, ICONES, TRACO

SETA = (f'<svg class="cartao__seta" viewBox="0 0 24 24" aria-hidden="true" '
        f'focusable="false" {TRACO}><path d="m7 10 5 5 5-5"/></svg>')

# Bolha com rabicho e o fone dentro, no mesmo sistema dos outros ícones:
# viewBox 24×24, traço 1.5, pontas arredondadas, sem preenchimento.
WHATSAPP = (
    '<path d="M20.6 11.7a8.4 8.4 0 0 1-12.4 7.4l-4.5 1.4 1.4-4.4'
    'A8.4 8.4 0 1 1 20.6 11.7Z"/>'
    '<path d="M9.5 9.1c.3-.6.9-.7 1.3-.4.4.3.7.8.9 1.3.1.4 0 .8-.3 1'
    'l-.4.3c.5 1 1.3 1.8 2.3 2.3l.3-.4c.2-.3.6-.4 1-.3.5.2 1 .5 1.3.9'
    '.3.4.2 1-.4 1.3-.6.4-1.4.4-2.1.1a7.5 7.5 0 0 1-3.9-3.9'
    'c-.3-.7-.3-1.5.1-2.2Z"/>'
)

# rótulo curto na pílula, forma longa na frase do WhatsApp
DIAS = [
    ("Segunda", "segunda-feira"),
    ("Terça", "terça-feira"),
    ("Quarta", "quarta-feira"),
    ("Quinta", "quinta-feira"),
    ("Sexta", "sexta-feira"),
    ("Sábado", "sábado"),
]

# o salão atende das 8h às 20h; as faixas abaixo cobrem esse intervalo
PERIODOS = [
    ("Manhã", "manhã", "das 8h às 12h"),
    ("Tarde", "tarde", "das 12h às 17h"),
    ("Noite", "noite", "das 17h às 20h"),
]

ETAPAS = ["Serviço", "Quando", "Confirmar"]


def _passo(numero, corpo, com_resumo=True):
    """Envelope de um passo: o resumo recolhido e o corpo aberto ocupam
    a mesma célula do grid, então um entra exatamente onde o outro
    estava. A altura de fora é escrita pelo JS só durante a troca."""
    L = []
    add = L.append
    oculto = "" if numero == 1 else " hidden"
    add(f'      <div class="passo" data-passo="{numero}"{oculto}>')
    if com_resumo:
        add(f'        <button class="passo__resumo" type="button" hidden>')
        add('          <span class="passo__filete" aria-hidden="true"></span>')
        add('          <span class="passo__resumo-texto"></span>')
        add('          <span class="passo__trocar">Trocar</span>')
        add('        </button>')
    add('        <div class="passo__corpo">')
    L.extend(corpo)
    add('        </div>')
    add('      </div>')
    return L


def montar():
    L = []
    add = L.append

    add('  <section class="agendamento" id="agendar" aria-labelledby="agendamento-titulo">')
    add('    <h2 class="agendamento__titulo" id="agendamento-titulo">')
    add('      <span class="mascara"><span class="revela-adiada">Agende seu horário</span></span>')
    add('    </h2>')
    add('    <p class="agendamento__apoio">Três toques e a gente já sabe o que '
        'você precisa.</p>')

    # --- indicador de progresso ---
    # Traços finos, sem número e sem círculo: a etapa se anuncia pelo
    # preenchimento do filete e pelo rótulo. aria-current diz ao leitor
    # de tela onde a visitante está.
    add('    <ol class="progresso entra-adiada">')
    for i, rotulo in enumerate(ETAPAS, start=1):
        estado = "atual" if i == 1 else "futura"
        atual = ' aria-current="step"' if i == 1 else ""
        add(f'      <li class="progresso__marca" data-estado="{estado}"{atual}>')
        add('        <span class="progresso__traco" aria-hidden="true"></span>')
        add(f'        <span class="progresso__rotulo">{rotulo}</span>')
        add('      </li>')
    add('    </ol>')

    add('    <div class="passos entra-adiada">')

    # ------------------------------------------------ passo 1: o serviço
    p1 = []
    p1.append('          <p class="passo__pergunta" id="pergunta-servico">Qual '
              'serviço você quer?</p>')
    p1.append('          <div class="escolha">')
    p1.append('            <div class="cartoes">')
    for chave, rotulo, _ in ABAS:
        p1.append(f'              <button class="cartao" type="button" '
                  f'id="agenda-cat-{chave}" data-foco="foco-{chave}">')
        p1.append(f'                <svg class="cartao__icone" viewBox="0 0 24 24" '
                  f'aria-hidden="true" focusable="false" {TRACO}>{ICONES[chave]}</svg>')
        p1.append(f'                <span class="cartao__nome">{rotulo}</span>')
        p1.append('                <span class="cartao__acao">'
                  '<span class="cartao__acao-texto">Escolher</span>'
                  + SETA + '</span>')
        p1.append('              </button>')
    p1.append('            </div>')

    # Escolhida a categoria, as outras cinco somem: no lugar da grade
    # entra uma linha compacta com o ícone e o nome, e os serviços logo
    # abaixo dela. Com os seis cartões na tela, a lista nascia embaixo de
    # três fileiras e caía fora da tela.
    for chave, rotulo, itens in ABAS:
        p1.append(f'            <div class="foco" id="foco-{chave}" '
                  f'role="region" aria-label="{rotulo}" hidden>')
        p1.append('              <button class="categoria" type="button" '
                  f'data-cartao="agenda-cat-{chave}">')
        p1.append(f'                <svg class="categoria__icone" viewBox="0 0 24 24" '
                  f'aria-hidden="true" focusable="false" {TRACO}>{ICONES[chave]}</svg>')
        p1.append(f'                <span class="categoria__nome">{rotulo}</span>')
        p1.append('                <span class="categoria__trocar">Trocar</span>')
        p1.append('              </button>')
        p1.append('              <div class="pilulas">')
        for nome, _valor in itens:
            p1.append('                <button class="pilula" type="button" '
                      f'aria-pressed="false" data-servico="{nome}">{nome}</button>')
        p1.append('              </div>')
        p1.append('            </div>')
    p1.append('          </div>')

    L.extend(_passo(1, p1))

    # -------------------------------------------------- passo 2: quando
    p2 = []
    p2.append('          <p class="passo__pergunta">Que dia fica melhor?</p>')
    p2.append('          <div class="pilulas pilulas--dias">')
    for curto, longo in DIAS:
        p2.append('            <button class="pilula" type="button" '
                  f'aria-pressed="false" data-dia="{curto}" '
                  f'data-longo="{longo}">{curto}</button>')
    p2.append('          </div>')
    p2.append('          <p class="passo__pergunta passo__pergunta--segunda">Em '
              'que período?</p>')
    p2.append('          <div class="pilulas pilulas--periodos">')
    for curto, longo, faixa in PERIODOS:
        p2.append('            <button class="pilula pilula--periodo" type="button" '
                  f'aria-pressed="false" data-periodo="{curto}" '
                  f'data-longo="{longo}">')
        p2.append(f'              <span class="pilula__nome">{curto}</span>')
        p2.append(f'              <span class="pilula__hora">{faixa}</span>')
        p2.append('            </button>')
    p2.append('          </div>')
    p2.append('          <p class="agendamento__expediente">Atendemos das 8h às 20h.</p>')
    L.extend(_passo(2, p2))

    # ----------------------------------------------- passo 3: confirmar
    p3 = []
    p3.append('          <p class="confirma__resumo">')
    p3.append('            <span class="confirma__item" data-campo="servico"></span>')
    p3.append('            <span class="confirma__losango" aria-hidden="true"></span>')
    p3.append('            <span class="confirma__item" data-campo="dia"></span>')
    p3.append('            <span class="confirma__losango" aria-hidden="true"></span>')
    p3.append('            <span class="confirma__item" data-campo="periodo"></span>')
    p3.append('          </p>')
    # DESTINO: o href fica vazio de propósito. O número entra na
    # constante NUMERO de assets/js/agendamento.js, e o texto sai pronto
    # de montarMensagem() — nada mais precisa ser escrito aqui.
    p3.append('          <a class="botao whats" href="#">')
    p3.append(f'            <svg class="whats__icone" viewBox="0 0 24 24" '
              f'aria-hidden="true" focusable="false" {TRACO}>{WHATSAPP}</svg>')
    p3.append('            <span>Chamar no WhatsApp</span>')
    p3.append('          </a>')
    p3.append('          <p class="confirma__nota">Você fala direto com a gente. '
              'Sem cadastro.</p>')
    L.extend(_passo(3, p3, com_resumo=False))

    add('    </div>')
    add('  </section>')
    return "\n".join(L)


if __name__ == "__main__":
    print(montar())
