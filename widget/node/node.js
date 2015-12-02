'use strict';

Editor.registerElement({
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
        },
    },

    ready: function () {
        this._initFocusable(this);
        this._initDroppable(this.$.dropArea);

        this._nodeName = '';
        this._missed = false;
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
            Editor.cancelWaitForReply('scene:query-node-info', this._requestID);
            this._requestID = null;
        }

        this._requestID = Editor.waitForReply('scene:query-node-info', dragItems[0], function ( info ) {
            this._requestID = null;
            this.highlighted = true;
            if ( this.type === info.type ) {
                this.invalid = false;
            } else {
                // TODO
                // this.invalid = !(info.type === this.type || this.extends.indexOf(info.type) !== -1);
            }
        }.bind(this));
    },

    _onDropAreaLeave: function (event) {
        event.stopPropagation();

        if ( this._requestID ) {
            Editor.cancelWaitForReply('scene:query-node-info', this._requestID);
            this._requestID = null;
        }

        this.highlighted = false;
        this.invalid = false;
    },

    _onDropAreaAccept: function (event) {
        event.stopPropagation();

        if ( this._requestID ) {
            Editor.cancelWaitForReply('scene:query-node-info', this._requestID);
            this._requestID = null;
        }

        this.highlighted = false;
        this.invalid = false;

        var dragItems = event.detail.dragItems;
        var uuid = dragItems[0];
        this.set('value', uuid);

        this.async(() => {
          this.fire('end-editing');
        },1);
    },

    _nodeClass: function (value,_missed) {
        if ( _missed ) {
            return 'missed name';
        }

        if ( !value ) {
            return 'null name';
        }

        return 'name';
    },

    _valueChanged: function () {
        if ( !this.value ) {
            this._nodeName = 'None';
            this._missed = false;
            return;
        }

        if ( this._requestID ) {
            Editor.cancelWaitForReply(this._requestID);
            this._requestID = null;
        }

        this._requestID = Editor.waitForReply( 'scene:query-node-info', this.value, function ( info ) {
            this._requestID = null;
            this._nodeName = info.name;
            this._missed = info.missed;
            if ( info.missed ) {
                this._nodeName = 'Missing Reference';
            }
        }.bind(this), 500);
    },

    _onBrowseClick: function (event) {
        event.stopPropagation();
        Editor.info('TODO');
    },
});
