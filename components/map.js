import React from 'react'
import mapboxgl from 'mapbox-gl'
import Head from 'next/head'
import firebase from 'firebase'
export default class Map extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            lng: 101.10,
            lat: 13.12,
            zoom: 4.5,
            hoveredData: null
        };
        this.map
    }
    async fetchData() {
        const db = firebase.firestore()
        await db.collection('app').doc('data').collection('survey')
            .where('timestamp', '>=', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000))
    }
    componentDidMount() {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_mapboxKey
        this.map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/townhall-th/ckjp7wsca4inq19pbfpm6leov',
            center: [this.state.lng, this.state.lat],
            zoom: this.state.zoom,
            maxBounds: [[83.271483, 4], [117, 22]],
            minZoom: 3,
        });
        this.map.scrollZoom.disable()
        this.map.dragRotate.disable()
        this.map.touchZoomRotate.disableRotation()
        this.map.addControl(new mapboxgl.NavigationControl({ showCompass: false, showZoom: true }))
        this.map.on('move', () => {
            this.setState({
                lng: this.map.getCenter().lng.toFixed(4),
                lat: this.map.getCenter().lat.toFixed(4),
                zoom: this.map.getZoom().toFixed(2)
            });
        });
        this.map.on('load', () => {
            // Add a geojson point source.
            // Heatmap layers also work with a vector tile source.
            this.map.addSource('provinces', {
                type: 'vector',
                url: 'mapbox://townhall-th.c5vzwe91'
            })
            this.map.addSource('provinces-label', {
                type: 'vector',
                url: 'mapbox://townhall-th.72khtg8y'
            })
            this.map.addSource('cases', {
                type: 'vector',
                url: 'mapbox://townhall-th.7ozyo5pa'
            })
            this.map.addLayer({
                'id': 'provinces-outline',
                'type': 'line',
                'source': 'provinces',
                'source-layer': 'thmapprovinceswithcentroidsid',
                'paint': {

                    'line-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        '#212121',
                        'rgba(255,255,255,0.2)'
                    ],
                    'line-width': 1
                }
            });
            this.map.addLayer({
                'id': 'province-label',
                'type': 'symbol',
                'source': 'provinces-label',
                'source-layer': 'provinces_centroids-ac2kba',
                'minzoom': 5,
                'layout': {
                    'text-field': ['get', 'PROV_NAMT'],
                    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                    'text-justify': 'center',
                    'text-size': 12
                },
                'paint': {
                    "text-color": "#ffffff",
                    "text-halo-width": 0.8,
                    'text-halo-blur': 1,
                    'text-halo-color': '#424242',
                    'text-opacity': ['interpolate', ['linear'], ['zoom'], 7.8, 1, 8, 0],
                }
            })
            this.map.addLayer({
                'id': 'amphoe-label',
                'type': 'symbol',
                'source': 'cases',
                'source-layer': 'amphoes-1z6vx7',
                'minzoom': 8,
                'layout': {
                    'text-field': ['get', 'A_NAME_T'],
                    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                    'text-radial-offset': 1,
                    'text-justify': 'auto',
                    'text-size': 14,

                },
                'paint': {
                    "text-color": "#ffffff",
                    "text-halo-width": 0.8,
                    'text-halo-blur': 1,
                    'text-halo-color': '#424242'
                }
            })
        }
        )

    }
    render() {
        return (
            <div>
                <Head>
                    <link href='https://api.mapbox.com/mapbox-gl-js/v2.0.1/mapbox-gl.css' rel='stylesheet' />
                </Head>
                <div ref={el => this.mapContainer = el} className='mapContainer' style={{ height: '100vh' }}>
                    <div onClick={() => this.resetMap()} className='reset-button'>
                        <button className='btn-icon'><img src='/fullscreen_exit-black.svg' alt='reset zoom' /></button>
                    </div>
                </div>
            </div>
        )
    }
}
