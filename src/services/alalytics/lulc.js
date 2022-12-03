const ee = require('@google/earthengine');
const util = require('util')
module.exports=()=> {
    var startDate = '2017-04-01';
    var endDate = ee.Date('2022-07-01');
    var areaPerPixel = ee.Image.pixelArea();
    var geometry =
        /* color: #ff0000 */
        /* displayProperties: [
          {
            "type": "rectangle"
          }
        ] */
        ee.Geometry.Polygon(
            [[[10.827071714345609, 51.73049767694755],
                [10.827071714345609, 51.71369593202651],
                [10.881145048085843, 51.71369593202651],
                [10.881145048085843, 51.73049767694755]]], null, false);

    var dw = ee.ImageCollection('COPERNICUS/S2_SR')
        .filterDate(startDate, endDate);

    var step = 3;

    var water_value_in_original_dataset = 6;

    var label_band_name = "SCL";

    var nMonths = ee.Number(endDate.difference(ee.Date(startDate), 'month')).subtract(1).round();


    var targets = ['Saturated or defective', 'Dark Area Pixels', 'Cloud Shadows', 'Vegetation', 'Bare Soils', 'Water', 'Clouds Low Probability / Unclassified', 'Clouds Medium Probability', 'Clouds High Probability', 'Cirrus', 'Snow / Ice'];
    var target_index = 5;
    var target = "Water"

    function generate_collection(geometry, target_index) {

        var byMonth = ee.ImageCollection(
            ee.List.sequence(0, nMonths, step).map(function (n) {

                var ini = ee.Date(startDate).advance(n, 'month');
                var end = ini.advance(step, 'month');

                var period_available = dw.filterDate(ini, end)
                    .filterBounds(geometry)
                    .select(label_band_name);

                var image = ee.Algorithms.If(period_available.size().gt(0),
                    period_available.reduce(ee.Reducer.mode()).eq(target_index).selfMask().multiply(areaPerPixel).divide(1e6).set('system:time_start', ini),
                    ee.Image().addBands(-1).rename(["label_mode", "constant"]).select("label_mode").eq(water_value_in_original_dataset).selfMask().set('system:time_start', ini))
                return image
            })
        );
        return byMonth;
    }


    function generate_chart(byMonth, geometry, target) {
        var chart = ui.Chart.image.series({
            imageCollection: byMonth.map(function (image) {
                return image.rename([target])
            }),
            region: geometry,
            scale: 100,
            reducer: ee.Reducer.sum(),

        }).setOptions({
            vAxis: {title: target + ' area over time'}
        })
        return chart;
    }


    function generate_thumbnails(byMonth, geometry) {

        var args = {
            crs: 'EPSG:4326',
            dimensions: '500',
            region: geometry,
            framesPerSecond: 1
        };

        // var text = require('users/gena/packages:text'); // Import gena's package which allows text overlay on image

        // var annotations = [
        //     {position: 'left', offset: '1%', margin: '1%', property: 'label', scale: Map.getScale() * 2}
        // ];

        function addText(image) {

            var timeStamp = ee.Date(image.get('system:time_start')).format().slice(0, 7); // get the time stamp of each frame. This can be any string. Date, Years, Hours, etc.
            timeStamp = ee.String(timeStamp); //convert time stamp to string

            image = image.visualize({ //convert each frame to RGB image explicitly since it is a 1 band image
                forceRgbOutput: true,
                min: 0,
                max: 1,
                palette: ['steelblue', 'white']
            }).set({'label': timeStamp}); // set a property called label for each image
            return image
        }

        var collection = byMonth.map(addText)//add time stamp to all images

        // collection.evaluate((res)=>console.log(util.inspect(res,false,null,true)))
        return collection;

    }


    function control(panel) {


        //define the reset button and add it to the map


        //define chart and thumbnail widgets
        var chart;
        var thumbnails;
        var land_use_type;
        //the refresh function centers the map the to selected region
        //removes the old widgets
        //generates a new image collection
        //generates a new line chart
        //and generates a new thumbnail series
        function refresh(geometry, target) {
            // Map.centerObject(geometry);
            // panel.remove(chart);
            // panel.remove(thumbnails);
            // panel.remove(land_use_type);
            //
            //
            // // define the drop down menu and add it to the panel
            // land_use_type = ui.Select({items: targets, placeholder: target});
            //
            // //when the user change the land type, refresh
            // land_use_type.onChange(function (value) {
            //     target = value;
            //     refresh(geometry, target)
            //
            // })
            // panel.add(land_use_type);
            target_index = targets.indexOf(target);

            var ini = ee.Date(startDate).advance(0, 'month');
            var end = ini.advance(3, 'month');

            var period_available = dw.filterDate(ini, end)
                .filterBounds(geometry)
                .select(label_band_name).getInfo();
            console.log(util.inspect(period_available,false,null,true))

            var byMonth = generate_collection(geometry, target_index);
            const data=byMonth.map(function (image) { return image.rename([target]) }).map(it=> {
                const reduction=it.reduceRegion(ee.Reducer.sum(), geometry,100)
                return ee.Feature(null, {
                    [target]: reduction.get(target),
                    'system:time_start': it.get('system:time_start')
                })
            })
            data.evaluate(res=>
            console.log(util.inspect(res,false,null,true)))
            // thumbnails = generate_thumbnails(byMonth, geometry);
            // thumbnails.evaluate

        }

        refresh(geometry, target)


    }
    control()
}

