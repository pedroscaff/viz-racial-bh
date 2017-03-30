import pandas as pd

data = pd.read_csv('./fixtures/Pessoa03_MG.csv', ';', na_values='X')
max_values = []
min_values = []
for idx, c in enumerate(('V002', 'V003', 'V004', 'V005', 'V006')):
    max_values.append(max(data[c]))
    min_values.append(min(data[c]))

data = data.assign(statsV002=pd.Series([min_values[0], max_values[0]]))
data = data.assign(statsV003=pd.Series([min_values[1], max_values[1]]))
data = data.assign(statsV004=pd.Series([min_values[2], max_values[2]]))
data = data.assign(statsV005=pd.Series([min_values[3], max_values[3]]))
data = data.assign(statsV006=pd.Series([min_values[4], max_values[4]]))

data.to_csv('./fixtures/parsed.csv', sep=';', encoding='utf-8')
