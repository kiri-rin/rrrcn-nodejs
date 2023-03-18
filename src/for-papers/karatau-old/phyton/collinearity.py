import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
import sklearn as sklearn
from sklearn import preprocessing
csv= pd.read_csv('./src/for-papers/karatau-old/assets/FALCO/falco-dataset.csv')
df = preprocessing.normalize(csv)


dfCorr = df.corr()
filteredDf = dfCorr[((dfCorr >= .5) | (dfCorr <= -.5)) & (dfCorr !=1.000)]
for column in filteredDf.columns:
    if filteredDf[column].isna().sum() == len(filteredDf):
        filteredDf=filteredDf.drop(column, axis=1)
        filteredDf=filteredDf.drop(column)
# plt.figure(figsize=(15,5))
from statsmodels.stats.outliers_influence import variance_inflation_factor
import statsmodels.api as sm

X=list(df.columns)
nrows, ncols = len(X)+1, len(X)
hcell, wcell = 0.25,0.6 # tweak as per your requirements
hpad, wpad = 0.1, 0.1
plt.figure(figsize=(ncols*wcell+wpad, nrows*hcell+hpad))

sns.heatmap(filteredDf, annot=True, vmin=-1, vmax=1, center= 0,cmap= 'coolwarm')
plt.savefig('.local/outputs/FINAL_RFS/KARATAU-OLD-FALCO/collinearity.png')

plt.savefig('.local/outputs/FINAL_RFS/KARATAU-OLD-FALCO/collinearity2.png')

plt.show()

# ['world_cover', 'conv_april_2022',  'RIX', 'aspect', 'bio02', 'bio06', 'bio07', 'bio08', 'bio14', 'bio15', 'bio19', 'corr', 'cov', 'cti', 'elevation', 'entropy', 'geom', 'homogeneity', 'pielou', 'power_density_10', 'random', 'range', 'slope', 'spi', 'tpi', 'vrm', 'wind_speed_50', 'world_cover_Bare_sparse_vegetation', 'world_cover_Cropland', 'world_cover_Grassland', 'world_cover_Shrubland', 'world_cover_Tree_cover']
def vif (data, X):
    vif_data = pd.DataFrame()
    vif_data["feature"] = X.columns
    vif_data["VIF"] = [variance_inflation_factor(X.values, i)
                          for i in range(len(X.columns))]
    return(pd.DataFrame(vif_data))

vif=vif(df, df[X])
print(vif)
# with open('example.csv', 'w') as file:
#     writer = csv.DictWriter(file, fieldnames=["feature","vif"])
#     # Use writerows() not writerow()
#     writer.writeheader()
#     writer.writerows(vif)
vif=vif[vif['VIF'] > 10].round(3)
# plt.show()
