Editor.registerWidget( 'fire-asset', {
    is: 'fire-asset',

    behaviors: [EditorUI.focusable,EditorUI.droppable],

    hostAttributes: {
        'droppable': 'asset',
    },

    listeners: {
        'focus': '_onFocus',
        'blur': '_onBlur',
        'drop-area-enter': '_onDropAreaEnter',
        'drop-area-leave': '_onDropAreaLeave',
        'drop-area-accept': '_onDropAreaAccept',
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
        this._initDroppable(this.$.dropArea);
    },

    _onDragOver: function (event) {
        event.stopPropagation();

        this.highlighted = true;
        this.invalid = true;
    },

    _onDropAreaLeave: function (event) {
        event.stopPropagation();

        this.highlighted = false;
        this.invalid = false;
    },

    _onDropAreaEnter: function (event) {
        event.stopPropagation();
        
        this.highlighted = false;
        this.invalid = false;
    },

    _onDropAreaAccept: function (event) {
        event.stopPropagation();
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
