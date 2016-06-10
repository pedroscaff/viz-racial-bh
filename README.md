Analise e visualização de dados abertos do GOV
=================================

### Objetivo

Objetivo inicialmente exploratório, a ideia é criar facilitadores para análise dos dados. Mais pra frente talvez um site com resultados de análises.

Um exemplo prático é um script criado que pega um csv gerado por esse serviço de [prestação de contas do tse](http://inter01.tse.jus.br/spceweb.consulta.receitasdespesas2014), remove os caracteres não utf-8 dos nomes das colunas e remove os ```R$``` e os ```.``` da coluna ```Valor```, o que facilita análise para qualquer ferramenta, incluindo a biblioteca ```d3.js```, que está sendo utilizada para gerar visualizações.

### Utilização

Para usuários não técnicos, os dados estarão sempre disponíveis na pasta dados. Para os que quiserem colaborar com desenvolvimento ou simplesmente quiserem acompanhar as novidades rodando os scripts localmente, a ferramenta base é [nodejs](https://nodejs.org). Para rodar as visualizações no browser, a ferramenta utilizada é ```python -m SimpleHTTPServer``` para servir os arquivos.

#### Instalação

```
git clone https://github.com/pedrin1001/analise_dados_gov
npm install
npm start # inicia o servidor python
```

Para rodar os  demais scripts que forem criados, consultar o ```package.json```.
