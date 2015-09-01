Editor.registerWidget( 'fire-node', {
    is: 'fire-node',

    behaviors: [EditorUI.focusable,EditorUI.droppable],

    hostAttributes: {
        'droppable': 'node',
        'single-drop': true,
    },

    listeners: {
        'focus': '_onFocus',
        'blur': '_onBlur',
        'click': '_onClick',
        'drop-area-enter': '_onDropAreaEnter',
        'drop-area-leave': '_onDropAreaLeave',
        'drop-area-accept': '_onDropAreaAccept',
    },

    properties: {
        value: {
            type: String,
            value: undefined,
            notify: true,
            observer: '_valueChanged',
        },

        type: {
            type: String,
            value: 'Unkown'
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

        this._nodeName = '';
    },

    _onDragOver: function (event) {
        var dragType = EditorUI.DragDrop.type(event.dataTransfer);
        if ( dragType !== 'node' ) {
            EditorUI.DragDrop.allowDrop( event.dataTransfer, false );
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        //
        if ( this.highlighted ) {
            if ( !this.invalid ) {
                EditorUI.DragDrop.updateDropEffect(event.dataTransfer, 'copy');
                EditorUI.DragDrop.allowDrop( event.dataTransfer, true );
            }
            else {
                EditorUI.DragDrop.updateDropEffect(event.dataTransfer, 'none');
                EditorUI.DragDrop.allowDrop( event.dataTransfer, false );
            }
        }
        else {
            EditorUI.DragDrop.updateDropEffect(event.dataTransfer, 'none');
            EditorUI.DragDrop.allowDrop( event.dataTransfer, false );
        }
    },

    _onClick: function ( event ) {
        event.stopPropagation();
        Editor.sendToAll('hierarchy:hint', this.value);
    },

    _onDropAreaEnter: function (event) {
        event.stopPropagation();

        var dragItems = event.detail.dragItems;

        if ( this._requestID ) {
            Editor.cancelWaitForReply(this._requestID);
            this._requestID = null;
        }

        this._requestID = Editor.waitForReply(
            'scene:query-node-info', dragItems[0], function ( info ) {
            this._requestID = null;
            this.highlighted = true;
            if ( this.type === 'Runtime.NodeWrapper' || this.type === 'Runtime.DisplayObjectWrapper' || this.type === info.type ) {
                this.invalid = false;
            } else {
                this.invalid = true;
            }
        }.bind(this));
    },

    _onDropAreaLeave: function (event) {
        event.stopPropagation();

        if ( this._requestID ) {
            Editor.cancelWaitForReply(this._requestID);
            this._requestID = null;
        }

        this.highlighted = false;
        this.invalid = false;
    },

    _onDropAreaAccept: function (event) {
        event.stopPropagation();

        if ( this._requestID ) {
            Editor.cancelRequestToCore(this._requestID);
            this._requestID = null;
        }

        this.highlighted = false;
        this.invalid = false;

        var dragItems = event.detail.dragItems;
        var uuid = dragItems[0];
        this.value = uuid;
    },

    _typeName: function (value) {
        value = value.substring( value.lastIndexOf('.') + 1 );
        var idx = value.indexOf('Wrapper');
        if ( idx !== -1 ) {
            value = value.substring( 0, idx );
        }
        return EditorUI.camelToDashCase(value).toLowerCase();
    },

    _nodeClass: function (value) {
        if (!value) {
            return 'null name';
        }
        return 'name';
    },

    _valueChanged: function () {
        if ( !this.value ) {
            this._nodeName = 'None';
            return;
        }

        if ( this._requestID ) {
            Editor.cancelWaitForReply(this._requestID);
            this._requestID = null;
        }

        this._requestID = Editor.waitForReply( 'scene:query-node-info', this.value, function ( info ) {
            this._requestID = null;
            this._nodeName = info.name;
        }.bind(this), 500);
    },

    _onBrowseClick: function (event) {
        event.stopPropagation();
        Editor.info('TODO');
    },
});
