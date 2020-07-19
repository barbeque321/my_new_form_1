import {fromLonLat} from 'ol/proj';
import shiftKeyOnly from 'ol/events';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {Draw, Modify, Snap} from 'ol/interaction';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';




function load() {
        console.log("load event detected!");
      }
//TODO: pobieranie współrzędnych punktów, polygonów i kółek  
//TODO: pobranie adresów wewnątrz koła/ polygonu?
//dodanie obsługi przycisku po upewenieniu się, że załadowano cały html
window.onload = function(){	  
		  
		load();	

		var siedziba = 0;
		
		var raster = new TileLayer({
			source: new OSM()
		});

		var source = new VectorSource({wrapX: false});

		var vector = new VectorLayer({
			source: source
		});

		//stworzenie mapy
		const map = new Map({
		  target: 'map',
		  layers: [raster, vector],
		  view: new View({
			center: fromLonLat([18.585847, 54.403101]),
			zoom: 12
		  })
		});
		
		document.getElementById("p1").addEventListener("click", myFunction);
		document.getElementById("p2").addEventListener("click", p2);
		
		var typeSelect = document.getElementById('type');
		var draw, snap; 
		
		function addInteraction() {
			var value = typeSelect.value;
			
			if (value !== 'None'){
				
				draw = new Draw({
				source: source,
				type: typeSelect.value,
				freehandCondition: shiftKeyOnly
			});			
			
			
			map.addInteraction(draw);
			snap = new Snap({source: source});
			map.addInteraction(snap);	
			
			//narysowanie max 2 elementów
			draw.on('drawstart', function () {
				
				if( source.getFeatures().length >=2){
					map.removeInteraction(draw);
					document.getElementById('type').value='None';
				}
			});
			
			}			
			
		}
		//zmiana wyboru
		typeSelect.onchange = function() {
		  map.removeInteraction(draw);
		  map.removeInteraction(snap);
		  addInteraction();			
		  
		};
		addInteraction();  
		  
		  
		var modify = new Modify({source: source});
		map.addInteraction(modify);
		
		//czyszczenie narysowanych elementów
		function p2(){
			source.clear();
			siedziba = 0;
		}
		
		  
		//funkcja pobierająca adres:
		function myFunction(){
			
			//TODO centrowanie mapy na wpisanym adresie!
			console.log(siedziba);
			
			if(siedziba < 1){
						
				var x = document.getElementById("adres").value;				
				var query = 'https://nominatim.openstreetmap.org/search?q='+x+'&format=jsonv2&polygon=1&addressdetails=1'			
					
				//nie wiem jak pogodzić zakresy JQuery z JS ale działa
				$.getJSON(query, function(data){	  
					  
					  if(data){
						  var lnglat = ([ data[0].lon, data[0].lat]);
						  //console.log(lnglat);				  
									  
						  var coord = fromLonLat(lnglat);
						  //console.log(coord);
						  
						  var p = new Feature(new Point(coord));				  
						  source.addFeature(p);				  
						  siedziba +=1;
					  }
				});
				
			}
			
		}	

		  
}
	  













