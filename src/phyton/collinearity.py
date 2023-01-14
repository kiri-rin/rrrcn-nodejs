import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
df= pd.read_csv('/home/kiri/IdeaProjects/rrrcn-ee-nodejs/.local/outputs/NEOPHRON_RF_PROB_DATASET2/dataset.csv')
df.sample(5)
dfCorr = df.drop(['id',"longitude","latitude"], axis=1).corr()
filteredDf = dfCorr[((dfCorr >= .5) | (dfCorr <= -.5)) & (dfCorr !=1.000)]
# for column in filteredDf.columns:
#     if filteredDf[column].isna().sum() == len(filteredDf):
#         filteredDf=filteredDf.drop(column, axis=1)
#         filteredDf=filteredDf.drop(column)
plt.figure(figsize=(15,5))
sns.heatmap(filteredDf, annot=True, vmin=-1, vmax=1, center= 0, cmap= 'coolwarm')
# plt.show()
from statsmodels.stats.outliers_influence import variance_inflation_factor
X=['Map_world_cover', 'NDVI_mean', 'Presence', 'RIX', 'aspect', 'bio02', 'bio06', 'bio07', 'bio08', 'bio14', 'bio15', 'bio19', 'corr', 'cov', 'cti', 'elevation', 'entropy', 'geom', 'homogeneity', 'pielou', 'power_density_10', 'random', 'range', 'slope', 'spi', 'tpi', 'vrm', 'wind_speed_50', 'world_cover_Bare_sparse_vegetation', 'world_cover_Cropland', 'world_cover_Grassland', 'world_cover_Shrubland', 'world_cover_Tree_cover']
def vif (data, X):
    vif_data = pd.DataFrame()
    vif_data["feature"] = X.columns
    vif_data["VIF"] = [variance_inflation_factor(X.values, i)
                          for i in range(len(X.columns))]
    return(pd.DataFrame(vif_data))

vif=vif(df, df[X])
print(vif)
vif=vif[vif['VIF'] > 10].round(3)
