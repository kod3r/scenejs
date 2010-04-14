/**
 * Backend for projection nodes, creates context that holds the current
 * scene projection state
 */
SceneJS._backends.installBackend(
        new (function() {

            this.type = 'viewprojection';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
                ctx.viewTransform = (function() {

                    var transform;
                    var loaded;

                    ctx.events.onEvent("scene-activated", function() {
                        transform = {
                            matrix : SceneJS_math_identityMat4(),
                            frustum : new SceneJS_math_Frustum(SceneJS_math_identityMat4()),
                            fixed: true
                        };
                        loaded = false;
                    });

                    /** When a new program is activated we will need to lazy-load our current matrix
                     */
                    ctx.events.onEvent("program-activated", function() {
                        loaded = false;
                    });

                    /** When a program is deactivated we may need to re-load into the previously active program
                     */
                    ctx.events.onEvent("program-deactivated", function() {
                        loaded = false;
                    });

                    /**
                     * When geometry is about to draw we load our matrix if not loaded already
                     */
                    ctx.events.onEvent("geo-drawing", function() {
                        if (!loaded) {

                            /* Lazy-compute WebGL array
                             */
                            if (!transform.matrixAsArray) {
                                transform.matrixAsArray = new WebGLFloatArray(transform.matrix);
                            }

                            ctx.programs.setVar('scene_ViewProjectionMatrix', transform.matrixAsArray);

                            loaded = true;
                        }
                    });

                    return {

                        setTransform: function(t) {
                            transform = t;
                            loaded = false;
                        },

                        getTransform: function() {
                            return transform;
                        },

                        transformPoint3: function(v) {
                            return SceneJS_math_transformPoint3(transform.matrix, v);
                        }
                    };
                })();
            };

            this.setTransform = function(transform) {
                ctx.viewTransform.setTransform(transform);
            };

            this.getTransform = function() {
                return ctx.viewTransform.getTransform();
            };

        })());