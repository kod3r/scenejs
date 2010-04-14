/**
 * Scene node that specifies the current viewing volume and transform matrix
 */

(function() {
    SceneJS.frustum = function() {
        var cfg = SceneJS.utils.getNodeConfig(arguments);
        var backend = SceneJS._backends.getBackend('viewprojection');
        var transform;
        return function(scope) {
            if (!transform || cfg.fixed) {    // Memoize matrix if node config is constant
                var params = cfg.getParams(scope);
                var volume = {
                    xmin: params.left || -1.0,
                    xmax: params.right || 1.0,
                   ymin: params.bottom || -1.0,
                    ymax: params.top || 1.0,
                    zmin: params.near || 0.1,
                    zmax: params.far || 1000.0
                };
                var tempMat = SceneJS_math_frustumMatrix4(
                        volume.xmin,
                        volume.xmax,
                        volume.ymin,
                        volume.ymax,
                        volume.zmin,
                        volume.zmax
                        );
                transform = {
                    matrix: tempMat,
                    frustum : new SceneJS_math_Frustum(tempMat),
                    volume: volume
                };
            }
            var prevTransform = backend.getTransform();
            backend.setTransform(transform);
            SceneJS.utils.visitChildren(cfg, scope);
            backend.setTransform(prevTransform);
        };
    };

})();