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
      value: null,
      notify: true,
      observer: '_valueChanged',
    },

    typeid: {
      type: String,
      value: 'Unkown'
    },

    typename: {
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

  ready () {
    this._initFocusable(this);
    this._initDroppable(this.$.dropArea);

    this._nodeName = 'None';
    this._missed = false;
  },

  _onDragOver (event) {
    let dragType = EditorUI.DragDrop.type(event.dataTransfer);
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

  _onClick ( event ) {
    event.stopPropagation();
    Editor.sendToAll('hierarchy:hint', this._nodeID);
  },

  _onDropAreaEnter (event) {
    event.stopPropagation();

    let dragItems = event.detail.dragItems;

    if ( this._requestID ) {
      Editor.cancelWaitForReply('scene:query-node-info', this._requestID);
      this._requestID = null;
    }

    this.invalid = true;
    this._requestID = Editor.waitForReply(
      'scene:query-node-info',
      dragItems[0],
      this.typeid,
      info => {
        this._requestID = null;
        this.highlighted = true;
        if ( this.typeid !== 'cc.Node' ) {
          this.invalid = !info.compID;
        } else {
          this.invalid = false;
        }
        this._cacheNodeID = info.nodeID;
        this._cacheCompID = info.compID;
      }
    );
  },

  _onDropAreaLeave (event) {
    event.stopPropagation();

    if ( this._requestID ) {
      Editor.cancelWaitForReply('scene:query-node-info', this._requestID);
      this._requestID = null;
    }

    this.highlighted = false;
    this.invalid = false;
  },

  _onDropAreaAccept (event) {
    event.stopPropagation();

    if ( this._requestID ) {
      Editor.cancelWaitForReply('scene:query-node-info', this._requestID);
      this._requestID = null;
    }

    this.highlighted = false;
    this.invalid = false;

    let dragItems = event.detail.dragItems;
    let uuid = dragItems[0];
    if ( this.typeid !== 'cc.Node' ) {
      uuid = this._cacheCompID;
    }

    this._compID = this._cacheCompID;
    this._nodeID = this._cacheNodeID;

    this.set('value', uuid);
    if ( !uuid ) {
      this._nodeName = 'None';
      this._missed = false;
    }

    this.async(() => {
      this.fire('end-editing');
    },1);
  },

  _nodeClass (value,_missed) {
    if ( _missed ) {
      return 'missed name';
    }

    if ( !value ) {
      return 'null name';
    }

    return 'name';
  },

  _valueChanged () {
    if ( !this.value ) {
      this._nodeName = 'None';
      this._missed = false;
      return;
    }

    if ( this._requestID ) {
      Editor.cancelWaitForReply(this._requestID);
      this._requestID = null;
    }

    this._requestID = Editor.waitForReply(
      'scene:query-node-info',
      this.value,
      this.typeid,
      info => {
        this._requestID = null;
        this._nodeName = info.name;
        this._missed = info.missed;
        this._nodeID = info.nodeID;
        this._compID = info.compID;
        if ( info.missed ) {
          this._nodeName = 'Missing Reference';
        }
      },
      500
    );
  },

  _onBrowseClick (event) {
    event.stopPropagation();
    Editor.info('TODO');
  },
});
