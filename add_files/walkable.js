var Walkable = function() {
  this.mapDataFile = "data.json";
  this.mapData = [];
  this.currentPosition = null;
  this.margin = 45; // degree
  this.previewMargin = 80; // degree
  this.initialPositionId = 1;
  this.initialHorizontalView = -180;
  this.offsetDirection = 90; // North向いているのときのhlookAt * -1

  this.loadJson = function() {
    console.log('loading...');

    $.getJSON(this.mapDataFile, function(json){
      console.log('loaded');
      this.initialPositionId = json.config.initialPositionId;
      this.initialHorizontalView = json.config.initialHorizontalView;
      this.offsetDirection = json.config.offsetDirection;
      this.mapData = json.map;

      var krpano = this.getKrpano();
      if (krpano) {
        krpano.call("showArrows();");
      }

      // load first position
      this.loadNextPosition(this.initialPositionId);
    }.bind(this));
  };

  this.findPositionById = function(id) {
    var pos = this.mapData.find(function(element, index, array) {
      if (element.id === id) {
        return true;
      }
    });

    return pos;
  };

  this.getKrpano = function() {
    return document.getElementById("krpanoSWFObject");
  };

  this.isString = function(obj) {
    var cls = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && cls === 'String';
  };

  this.loadNextPosition = function(id) {
    var nextPos = this.findPositionById(id);
    var krpano = this.getKrpano();

    console.log('load scene=' + nextPos.scene);

    if (krpano) {
      if (this.currentPosition === null) {
        this.currentPosition = nextPos;
        krpano.call("loadNextScene(" + nextPos.scene + "," + this.initialHorizontalView + ");");
      } else {
        this.currentPosition = nextPos;
        krpano.call("loadNextScene(" + nextPos.scene + ");");
      }
    }
  };

  this.currentDirection = function(hlookAt, margin) {
    var direction = null;
    var hView = hlookAt;

    if (this.isString(hlookAt)) {
      hView = parseFloat(hlookAt);
    }
    //console.debug('hView=' + hView);

    hView += this.offsetDirection;

    if (hView > 360 || hView < - 360) {
      hView = hView - Math.floor(hView / 360) * 360;
    }
    if (hView < 0) {
      hView += 360.0;
    }

    console.debug('hView(offsetted)=' + hView);

    if (hView > (0 - margin / 2) && hView < (0 + margin / 2)) {
      direction = 'north';
    } else if (hView > (360 - margin / 2) && hView <= 360) {
      direction = 'north';
    } else if (hView > (90 - margin / 2) && hView < (90 + margin / 2)) {
      direction = 'east';
    } else if (hView > (180 - margin / 2) && hView < (180 + margin / 2)) {
      direction = 'south';
    } else if (hView > (270 - margin / 2) && hView < (270 + margin / 2)) {
      direction = 'west';
    }

    console.log('current direction=' + direction);
    return direction;
  };

  this.canMoveForward = function(hlookAt, pos, margin) {
    var curDirection = this.currentDirection(hlookAt, margin);

    if (curDirection === 'north' && pos.links.north) {
      return true;
    } else if (curDirection === 'east' && pos.links.east) {
      return true;
    } else if (curDirection === 'south' && pos.links.south) {
      return true;
    } else if (curDirection === 'west' && pos.links.west) {
      return true;
    }
    return false;
  };

  this.canMoveBackward = function(hlookAt, pos, margin) {
    var curDirection = this.currentDirection(hlookAt, margin);

    if (curDirection === 'north' && pos.links.south) {
      return true;
    } else if (curDirection === 'east' && pos.links.west) {
      return true;
    } else if (curDirection === 'south' && pos.links.north) {
      return true;
    } else if (curDirection === 'west' && pos.links.east) {
      return true;
    }
    return false;
  };

  this.canMoveRight = function(hlookAt, pos, margin) {
    var curDirection = this.currentDirection(hlookAt, margin);

    if (curDirection === 'north' && pos.links.east) {
      return true;
    } else if (curDirection === 'east' && pos.links.south) {
      return true;
    } else if (curDirection === 'south' && pos.links.west) {
      return true;
    } else if (curDirection === 'west' && pos.links.north) {
      return true;
    }
    return false;
  };

  this.canMoveLeft = function(hlookAt, pos, margin) {
    var curDirection = this.currentDirection(hlookAt, margin);

    if (curDirection === 'north' && pos.links.west) {
      return true;
    } else if (curDirection === 'east' && pos.links.north) {
      return true;
    } else if (curDirection === 'south' && pos.links.east) {
      return true;
    } else if (curDirection === 'west' && pos.links.south) {
      return true;
    }
    return false;
  };

  this.moveForward = function(hlookAt) {
    var pos = this.currentPosition;
    var curDirection = this.currentDirection(hlookAt, this.margin);

    if (curDirection === 'north' && pos.links.north) {
      this.loadNextPosition(pos.links.north);
    } else if (curDirection === 'east' && pos.links.east) {
      this.loadNextPosition(pos.links.east);
    } else if (curDirection === 'south' && pos.links.south) {
      this.loadNextPosition(pos.links.south);
    } else if (curDirection === 'west' && pos.links.west) {
      this.loadNextPosition(pos.links.west);
    }
  };

  this.moveBackward = function(hlookAt) {
    var pos = this.currentPosition;
    var curDirection = this.currentDirection(hlookAt, this.margin);

    if (curDirection === 'north' && pos.links.south) {
      this.loadNextPosition(pos.links.south);
    } else if (curDirection === 'east' && pos.links.west) {
      this.loadNextPosition(pos.links.west);
    } else if (curDirection === 'south' && pos.links.north) {
      this.loadNextPosition(pos.links.north);
    } else if (curDirection === 'west' && pos.links.east) {
      this.loadNextPosition(pos.links.east);
    }
  };

  this.moveRight = function(hlookAt) {
    var pos = this.currentPosition;
    var curDirection = this.currentDirection(hlookAt, this.margin);

    if (curDirection === 'north' && pos.links.east) {
      this.loadNextPosition(pos.links.east);
    } else if (curDirection === 'east' && pos.links.south) {
      this.loadNextPosition(pos.links.south);
    } else if (curDirection === 'south' && pos.links.west) {
      this.loadNextPosition(pos.links.west);
    } else if (curDirection === 'west' && pos.links.north) {
      this.loadNextPosition(pos.links.north);
    }
  };

  this.moveLeft = function(hlookAt) {
    var pos = this.currentPosition;
    var curDirection = this.currentDirection(hlookAt, this.margin);

    if (curDirection === 'north' && pos.links.west) {
      this.loadNextPosition(pos.links.west);
    } else if (curDirection === 'east' && pos.links.north) {
      this.loadNextPosition(pos.links.north);
    } else if (curDirection === 'south' && pos.links.east) {
      this.loadNextPosition(pos.links.east);
    } else if (curDirection === 'west' && pos.links.south) {
      this.loadNextPosition(pos.links.south);
    }
  };

  this.onViewChanged = function(hlookAt) {
    var krpano = this.getKrpano();
    var pos = this.currentPosition;
    var hView = hlookAt;

    if (pos === null) {
      console.log('current position is not set');
      return;
    }

    if (this.isString(hlookAt)) {
      hView = parseFloat(hlookAt);
    }
    console.log('hView=' + hView);
    console.dir(pos);

    if (krpano) {
      if (this.canMoveForward(hView, pos, this.margin)) {
        krpano.call("set(plugin[front].visible, true);");
        krpano.call("set(plugin[front].alpha, 0.5);");
        krpano.call("set(plugin[front].enable, true);");
        krpano.call("set(plugin[front].handcursor, true);");
      } else {
        if (this.canMoveForward(hView, pos, this.previewMargin)) {
          krpano.call("set(plugin[front].visible, true);");
          krpano.call("set(plugin[front].alpha, 0.25);");
          krpano.call("set(plugin[front].enable, false);");
          krpano.call("set(plugin[front].handcursor, false);");
        } else {
          krpano.call("set(plugin[front].visible, false);");
        }
      }
      if (this.canMoveRight(hView, pos, this.margin)) {
        krpano.call("set(plugin[right].visible, true);");
        krpano.call("set(plugin[right].alpha, 0.5);");
        krpano.call("set(plugin[right].enable, true);");
        krpano.call("set(plugin[right].handcursor, true);");
      } else {
        if (this.canMoveRight(hView, pos, this.previewMargin)) {
          krpano.call("set(plugin[right].visible, true);");
          krpano.call("set(plugin[right].alpha, 0.25);");
          krpano.call("set(plugin[right].enable, false);");
          krpano.call("set(plugin[right].handcursor, false);");
        } else {
          krpano.call("set(plugin[right].visible, false);");
        }
      }
      if (this.canMoveBackward(hView, pos, this.margin)) {
        krpano.call("set(plugin[back].visible, true);");
        krpano.call("set(plugin[back].alpha, 0.5);");
        krpano.call("set(plugin[back].enable, true);");
        krpano.call("set(plugin[back].handcursor, true);");
      } else {
        if (this.canMoveBackward(hView, pos, this.previewMargin)) {
          krpano.call("set(plugin[back].visible, true);");
          krpano.call("set(plugin[back].alpha, 0.25);");
          krpano.call("set(plugin[back].enable, false);");
          krpano.call("set(plugin[back].handcursor, false);");
        } else {
          krpano.call("set(plugin[back].visible, false);");
        }
      }
      if (this.canMoveLeft(hView, pos, this.margin)) {
        krpano.call("set(plugin[left].visible, true);");
        krpano.call("set(plugin[left].alpha, 0.5);");
        krpano.call("set(plugin[left].enable, true);");
        krpano.call("set(plugin[left].handcursor, true);");
      } else {
        if (this.canMoveLeft(hView, pos, this.previewMargin)) {
          krpano.call("set(plugin[left].visible, true);");
          krpano.call("set(plugin[left].alpha, 0.25);");
          krpano.call("set(plugin[left].enable, false);");
          krpano.call("set(plugin[left].handcursor, false);");
        } else {
          krpano.call("set(plugin[left].visible, false);");
        }
      }
    }
  };
};

var walkable = new Walkable();
