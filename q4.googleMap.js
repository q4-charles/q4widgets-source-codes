(function ($) {
    /**
     * An interactive map using google's map API. Location and data populated through a fusionTable or google sheet.
     *
     * Version 1.2.3 or later uses Google Sheet
     * Version 1.1.3 or earlier uses Fusion Table
     *
     * @class q4.googleMap
     * @version 1.2.4
     * @requires [Markerclusterer.js_(optional)](lib/markerclusterer.js)
     * @requires [Markerwithlabel.js_(optional)](lib/markerwithlabel.js)
     * @example
     * This example uses multiple makers with fancybox as the popout google's info window is disabled
     *
     * ---
     *<div id='map' class='module-googlemap' style="height: 500px;"></div>
     *<div class="module-googlemap_legends-container">
     *    <ul class="module-googlemap_legends">
     *        <li class="module-googlemap_legend data1" data-category="data1">Legend 1</li>
     *        <li class="module-googlemap_legend data2" data-category="data2">Legend 2</li>
     *        <li class="module-googlemap_legend data3" data-category="data3">Legend 3</li>
     *        <li class="module-googlemap_legend data4" data-category="data4">Legend 4</li>
     *        <li class="module-googlemap_legend data5" data-category="data5">Legend 5</li>
     *        <li class="module-googlemap_legend data6" data-category="data6">Legend 6</li>
     *        <li class="module-googlemap_legend data7" data-category="data7">Legend 7</li>
     *        <li class="module-googlemap_legend data8" data-category="data8">Legend 8</li>
     *    </ul>
     *</div>
     *<div class="map_fancy-popout-container"></div>
     *<script>
     *
     *function initMap() {
     *    $('.module-googlemap').googleMap({
     *        fusionTable: '', // sheeetID: '',
     *        apiKey: '',
     *        fusionColumns: function(i, col) {
     *            var cols = {
     *                'index': i,
     *                'markerCategory': col[0],
     *                'cat': col[1],
     *                'title': col[2],
     *                'address': col[3],
     *                'latlng': new google.maps.LatLng(parseFloat(col[4]), parseFloat(col[5])),
     *                'htmlContent': col[6]
     *            }
     *            return cols;
     *        },
     *        usePopout: true,
     *        fancyClass: 'fancyClass-map',
     *        popoutTemplateID: '#map-popout',
     *        popoutContainer: '.map_fancy-popout-container',
     *        popoutTemplate: (
     *            '<div id="map-popout{{index}}" class="map-popout_content">' +
     *               '<div class="module-googlemap_category-content {{markerCategory}}"' +
     *                   '{{{htmlContent}}}' +
     *               '</div>' +
     *            '</div>'
     *        ),
     *        useInfoWindow: false,
     *        infoWindowHover: true,
     *        useMarkerCategories: true,
     *        markerCategories: {
     *            'default': '/files/js/property_map/purple.png',
     *            'data1': '/files/js/property_map/darkblue.png',
     *            'data2': '/files/js/property_map/royalblue.png',
     *            'data3': '/files/js/property_map/lightgreen.png',
     *            'data4': '/files/js/property_map/orange.png',
     *            'data5': '/files/js/property_map/green.png',
     *            'data6': '/files/js/property_map/redorange.png',
     *            'data7': '/files/js/property_map/gold.png',
     *            'data8': '/files/js/property_map/purple.png'
     *        },
     *        mapOpts: {
     *            center: {
     *                lat: 0,
     *                lng: 0
     *            },
     *            disableDefaultUI: true,
     *            scrollwheel: false,
     *            zoom: 6,
     *            minZoom: 0,
     *            maxZoom: 21,
     *            styles: []
     *        },
     *        complete: function(e, g) {
     *            var map = g.map,
     *                markers = g.markers;
     *
     *            $('.module-googlemap_legend').on('click', function() {
     *                var li = $(this),
     *                    category = li.data('category'),
     *                    bounds = new google.maps.LatLngBounds();
     *
     *                li.toggleClass('js--selected').siblings().removeClass('js--selected');
     *
     *                $.each(markers, function(i, marker) {
     *                    if (li.hasClass('js--selected')) {
     *                        if (category === marker.category) {
     *                            marker.setVisible(true);
     *                            bounds.extend(marker.position);
     *                        } else marker.setVisible(false);
     *                    } else {
     *                        marker.setVisible(true);
     *
     *                        bounds.extend(marker.position);
     *
     *                        map.fitBounds(bounds);
     *                        map.panToBounds(bounds);
     *                        map.setZoom(6);
     *
     *                        $('.map-popout_content').hide();
     *                    }
     *                });
     *
     *                if (li.hasClass('js--selected')) {
     *                    map.fitBounds(bounds);
     *                    map.panToBounds(bounds);
     *                    map.setZoom(7);
     *                }
     *            })
     *        }
     *    });
     *}
     *</script>
     *<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=APIKEYHERE&language=en&callback=initMap" async defer></script>
     */
    $.widget("q4.googleMap", /** @lends q4.googleMap */ {
        options: {
            /**
             * An id selector for the google map container.
             * @type {string}
             * @default
             */
            containerID: 'map',
            /**
             * A reference to the docid of the fusion table shouldn't be used with sheetID. DEPRECATED.
             * @type {string}
             */
            fusionTable: '',
            /**
             * A reference to the docid of the google sheets
             * @type {string}
             */
            sheetID: '',
            /**
             * Local array of data that will be used instead of google sheets array.
             * @type {array}
             * @default null
             * @example
             * localData:[
             *      ["Yaurichocha","-12.9055987","-75.2917978"],
             *      ["Yaurichocha","-12.9055987","-75.2917978"],
             *      ["Yaurichocha","-12.9055987","-75.2917978"]
             * ],
             */
            localData: null,
            /**
             * Api Key for use with the fusion table, get from Google Dev Console
             */
            apiKey: '',
            /**
             * If set to true the info window option will be opened when clicking or hovering over the markers
             * @type {boolean}
             * @default
             */
            useInfoWindow: true,
            /**
             * If set to true the info window for each marker will be shown on hover. If false, info window will open on click.
             * @type {boolean}
             * @default
             */
            infoWindowHover: false,
            /**
             * If set to true the marker clusterer will be used. Requires markerclusterer.js plugin.
             * @type {boolean}
             * @default
             */
            useCluster: false,
            /**
             * If set to true the map will use the markerwithlabel.js plugin to create markers. Requires markerwithlabel.js plugin.
             * <br>Requires to use these keys 'markerLabel' and 'markerAnchor' within the fusionColumn schema.
             * <br>Labels can be customized using its 'marker-label' class.
             * @type {boolean}
             * @default
             * @example
             * useMarkerWithLabel: true,
             * fusionColumns: function(i, col) {
             *     'markerLabel': col[0],
             *     'markerAnchor': col[1] // "0,0"
             * }
             */
            useMarkerWithLabel: false,
            /**
             * If set to true the content will be outside the google map block. Fusion table requires to have a "label" column as well as an "anchor" column.
             * @type {boolean}
             * @default
             */
            usePopout: false,
            /**
             * If set to true a fancybox will open when markers are clicked else the content will be visible without fancybox.
             * @type {boolean}
             * @default
             */
            useFancybox: true,
            /**
             * A CSS class applied to the fancybox container when using popout.
             * @type {string}
             * @default
             */
            fancyClass: 'map-fancy',
            /**
             * If set to true the marker's title will be shown as a tooltip when hovering
             * @type {boolean}
             * @default
             */
            showMarkerTitle: false,
            /**
             * If set to true, will use markerCategories instead of markerImagePath. Enable to specify different marker icons, fusionColumns must include a reference to a key (should be in lowercase) in the markerCategories option
             * @type {boolean}
             * @default
             */
            useMarkerCategories: false,
            /**
             * A JSON object to specify different marker categories and icon urls. Overrides markerImagePath. Object key should reference category name and Object value should reference file path. Requires to have a 'default' key in addition to the custom categories.
             * @type {object}
             * @default
             */
            markerCategories: {
                default: '/files/js/property_map/pin-small.png'
            },
            /**
             * A directory string where the cluster images reside. Files should start with m and use a number one through five to indicate cluster icon size (ex. m1.png, m2.png....)
             * @type {string}
             * @default
             */
            clusterImagePath: '/files/js/property_map/m',
            /**
             * A directory string for the default marker's icon. Only used when useMarkerCategories is set to false.
             * @type {string}
             * @default
             */
            markerImagePath: '/files/js/property_map/pin-small.png',
            /**
             * A callback that fires before the map is rendered. Maps the column names from the fusion table to be used in the template. Required keys: latlng. Required keys depending on selected options: index, title, markerCategory
             * @type {function}
             * @default
             */
            fusionColumns: function (i, col) {
                return {
                    'index': i,
                    'propertyNumber': col[0],
                    'title': col[1],
                    'markerCategory': col[2],
                    'city': col[3],
                    'latlng': new google.maps.LatLng(parseFloat(col[4]), parseFloat(col[5])),
                    'description': col[6]
                }
            },
            /**
             * A string to specify the id being used for each marker's popoutTemplate
             * @type {string}
             * @default
             */
            popoutTemplateID: '#map-popout',
            /**
             * A selector for the container of the popouts
             * @type {string}
             * @default
             */
            popoutContainer: '.map-popout_container',
            /**
             * A selector for the content of the popouts
             * @type {string}
             * @default
             */
            popoutContent: '.map-popout_content',
            /**
             * A Mustache.js template for the each popouts. Tags are used from the fusionColumns. ID should match the popoutTemplateID followed by the {{index}} tag.
             * @type {string}
             * @default
             */
            popoutTemplate: (
                '<div id="map-popout{{index}}" class="map-popout_content">' +
                    '<h3 class="map-popout_property-number">Property #{{propertyNumber}}</h3>' +
                    '<h3 class="map-popout_location">{{city}}</h3>' +
                    '<p class="map-popout_description">{{description}}</p>' +
                '</div>'
            ),
            /**
             * A Mustache.js template for each marker info window. Tags are used from the fusionColumns
             * @type {string}
             * @default
             */
            infoWindowTemplate: (
                '<div class="map-info">' +
                    '<h4>{{city}}</h4>' +
                '</div>'
            ),
            /**
             * A set of Google map options. Zoom and Center is required to create a map
             * @type {object}
             * @default
             */
            mapOpts: {
                center: {
                    lat: 54.7657685,
                    lng: -101.8762148
                },
                zoom: 4,
                minZoom: 0,
                maxZoom: 21,
                scrollwheel: true,
                disableDefaultUI: false,
                zoomControl: true,
                styles: [{
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#f5f5f5"
                    }]
                }, {
                    "elementType": "labels.icon",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#616161"
                    }]
                }, {
                    "elementType": "labels.text.stroke",
                    "stylers": [{
                        "color": "#f5f5f5"
                    }]
                }, {
                    "featureType": "administrative.country",
                    "elementType": "geometry.stroke",
                    "stylers": [{
                        "color": "#808080"
                    }, {
                        "visibility": "on"
                    }]
                }, {
                    "featureType": "administrative.land_parcel",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "administrative.land_parcel",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#bdbdbd"
                    }]
                }, {
                    "featureType": "administrative.neighborhood",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "administrative.province",
                    "elementType": "geometry.stroke",
                    "stylers": [{
                        "color": "#808080"
                    }, {
                        "lightness": 30
                    }, {
                        "visibility": "on"
                    }, {
                        "weight": 0.5
                    }]
                }, {
                    "featureType": "landscape",
                    "elementType": "geometry.fill",
                    "stylers": [{
                        "color": "#f1f6ff"
                    }]
                }, {
                    "featureType": "landscape.natural.terrain",
                    "elementType": "geometry.fill",
                    "stylers": [{
                        "color": "#e2e9f3"
                    }, {
                        "visibility": "on"
                    }]
                }, {
                    "featureType": "poi",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "poi",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#eeeeee"
                    }]
                }, {
                    "featureType": "poi",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#757575"
                    }]
                }, {
                    "featureType": "poi.attraction",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "poi.business",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "poi.government",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "poi.park",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#e5e5e5"
                    }]
                }, {
                    "featureType": "poi.park",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#9e9e9e"
                    }]
                }, {
                    "featureType": "road",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "road",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#ffffff"
                    }]
                }, {
                    "featureType": "road.arterial",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#757575"
                    }]
                }, {
                    "featureType": "road.highway",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#dadada"
                    }]
                }, {
                    "featureType": "road.highway",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#616161"
                    }]
                }, {
                    "featureType": "road.local",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#9e9e9e"
                    }]
                }, {
                    "featureType": "transit.line",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#e5e5e5"
                    }]
                }, {
                    "featureType": "transit.station",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#eeeeee"
                    }]
                }, {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#c9c9c9"
                    }]
                }, {
                    "featureType": "water",
                    "elementType": "geometry.fill",
                    "stylers": [{
                        "color": "#bce6f9"
                    }]
                }, {
                    "featureType": "water",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#9e9e9e"
                    }]
                }]
            },
            /**
             * A callback that is fired after the map is rendered. Give's access to the map object and marker array.
             * @type {function}
             * @param {Event} [e] The event object.
             * @param {Object} [data] The data object to access both the map and marker ie. data.map & data.markers
             */
            complete: function (e, data) {}
        },
        _create: function () {
            this._createMap();
        },
        _createMap: function () {
            var inst = this,
                o = this.options;

            inst.map = new google.maps.Map(document.getElementById(o.containerID), o.mapOpts);

            if (o.localData) {
                inst._normalizeData(o.localData);
            } else {
                inst._getData();
            }
        },
        _getData: function () {
            var inst = this,
                o = this.options;

            var query = o.sheetID ? "SELECT * FROM " + o.sheetID : "SELECT * FROM " + o.fusionTable;
            var encodedQuery = encodeURIComponent(query);

            var url = o.sheetID ? ['https://webwidgets.q4api.com/v1/fusion'] : ['https://www.googleapis.com/fusiontables/v1/query'];
            url.push('?sql=' + encodedQuery);
            url.push('&key=' + inst.options.apiKey);
            o.fusionTable && url.push('&callback=?');

            $.ajax({
                url: url.join(''),
                dataType: o.sheetID ? 'json' : 'jsonp',
                success: function (data) {
                    if (data.rows !== undefined) {
                        inst._normalizeData(data.rows);
                    } else {
                        console.log("Table did not load");
                    }
                }
            });
        },
        _normalizeData: function (row) {
            var inst = this,
                o = this.options,
                locations = [],
                markers = [];

            $.each(row, function (index, column) {
                var fusionData = o.fusionColumns(index, column);
                locations.push(inst._createMarker(fusionData));
                markers.push(fusionData.index);
            });

            var markerCluster;
            if (o.useCluster) {
                markerCluster = new MarkerClusterer(inst.map, locations, {
                    imagePath: o.clusterImagePath
                });
            }

            $.each(locations, function (i, marker) {
                if (o.usePopout) {
                    google.maps.event.addListener(marker, 'click', function () {
                        inst._triggerPopouts(markers[i]);
                    });
                }
                if (o.useInfoWindow && o.infoWindowHover) {
                    google.maps.event.addListener(marker, 'mouseover', function () {
                        inst._closeExistingInfoWindow(locations);
                        inst._triggerInfoWindow(marker);
                    });
                    google.maps.event.addListener(marker, 'mouseout', function () {
                        inst._closeExistingInfoWindow(locations);
                    });
                }
                if (o.useInfoWindow && !o.infoWindowHover) {
                    google.maps.event.addListener(marker, 'click', function () {
                        inst._closeExistingInfoWindow(locations);
                        inst._triggerInfoWindow(marker);
                    });
                }
            });

            if (o.usePopout) {
                inst._renderItems(locations, o.popoutContainer, o.popoutTemplate);
            }

            inst._trigger('complete', inst, {map: inst.map, markers: locations});
        },
        _createMarker: function (fusionData) {
            var inst = this,
                o = this.options,
                markerGroupIcon,
                marker;

            if (o.useMarkerCategories) {
                markerGroupIcon = o.markerCategories[fusionData.markerCategory.toLowerCase()] ? o.markerCategories[fusionData.markerCategory.toLowerCase()] : o.markerCategories['default'];
            }

            if (o.useMarkerWithLabel) {
                var anchor;
                if (!fusionData.markerAnchor) {
                    anchor = new google.maps.Point(0, 0);
                } else {
                    var x = fusionData.markerAnchor.split(',')[0];
                    var y = fusionData.markerAnchor.split(',')[1];
                    anchor = new google.maps.Point(x, y);
                }

                marker = new MarkerWithLabel($.extend(true, {
                    map: inst.map,
                    position: fusionData.latlng,
                    icon: o.useMarkerCategories ? markerGroupIcon : o.markerImagePath,
                    title: o.showMarkerTitle ? fusionData.title : '',
                    labelContent: fusionData.markerLabel || '',
                    labelClass: 'marker-label',
                    labelInBackground: false,
                    labelAnchor: anchor
                }, fusionData));
            } else {
                marker = new google.maps.Marker($.extend(true, {
                    map: inst.map,
                    position: fusionData.latlng,
                    icon: o.useMarkerCategories ? markerGroupIcon : o.markerImagePath,
                    title: o.showMarkerTitle ? fusionData.title : ''
                }, fusionData));
            }

            if (o.useInfoWindow) {
                inst._createInfoWindow(marker);
            }

            return marker;
        },
        _createInfoWindow: function (marker) {
            var o = this.options;

            marker.infowindow = new google.maps.InfoWindow({
                content: Mustache.render(o.infoWindowTemplate, marker)
            });

            return marker;
        },
        _triggerInfoWindow: function (marker) {
            marker.infowindow.open(map, marker);
            marker.infoOpen = true;
        },
        _triggerPopouts: function (markerIndex) {
            var o = this.options;

            if (o.useFancybox) {
                $.fancybox.open({
                    content: $(o.popoutTemplateID + markerIndex),
                    wrapCSS: o.fancyClass
                });
            } else {
                $(o.popoutContainer).parent().addClass('js--active').find(o.popoutContent).addClass('js--hidden');
                $(o.popoutContainer).find(o.popoutTemplateID + markerIndex).removeClass('js--hidden');
            }
        },
        _closeExistingInfoWindow: function (locations) {
            $.each(locations, function (i, marker) {
                if (marker.infoOpen) {
                    marker.infowindow.close();
                }
            });
        },
        _renderItems: function (items, container, template) {
            var o = this.options,
                $container = $(container);

            $container.empty();

            if (items.length) {
                $.each(items, function (i, item) {
                    $container.append(Mustache.render(template, item));
                });
            } else $container.append(Mustache.render(o.noItemsTemplate));
        },
        destroy: function () {
            this.element.html('');
        },
        _setOption: function (option, value) {
            this._superApply(arguments);
        }
    });
})(jQuery);