library("sf")
library("sp")
library("spdep")
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))
getwd()
points <- st_read( "../assets/predictedObservations/predictedObservations-point.shp")
areas <- st_read( "../assets/merge-plots/merge-plots.shp", quiet=TRUE)


filteredPoints <- sf::st_filter(st_set_crs(points, 4269),st_set_crs(areas,4269))
filteredPoints
coords <-  remove.duplicates(as(filteredPoints,"Spatial")[9:10])

coords
class(coords)
nn<-knearneigh(coords, k=5)
nn
mydata_nb1 <- knn2nb(knearneigh(coords, k=5))
mydata_nb1

plot(mydata_nb1,coords,pch = 20,col=rgb(1,0,0,abs(coords$observed-coords$b1)/100))
plot(areas[0])
plot(coords,pch = 20,col=rgb(1,0,0,abs(coords$observed-coords$b1)/100),add=TRUE)
plot(coords,pch = 20,col=rgb(1,0,0,abs(coords$observed)/100),add=TRUE)
rf_residuals <- coords$observed-coords$b1
W <- nb2listw(mydata_nb1, style="W")
sim <-  moran.mc(rf_residuals, listw = W, nsim = 10000)

hist(sim$res,
     freq = TRUE,
     breaks = 20,
     xlim = c(-1,1),
     main = "Перестановочный тест Морана",
     xlab = "Случайный индекс Морана",
     ylab = "Частота появления",
     col = "steelblue")
abline(v = sim$statistic, col = "red")
moran.plot(rf_residuals, W)
moran.test(rf_residuals, W)
vars <- coords$observed
moran.plot(vars, nb2listw(mydata_nb1, style="W"))
moran.test(vars, nb2listw(mydata_nb1, style="W"))

