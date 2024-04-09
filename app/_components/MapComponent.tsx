"use client"
import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Draw } from 'ol/interaction'; // Importing Draw interaction
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import { never } from 'ol/events/condition';

const MapComponent: React.FC = () => {
  const mapElement = useRef<HTMLDivElement>(null); // Reference to the map container element
  const vectorSource = new VectorSource(); // Vector source to store drawn features
  const [drawType, setDrawType] = useState<'point' | 'polygon' | 'line'|"">(''); // State to manage the type of drawing

  useEffect(() => {
    if (mapElement.current) {
      // Initialize the map
      const map = new Map({
        target: mapElement.current,
        layers: [
          new TileLayer({
            source: new OSM() // OpenStreetMap layer
          }),
          new VectorLayer({
            source: vectorSource, // Vector layer to render vector features
            style: new Style({
              image: new Circle({
                radius: 6,
                fill: new Fill({ color: 'red' }), // Style for point features
                stroke: new Stroke({ color: 'white', width: 2 })
              }),
              fill: new Fill({ color: 'rgba(255, 0, 0, 0.2)' }), // Style for polygon fill
              stroke: new Stroke({ color: 'red', width: 2 }) // Style for polygon outline
            })
          })
        ],
        view: new View({
          center: fromLonLat([ 77.20014294602662,28.61593045437785]), // Initial map center (lon, lat)
          zoom: 7 // Initial map zoom level
        })
      });

      const drawInteraction = new Draw({
        source: vectorSource,
        type: drawType === 'point' ? 'Point' : drawType === 'polygon' ? 'Polygon' : 'LineString'
      });
      map.addInteraction(drawInteraction); // Add draw interaction to the map

      drawInteraction.on('drawend', (event) => {
        const geometry = event.feature.getGeometry()  // Get the drawn feature's geometry
      
        if (drawType === 'point') {
          // Handle point feature
          // @ts-ignore
          const coordinates = geometry.getCoordinates()   // Get coordinates of the point
          const lonLat = toLonLat(coordinates); // Convert coordinates to lon-lat format
      
          const [lon, lat] = lonLat; // Extract longitude and latitude
          const message = `Latitude: ${lat.toFixed(6)}, Longitude: ${lon.toFixed(6)}`; // Format coordinates
      
          alert(message); // Display coordinates in an alert
        } else if (drawType === 'polygon') {
          // Handle polygon feature
          const area = geometry?.getExtent() || [];
          const width = area[2] - area[0];
          const height = area[3] - area[1];
          const totalArea = width * height;
          const measurementText = `Area: ${totalArea.toFixed(2)} square meters`;
      
          alert(measurementText); // Display area measurement in an alert
        } else if (drawType === 'line') {
          // Handle line feature
          const length = geometry?.getExtent() || [];
          const measurementText = `Length: ${length[0].toFixed(2)} meters`;
      
          alert(measurementText); // Display length measurement in an alert
        }
      });

      map.on('click', (event) => {
        // Event listener for map click
        if (drawType === 'point') {
          const coordinates = toLonLat(event.coordinate); // Convert clicked coordinates to lon-lat
          const pointFeature = new Feature({
            geometry: new Point(fromLonLat(coordinates)) // Create a point feature
          });
          vectorSource.addFeature(pointFeature); // Add point feature to the vector source
        }
      });

      return () => {
        // Cleanup function
        map.removeInteraction(drawInteraction); // Remove draw interaction
        map.dispose(); // Dispose the map
      };
    }
  }, [drawType]);

  const handleDrawTypeChange = (type: 'point' | 'polygon' | 'line') => {
    // Function to handle draw type change
    setDrawType(type); // Update drawType state based on selected type
  };

  return (
    <div>
      <div className="grid w-52 absolute z-10 bg-white p-5 gap-2">
        <span className='text-center '>Select an option</span>
        <button className='bg-blue-500 text-white py-2 px-4 text-sm rounded-md' onClick={() => handleDrawTypeChange('point')}>
          [lat,long] of pointer
        </button>
        <button className='bg-blue-500 text-white py-2 px-4 rounded-md' onClick={() => handleDrawTypeChange('polygon')}>
          Area of polygon
        </button>
        <button className='bg-blue-500 text-white py-2 px-4 rounded-md' onClick={() => handleDrawTypeChange('line')}>
          length of line
        </button>
      </div>
      <div
        ref={mapElement}
        className="map"
        style={{ width: '100%', height: '100vh' }}
      />
    </div>
  );
};

export default MapComponent;

