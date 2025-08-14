

  /********************************************************
  Parse GeoJSON
  ********************************************************/
  function parseGeoJSON(text) {
    try {
      const features = geoJSONFormat.readFeatures(text, {
        dataProjection: 'EPSG:4326',      // If your data is indeed in 4326
        featureProjection: 'EPSG:3857'    // This is how it's displayed on the map
      });
      // Show on the map
            addFeaturesToMap(features);


      // Convert features back to a plain GeoJSON string in EPSG:4326
      convertedGeoJSON = geoJSONFormat.writeFeatures(features, {
                dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });



    } catch (err) {
      console.error('Error parsing GeoJSON:', err);
      alert('Failed to parse GeoJSON file.');
    }
  }

  /********************************************************
   * Parse KML
   ********************************************************/

  function parseKML(text) {
    try {
      const kmlFormat = new ol.format.KML();
      const features = kmlFormat.readFeatures(text, {
        dataProjection: 'EPSG:4326',    // KML is typically 4326
        featureProjection: 'EPSG:3857'
      });

            addFeaturesToMap(features);

      // Convert to GeoJSON (EPSG:4326)
      convertedGeoJSON = geoJSONFormat.writeFeatures(features, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });



    } catch (err) {
      console.error('Error parsing KML:', err);
      alert('Failed to parse KML file.');
    }
  }


  /********************************************************
   * Parse KMZ (zip) using JSZip
   ********************************************************/
  async function parseKMZ(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const kmlFileName = Object.keys(zip.files).find((n) =>
        n.toLowerCase().endsWith('.kml')
      );
      if (!kmlFileName) {
        alert('No .kml found inside the KMZ.');
        return;
      }
      const kmlText = await zip.file(kmlFileName).async('string');
      parseKML(kmlText);
    } catch (err) {
      console.error('Error parsing KMZ:', err);
      alert('Failed to parse KMZ file.');
    }
  }

  /********************************************************
  * parseShapefile
  ********************************************************/

  async function parseShapefile(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // You need shp.js or a similar library to parse Shapefiles in the browser
      // For example, see: https://github.com/calvinmetcalf/shapefile-js
      const result = await shp(arrayBuffer);
      // 'result' might be a single FeatureCollection or an object of multiple layers.

      // Convert that FeatureCollection to an OL feature array
      // Easiest is to convert it to a string, then read with OL's GeoJSON format
      let out = null;
      if (result.type === 'FeatureCollection') {
        out = JSON.stringify(result);
      } else {
        // if it's multiple layers, pick one or merge them
        // For simplicity, pick first valid FC
        for (const key in result) {
          if (result[key].type === 'FeatureCollection') {
            out = JSON.stringify(result[key]);
            break;
          }
        }
      }
      if (!out) {
        alert('No valid FeatureCollection found in Shapefile.');
        return;
      }
      // Now parse as if it's GeoJSON
      parseGeoJSON(out);
    } catch (err) {
      console.error('Error parsing Shapefile:', err);
      alert('Failed to parse Shapefile ZIP. Make sure .shp, .dbf, .prj, etc. are included.');
    }
  }




  /********************************************************
  * Area Calculate
  ********************************************************/
    function calArea(measure_overlay, overlayPosition, area) {
    var measure_label;
    measure_overlay.setPosition(overlayPosition);
    if (area > 10000) {
      measure_label = Math.round((area / 1000000) * 100) / 100 + ' KM\xB2';
    } else {
      measure_label = Math.round(area * 100) / 100 + ' M\xB2';
    }
    measure_overlay.element.innerHTML = '<b>' + measure_label + '</b>';
  }


    /********************************************************
  * Distance Calculate
  ********************************************************/

  function calDistance(measure_overlay, overlayPosition, length) {
    var measure_label;
    if (parseInt(length) == 0) {
      measure_overlay.setPosition([0, 0]);
    }
    else {
      measure_overlay.setPosition(overlayPosition);
      if (length > 100) {
        measure_label = Math.round((length / 1000) * 100) / 100 + ' KM';
      } else {
        measure_label = Math.round(length * 100) / 100 + ' M';
      }
      measure_overlay.element.innerHTML = '<b>' + measure_label + '</b>';
    }
  }



