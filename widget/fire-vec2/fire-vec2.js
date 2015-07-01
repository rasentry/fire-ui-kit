Editor.registerWidget( 'fire-vec2', {
    is: 'fire-vec2',

    properties: {
        value: {
            type: Object,
            value: function () {
                return new Fire.Vec2(0,0);
            },
            notify: true,
        },

        disabled: {
            type: Boolean,
            value: false,
        },
    },
});
