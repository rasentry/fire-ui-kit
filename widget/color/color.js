Editor.registerWidget( 'fire-color', {
    is: 'fire-color',

    behaviors: [EditorUI.focusable],

    listeners: {
        'focus': '_onFocus',
        'blur': '_onBlur',
        'focusin': '_onFocusIn',
    },

    properties: {
        value: {
            type: Object,
            value: function () {
                return new Fire.Color(1,1,1,1);
            },
            notify: true,
        },
    },

    ready: function () {
        this._initFocusable(this);
    },

    _backgroundStyle: function (r, g, b) {
        return 'background-color:' + chroma(this.value.r * 255|0, this.value.g * 255|0, this.value.b * 255|0).css('rgb') + ';';
    },

    _alphaStyle: function (a) {
        return 'width:' + (a / 1) * 100 + '%;';
    },

    _onColorClick: function ( event ) {
        event.stopPropagation();

        EditorUI.addHitGhost('cursor', '998', function () {
            if (this._colorPicker) {
                Polymer.dom(this).removeChild(this._colorPicker);
                this._colorPicker = null;
            }
            EditorUI.removeHitGhost();
        }.bind(this));

        this._colorPicker = document.createElement('color-picker');
        this._colorPicker.setColor({
            r: this.value.r * 255|0,
            g: this.value.g * 255|0,
            b: this.value.b * 255|0,
            a: this.value.a
        });
        this._colorPicker.addEventListener( 'value-changed', function (event) {
            var value_ = event.target.value;
            this.value = new Fire.Color(value_.r/255,
                                        value_.g/255,
                                        value_.b/255,
                                        value_.a);
        }.bind(this));

        Polymer.dom(this).appendChild(this._colorPicker);
        this._updateColorPicker();
    },

    _updateColorPicker: function () {
        window.requestAnimationFrame ( function () {
            if ( !this._colorPicker)
                return;

            var bodyRect = document.body.getBoundingClientRect();
            var elRect = this.getBoundingClientRect();
            var colorPickerRect = this._colorPicker.getBoundingClientRect();

            var style = this._colorPicker.style;
            style.position = 'fixed';
            style.left = (elRect.right - colorPickerRect.width) + 'px';
            style.zIndex = 999;

            if ( document.body.clientHeight - elRect.bottom <= colorPickerRect.height + 10 ) {
                style.top = (elRect.top - bodyRect.top - colorPickerRect.height - 10) + 'px';
            }
            else {
                style.top = (elRect.bottom - bodyRect.top + 10) + 'px';
            }

            this._updateColorPicker();
        }.bind(this) );
    },

    _onFocusIn: function ( event ) {
        this._setFocused(true);
    },
});
