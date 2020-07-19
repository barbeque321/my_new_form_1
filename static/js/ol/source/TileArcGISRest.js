/**
 * @module ol/source/TileArcGISRest
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { createEmpty } from '../extent.js';
import { modulo } from '../math.js';
import { assign } from '../obj.js';
import { toSize, scale as scaleSize } from '../size.js';
import TileImage from './TileImage.js';
import { hash as tileCoordHash } from '../tilecoord.js';
import { appendParams } from '../uri.js';
/**
 * @typedef {Object} Options
 * @property {import("./Source.js").AttributionLike} [attributions] Attributions.
 * @property {number} [cacheSize] Tile cache size. The default depends on the screen size. Will be ignored if too small.
 * @property {null|string} [crossOrigin] The `crossOrigin` attribute for loaded images.  Note that
 * you must provide a `crossOrigin` value if you want to access pixel data with the Canvas renderer.
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image for more detail.
 * @property {Object<string,*>} [params] ArcGIS Rest parameters. This field is optional. Service defaults will be
 * used for any fields not specified. `FORMAT` is `PNG32` by default. `F` is `IMAGE` by
 * default. `TRANSPARENT` is `true` by default.  `BBOX`, `SIZE`, `BBOXSR`,
 * and `IMAGESR` will be set dynamically. Set `LAYERS` to
 * override the default service layer visibility. See
 * http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#/Export_Map/02r3000000v7000000/
 * for further reference.
 * @property {boolean} [hidpi=true] Use the `ol/Map#pixelRatio` value when requesting
 * the image from the remote server.
 * @property {import("../tilegrid/TileGrid.js").default} [tileGrid] Tile grid. Base this on the resolutions,
 * tilesize and extent supported by the server.
 * If this is not defined, a default grid will be used: if there is a projection
 * extent, the grid will be based on that; if not, a grid based on a global
 * extent with origin at 0,0 will be used.
 * @property {import("../proj.js").ProjectionLike} [projection] Projection. Default is the view projection.
 * @property {number} [reprojectionErrorThreshold=0.5] Maximum allowed reprojection error (in pixels).
 * Higher values can increase reprojection performance, but decrease precision.
 * @property {import("../Tile.js").LoadFunction} [tileLoadFunction] Optional function to load a tile given a URL.
 * The default is
 * ```js
 * function(imageTile, src) {
 *   imageTile.getImage().src = src;
 * };
 * ```
 * @property {string} [url] ArcGIS Rest service URL for a Map Service or Image Service. The
 * url should include /MapServer or /ImageServer.
 * @property {boolean} [wrapX=true] Whether to wrap the world horizontally.
 * @property {number} [transition] Duration of the opacity transition for rendering.  To disable the opacity
 * transition, pass `transition: 0`.
 * @property {Array<string>} [urls] ArcGIS Rest service urls. Use this instead of `url` when the ArcGIS
 * Service supports multiple urls for export requests.
 */
/**
 * @classdesc
 * Layer source for tile data from ArcGIS Rest services. Map and Image
 * Services are supported.
 *
 * For cached ArcGIS services, better performance is available using the
 * {@link module:ol/source/XYZ~XYZ} data source.
 * @api
 */
var TileArcGISRest = /** @class */ (function (_super) {
    __extends(TileArcGISRest, _super);
    /**
     * @param {Options=} opt_options Tile ArcGIS Rest options.
     */
    function TileArcGISRest(opt_options) {
        var _this = this;
        var options = opt_options ? opt_options : {};
        _this = _super.call(this, {
            attributions: options.attributions,
            cacheSize: options.cacheSize,
            crossOrigin: options.crossOrigin,
            projection: options.projection,
            reprojectionErrorThreshold: options.reprojectionErrorThreshold,
            tileGrid: options.tileGrid,
            tileLoadFunction: options.tileLoadFunction,
            tileUrlFunction: tileUrlFunction,
            url: options.url,
            urls: options.urls,
            wrapX: options.wrapX !== undefined ? options.wrapX : true,
            transition: options.transition
        }) || this;
        /**
         * @private
         * @type {!Object}
         */
        _this.params_ = options.params || {};
        /**
         * @private
         * @type {boolean}
         */
        _this.hidpi_ = options.hidpi !== undefined ? options.hidpi : true;
        /**
         * @private
         * @type {import("../extent.js").Extent}
         */
        _this.tmpExtent_ = createEmpty();
        _this.setKey(_this.getKeyForParams_());
        return _this;
    }
    /**
     * @private
     * @return {string} The key for the current params.
     */
    TileArcGISRest.prototype.getKeyForParams_ = function () {
        var i = 0;
        var res = [];
        for (var key in this.params_) {
            res[i++] = key + '-' + this.params_[key];
        }
        return res.join('/');
    };
    /**
     * Get the user-provided params, i.e. those passed to the constructor through
     * the "params" option, and possibly updated using the updateParams method.
     * @return {Object} Params.
     * @api
     */
    TileArcGISRest.prototype.getParams = function () {
        return this.params_;
    };
    /**
     * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
     * @param {import("../size.js").Size} tileSize Tile size.
     * @param {import("../extent.js").Extent} tileExtent Tile extent.
     * @param {number} pixelRatio Pixel ratio.
     * @param {import("../proj/Projection.js").default} projection Projection.
     * @param {Object} params Params.
     * @return {string|undefined} Request URL.
     * @private
     */
    TileArcGISRest.prototype.getRequestUrl_ = function (tileCoord, tileSize, tileExtent, pixelRatio, projection, params) {
        var urls = this.urls;
        if (!urls) {
            return undefined;
        }
        // ArcGIS Server only wants the numeric portion of the projection ID.
        var srid = projection.getCode().split(':').pop();
        params['SIZE'] = tileSize[0] + ',' + tileSize[1];
        params['BBOX'] = tileExtent.join(',');
        params['BBOXSR'] = srid;
        params['IMAGESR'] = srid;
        params['DPI'] = Math.round(params['DPI'] ? params['DPI'] * pixelRatio : 90 * pixelRatio);
        var url;
        if (urls.length == 1) {
            url = urls[0];
        }
        else {
            var index = modulo(tileCoordHash(tileCoord), urls.length);
            url = urls[index];
        }
        var modifiedUrl = url
            .replace(/MapServer\/?$/, 'MapServer/export')
            .replace(/ImageServer\/?$/, 'ImageServer/exportImage');
        return appendParams(modifiedUrl, params);
    };
    /**
     * @inheritDoc
     */
    TileArcGISRest.prototype.getTilePixelRatio = function (pixelRatio) {
        return this.hidpi_ ? /** @type {number} */ (pixelRatio) : 1;
    };
    /**
     * Update the user-provided params.
     * @param {Object} params Params.
     * @api
     */
    TileArcGISRest.prototype.updateParams = function (params) {
        assign(this.params_, params);
        this.setKey(this.getKeyForParams_());
    };
    return TileArcGISRest;
}(TileImage));
/**
 * @param {import("../tilecoord.js").TileCoord} tileCoord The tile coordinate
 * @param {number} pixelRatio The pixel ratio
 * @param {import("../proj/Projection.js").default} projection The projection
 * @return {string|undefined} The tile URL
 * @this {TileArcGISRest}
 */
function tileUrlFunction(tileCoord, pixelRatio, projection) {
    var tileGrid = this.getTileGrid();
    if (!tileGrid) {
        tileGrid = this.getTileGridForProjection(projection);
    }
    if (tileGrid.getResolutions().length <= tileCoord[0]) {
        return undefined;
    }
    if (pixelRatio != 1 && !this.hidpi_) {
        pixelRatio = 1;
    }
    var tileExtent = tileGrid.getTileCoordExtent(tileCoord, this.tmpExtent_);
    var tileSize = toSize(tileGrid.getTileSize(tileCoord[0]), this.tmpSize);
    if (pixelRatio != 1) {
        tileSize = scaleSize(tileSize, pixelRatio, this.tmpSize);
    }
    // Apply default params and override with user specified values.
    var baseParams = {
        'F': 'image',
        'FORMAT': 'PNG32',
        'TRANSPARENT': true
    };
    assign(baseParams, this.params_);
    return this.getRequestUrl_(tileCoord, tileSize, tileExtent, pixelRatio, projection, baseParams);
}
export default TileArcGISRest;
//# sourceMappingURL=TileArcGISRest.js.map