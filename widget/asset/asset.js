Editor.registerWidget( 'fire-asset', {
    is: 'fire-asset',

    behaviors: [EditorUI.focusable],

    listeners: {
        'focus': '_onFocus',
        'blur': '_onBlur',
    },

    properties: {
        value: {
            type: String,
            value: '',
        },

        type: {
            type: String,
            value: 'Fire.asset'
        },

        highlighted: {
            type: Boolean,
            value: false,
            reflectToAttribute: true,
        },

        invalid: {
            type: Boolean,
            value: false,
            reflectToAttribute: true,
        }
    },

    ready: function () {
        this._initFocusable(this);
    },

    _dragOver: function (event) {
        event.stopPropagation();

        this.highlighted = true;
        this.invalid = true;
    },

    _dragLeave: function (event) {
        event.stopPropagation();

        this.highlighted = false;
        this.invalid = false;
    },

    _dropDone: function (event) {
        event.stopPropagation();

        this.highlighted = false;
        this.invalid = false;
    },

    _isNullClass: function (value) {
        if (!value) {
            return 'null';
        }
        return 'text';
    },

    _isNullText: function (value) {
        if (!value) {
            return 'None';
        }
        return value;
    },

    _browseClick: function (event) {
        event.stopPropagation();

        this.fire('browse');
    },

});
