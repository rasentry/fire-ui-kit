Editor.registerElement({
    behaviors: [EditorUI.focusable],

    listeners: {
        'focus': '_onFocus',
        'blur': '_onBlur',
        'focusin': '_onFocusIn',
        'keydown': '_onKeyDown',
    },

    properties: {
        value: {
            type: Object,
            value: function () {
                return { r:1, g:1, b:1, a:1 };
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

        if ( this._colorPicker ) {
            this._closeColorPicker();
        } else {
            this._openColorPicker();
        }
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

    _openColorPicker () {
        EditorUI.addHitGhost('cursor', '998', function () {
            this._closeColorPicker();
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

            var newValue;
            if ( this.value instanceof Fire.Color ) {
                newValue = new Fire.Color({
                    r: value_.r/255,
                    g: value_.g/255,
                    b: value_.b/255,
                    a: value_.a,
                });
            }
            else {
                newValue = {
                    r: value_.r/255,
                    g: value_.g/255,
                    b: value_.b/255,
                    a: value_.a,
                };
            }

            this.set( 'value', newValue );
        }.bind(this));

        Polymer.dom(this).appendChild(this._colorPicker);
        this._updateColorPicker();
    },

    _closeColorPicker () {
        if (this._colorPicker) {
            Polymer.dom(this).removeChild(this._colorPicker);
            this._colorPicker = null;
        }
        EditorUI.removeHitGhost();
        this.focus();
    },

    _onFocusIn: function ( event ) {
        this._setFocused(true);
    },

    _onKeyDown: function ( event ) {
        // space, enter
        if (event.keyCode === 13 || event.keyCode === 32) {
            event.preventDefault();
            event.stopPropagation();

            if ( this._colorPicker ) {
                this._closeColorPicker();
            } else {
                this._openColorPicker();
            }
        }
        // esc
        else if (event.keyCode === 27) {
            event.preventDefault();
            event.stopPropagation();

            if ( this._colorPicker ) {
                this._closeColorPicker();
            }
            else {
                this.setBlur();
                EditorUI.focusParent(this);
            }
        }
    },
});
