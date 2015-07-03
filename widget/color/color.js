Editor.registerWidget( 'fire-color', {
    is: 'fire-color',

    behaviors: [EditorUI.focusable],

    listeners: {
        'focus': '_onFocus',
        'blur': '_onBlur',
    },

    properties: {
        value: {
            type: Object,
            value: function () {
                return new Fire.Color(1,1,1,1);
            },
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

    _showColorPicker: function () {
        EditorUI.addHitGhost('cursor', '998', function () {
            if (this.colorPicker) {
                this.colorPicker.close();
                this.colorPicker = null;
            }
            EditorUI.removeHitGhost();
        }.bind(this));

        this.colorPicker = document.createElement('color-picker');
        this.colorPicker.setColor({
            r: this.value.r * 255|0,
            g: this.value.g * 255|0,
            b: this.value.b * 255|0,
            a: this.value.a
        });

        this.colorPicker.addEventListener('value-changed',function (event) {
            var value_ = event.target.value;
            this.value = new Fire.Color(value_.r/255,value_.g/255,value_.b/255,value_.a);
        }.bind(this));
        this.appendChild(this.colorPicker);
        this.updateColorPicker();
    },

    updateColorPicker: function () {
        window.requestAnimationFrame ( function () {
            if ( !this.colorPicker)
                return;

            var bodyRect = document.body.getBoundingClientRect();
            var elRect = this.getBoundingClientRect();
            var menuRect = this.colorPicker.getBoundingClientRect();

            var style = this.colorPicker.style;
            style.position = "fixed";
            style.right = (bodyRect.right - elRect.right) + "px";
            style.zIndex = 999;

            if ( document.body.clientHeight - elRect.bottom <= menuRect.height + 10 ) {
                style.top = (elRect.top - bodyRect.top - menuRect.height - 5) + "px";
            }
            else {
                style.top = (elRect.bottom - bodyRect.top + 5) + "px";
            }

            this.updateColorPicker();
        }.bind(this) );
    },
});
